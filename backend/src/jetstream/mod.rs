use futures_util::{StreamExt, pin_mut};
use processor::Processor;
use std::time::Duration;
use stream::JetstreamClient;
use tokio::time::sleep;
use tracing::{debug, error, info, warn};

use crate::{config, db::Database};

mod did;
mod message;
mod processor;
mod stream;

pub fn start_processor(config: config::Jetstream, db: Database) {
    if !config.enabled {
        info!("Jetstream is disabled, won't listen for posts");
        return;
    }

    tokio::spawn(async move {
        let processor = processor::Processor::new(config.clone(), db.clone()).unwrap();
        start_inner(config, processor, db).await;
    });
}

async fn start_inner(config: config::Jetstream, processor: Processor, db: Database) {
    loop {
        let mut jetstream_client = match JetstreamClient::new(config.clone()).await {
            Ok(client) => client,
            Err(error) => {
                error!(
                    "Error creating jetstream processor, will retry in {}s: {error}",
                    config.reconnect_interval
                );
                sleep(Duration::from_secs(config.reconnect_interval)).await;
                continue;
            }
        };

        let stream = jetstream_client.read_message();
        pin_mut!(stream);

        info!("Starting jetstream processor");

        let mut interval = tokio::time::interval(Duration::from_secs(1));
        let mut interests = db.get_all_interests().await.unwrap();
        let mut counter = 0;
        loop {
            counter += 1;

            tokio::select! {
                message = stream.next() => {
                    match message {
                        Some(Ok(message)) => {
                            if let Err(err) = processor.process_message(message, interests.clone()) {
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
                    debug!("retrieving interests");
                    interests = db.get_all_interests().await.unwrap();
                }
            }

            if counter % 1000 == 0 {
                info!("Processed {counter} messages");
            }
        }
    }
}
