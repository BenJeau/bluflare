use async_stream::try_stream;
use futures_util::{Stream, TryStreamExt, sink::SinkExt};
use reqwest::Client;
use reqwest_websocket::{Message, RequestBuilderExt, WebSocket};
use std::sync::LazyLock;
use tracing::{debug, info, warn};
use zstd::dict::DecoderDictionary;

use crate::{Result, config::Jetstream, jetstream::message::JetstreamMessage};

const DICTIONARY: &[u8] = include_bytes!("../zstd_dictionary");
const DECODER_DICTIONARY: LazyLock<DecoderDictionary<'static>> =
    LazyLock::new(|| DecoderDictionary::copy(DICTIONARY));

pub struct JetstreamClient {
    websocket: WebSocket,
}

impl JetstreamClient {
    pub async fn new(config: Jetstream) -> Result<Self> {
        let client = Client::new().get(&config.url()).upgrade().send().await?;

        let websocket = client.into_websocket().await?;
        info!("Connected to Jetstream at {}", config.url());

        Ok(Self { websocket })
    }

    pub fn read_message(&mut self) -> impl Stream<Item = Result<JetstreamMessage>> {
        try_stream! {
            while let Some(message) = self.websocket.try_next().await? {
                if let Some(jetstream_message) = self.handle_message(message).await {
                    yield jetstream_message;
                }
            }
        }
    }

    async fn handle_message(&mut self, message: Message) -> Option<JetstreamMessage> {
        match message {
            Message::Text(text) => JetstreamMessage::new(text),
            Message::Binary(items) => {
                let reader =
                    match zstd::Decoder::with_prepared_dictionary(&*items, &DECODER_DICTIONARY) {
                        Ok(d) => d,
                        Err(e) => {
                            warn!("Failed to create decompressor with dictionary: {e}");
                            return None;
                        }
                    };

                match std::io::read_to_string(reader) {
                    Ok(text) => JetstreamMessage::new(text),
                    Err(e) => {
                        warn!("Failed to decompress binary message: {e}");
                        None
                    }
                }
            }
            Message::Ping(_) => {
                if let Err(e) = self.websocket.send(Message::Pong(vec![])).await {
                    warn!("Received ping message, but failed to send pong message: {e}");
                } else {
                    debug!("Received ping message, sent pong message");
                }
                None
            }
            Message::Pong(items) => {
                warn!("Received pong message, ignoring: {items:?}");
                None
            }
            Message::Close { code, reason } => {
                warn!("Received close message, ignoring: {code:?} {reason:?}");
                None
            }
        }
    }
}
