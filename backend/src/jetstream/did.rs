use reqwest::Client;
use serde::Deserialize;
use std::time::Duration;
use tracing::info;

use crate::{Result, config};

#[derive(Clone)]
pub struct DidClient {
    client: Client,
    base_url: String,
}

impl DidClient {
    pub fn new(config: config::DidResolver) -> Result<Self> {
        if !config.enabled {
            info!("DID resolver client disabled");
            return Ok(Self {
                client: Client::new(),
                base_url: String::new(),
            });
        }

        info!("Initializing DID resolver client");

        let client = Client::builder()
            .user_agent(config.user_agent)
            .timeout(Duration::from_secs(config.timeout_seconds))
            .build()?;

        Ok(Self {
            client,
            base_url: config.base_url,
        })
    }

    pub async fn resolve_did(&self, did: String) -> Result<Vec<String>> {
        if self.base_url.is_empty() {
            return Ok(vec![]);
        }

        let response = self
            .client
            .get(&format!("{}{did}", self.base_url))
            .send()
            .await?;

        let body: DidResolution = response.json().await?;

        Ok(body.also_known_as)
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DidResolution {
    #[serde(default)]
    also_known_as: Vec<String>,
}
