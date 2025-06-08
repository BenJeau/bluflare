use futures_util::{StreamExt, pin_mut};
use std::time::Duration;
use stream::JetstreamClient;
use tokio::time::sleep;
use tracing::{debug, error, info, warn};

use crate::{Result, db, state::AppState};

mod did;
pub mod message;
mod processor;
mod stream;

pub fn start_processor(state: AppState) {
    if !state.config.jetstream.enabled {
        info!("Jetstream is disabled, won't listen for posts");
        return;
    }

    tokio::spawn(async move {
        if let Err(err) = start_inner(state).await {
            error!("Error starting jetstream processor: {err}");
        }
    });
}

async fn start_inner(state: AppState) -> Result<()> {
    let processor = processor::Processor::new(state.config.jetstream.clone(), state.pool.clone())?;

    loop {
        let mut jetstream_client = match JetstreamClient::new(state.config.jetstream.clone()).await
        {
            Ok(client) => client,
            Err(error) => {
                error!(
                    "Error creating jetstream processor, will retry in {}s: {error}",
                    state.config.jetstream.reconnect_interval
                );
                sleep(Duration::from_secs(
                    state.config.jetstream.reconnect_interval,
                ))
                .await;
                continue;
            }
        };

        let stream = jetstream_client.read_message();
        pin_mut!(stream);

        info!("Starting jetstream processor");

        let mut interval = tokio::time::interval(Duration::from_secs(1));
        let mut topics = db::get_all_topics(&state.pool).await?;
        let mut counter = 0;

        loop {
            counter += 1;

            tokio::select! {
                message = stream.next() => {
                    match message {
                        Some(Ok(message)) => {
                            if let Err(err) = processor.process_message(message, topics.clone(), state.clone()) {
                                error!("Error processing message: {err}");
                            }
                        }
                        Some(Err(err)) => {
                            error!("Error reading message: {err}");
                            continue;
                        }
                        None => {
                            warn!("Stream closed, reconnecting...");
                            break;
                        }
                    }
                }
                _ = interval.tick() => {
                    debug!("retrieving topics");
                    match db::get_all_topics(&state.pool).await {
                        Ok(data) => topics = data,
                        Err(err) => {
                            error!("Error retrieving topics: {err}");
                            continue;
                        }
                    };
                }
            }

            if counter % 1000 == 0 {
                info!("Processed {counter} messages");
            }
        }
    }
}
