use axum::http::HeaderMap;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tracing::{info, warn};

use crate::{Result, config};

#[derive(Clone)]
pub struct GenericGeminiClient {
    client: Client,
    base_url: String,
}

impl GenericGeminiClient {
    pub fn new(config: &config::Gemini) -> Result<Self> {
        let api_key = std::env::var("BLUFLARE__GEMINI__API_KEY").unwrap_or_else(|_| {
            warn!("BLUFLARE__GEMINI__API_KEY is not set, gemini will not be used");
            "".to_string()
        });

        if api_key.is_empty() || !config.enabled {
            info!("Gemini client disabled");
            return Ok(Self {
                client: Client::new(),
                base_url: String::new(),
            });
        }

        info!("Initializing Gemini client");

        let mut headers = HeaderMap::new();
        headers.insert("x-goog-api-key", api_key.parse()?);

        let client = Client::builder()
            .user_agent(&config.user_agent)
            .timeout(Duration::from_secs(config.timeout_seconds))
            .default_headers(headers)
            .build()?;

        Ok(Self {
            client,
            base_url: config.base_url.clone(),
        })
    }

    pub async fn send_request(&self, prompt: String) -> Result<Option<String>> {
        if self.base_url.is_empty() {
            return Ok(None);
        }

        let request = GeminiRequest {
            contents: vec![Content {
                parts: vec![Part { text: prompt }],
            }],
        };

        let response = self
            .client
            .post(self.base_url.clone())
            .json(&request)
            .send()
            .await?
            .json::<GeminiResponse>()
            .await?;

        let content = response.candidates[0].content.parts[0].text.clone();

        Ok(Some(content))
    }
}

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
}

#[derive(Serialize, Deserialize)]
struct Content {
    parts: Vec<Part>,
}

#[derive(Serialize, Deserialize)]
struct Part {
    text: String,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Vec<Candidate>,
}

#[derive(Deserialize)]
struct Candidate {
    content: Content,
}
