use std::time::Duration;

use linkify::LinkFinder;
use reqwest::Client;
// Extends the `reqwest::RequestBuilder` to allow WebSocket upgrades.
use reqwest_websocket::{Message, RequestBuilderExt};
use serde::Deserialize;
use tokio_stream::StreamExt;
use tracing::{error, info};

use crate::{
    db::Database,
    models::{CreatePost, Interest},
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DidResolution {
    #[serde(default)]
    also_known_as: Vec<String>,
}

async fn resolve_did(did: String) -> Result<Vec<String>, reqwest::Error> {
    let response = Client::default()
        .get(&format!("https://plc.directory/{did}"))
        .send()
        .await?;
    let body = response.json::<DidResolution>().await?;
    Ok(body.also_known_as)
}

pub async fn subscribe_to_jetstream(db: &Database) {
    let response = Client::default()
        .get("wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post")
        .upgrade()
        .send()
        .await
        .unwrap();

    let mut websocket = response.into_websocket().await.unwrap();
    let mut interval = tokio::time::interval(Duration::from_secs(1));

    let mut interests = db.get_all_interests().await.unwrap();

    loop {
        tokio::select! {
            msg = websocket.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        let message = serde_json::from_str::<serde_json::Value>(&text).unwrap();
                        let parsed = ParsedMessage::new(message);

                        let interest_ids = parsed.matches_any_interest(&interests);
                        if !interest_ids.is_empty() {
                            // resolve the DID
                            let aka = resolve_did(parsed.did.clone()).await.unwrap();

                            info!("matches interest: {parsed:?}");

                            for interest_id in interest_ids {
                                db.create_post(CreatePost {
                                    did: parsed.did.clone(),
                                    cid: parsed.cid.clone(),
                                    rkey: parsed.rkey.clone(),
                                    created_at: parsed.created_at.clone(),
                                    text: parsed.text.clone(),
                                    langs: parsed.langs.clone(),
                                    urls: parsed.urls.clone(),
                                    tags: parsed.tags.clone(),
                                    interest_id,
                                    aka: aka.clone(),
                                })
                                .await
                                .unwrap();
                            }
                        }
                    }
                    Some(Err(e)) => {
                        error!("WebSocket error: {e}");
                        break;
                    }
                    None => {
                        error!("WebSocket connection ended");
                        break;
                    }
                    _ => {
                        error!("received other message type");
                    }
                }
            }
            _ = interval.tick() => {
                info!("retrieving interests");
                interests = db.get_all_interests().await.unwrap();
            }
        }
    }
}

#[derive(Debug)]
struct ParsedMessage {
    langs: Vec<String>,
    text: String,
    text_lower: String,
    created_at: String,
    urls: Vec<String>,
    tags: Vec<String>,
    did: String,
    cid: String,
    rkey: String,
}

impl ParsedMessage {
    fn new(message: serde_json::Value) -> Self {
        let commit = message
            .get("commit")
            .cloned()
            .unwrap_or_else(|| serde_json::Value::Object(Default::default()));
        let record = commit
            .get("record")
            .cloned()
            .unwrap_or_else(|| serde_json::Value::Object(Default::default()));

        let text = record
            .get("text")
            .cloned()
            .unwrap_or_else(|| serde_json::Value::String(Default::default()))
            .as_str()
            .unwrap_or_default()
            .to_string();

        // From the text, extract the hashtags, e.g. #bsky #bluesky
        let tags = text
            .split_whitespace()
            .filter(|s| s.starts_with('#'))
            .map(|s| s.to_string())
            .collect();

        let finder = LinkFinder::new();
        let urls: Vec<_> = finder
            .links(&text)
            .map(|l| l.as_str().to_string())
            .collect();

        Self {
            langs: record
                .get("langs")
                .cloned()
                .unwrap_or_else(|| serde_json::Value::Array(Default::default()))
                .as_array()
                .cloned()
                .unwrap_or_default()
                .iter()
                .map(|v| v.as_str().unwrap().to_string())
                .collect(),
            rkey: commit
                .get("rkey")
                .cloned()
                .unwrap_or_else(|| serde_json::Value::String(Default::default()))
                .as_str()
                .unwrap_or_default()
                .to_string(),
            text_lower: text.to_lowercase(),
            text,
            tags,
            created_at: commit
                .get("createdAt")
                .cloned()
                .unwrap_or_else(|| serde_json::Value::String(Default::default()))
                .as_str()
                .unwrap_or_default()
                .to_string(),
            urls,
            did: message
                .get("did")
                .cloned()
                .unwrap_or_else(|| serde_json::Value::String(Default::default()))
                .as_str()
                .unwrap_or_default()
                .to_string(),
            cid: commit
                .get("cid")
                .cloned()
                .unwrap_or_else(|| serde_json::Value::String(Default::default()))
                .as_str()
                .unwrap_or_default()
                .to_string(),
        }
    }

    fn matches_any_interest(&self, interests: &[Interest]) -> Vec<i64> {
        interests
            .iter()
            .filter(|i| self.matches_interest(i))
            .map(|i| i.id)
            .collect()
    }

    fn matches_interest(&self, interest: &Interest) -> bool {
        interest.keywords.iter().any(|k| {
            let k_lower = k.to_lowercase();
            self.text_lower.split_whitespace().any(|w| w == k_lower)
        })
    }
}
