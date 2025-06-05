use figment::{
    Figment,
    providers::{Env, Format, Toml},
};
use serde::Deserialize;
use std::net::SocketAddr;
use tracing::info;

use crate::Result;

#[derive(Deserialize, Clone)]
pub struct Database {
    pub url: String,
}

#[derive(Deserialize, Clone)]
pub struct HttpSerer {
    pub enabled: bool,
    pub host: String,
    pub port: u16,
}

impl HttpSerer {
    pub fn address(&self) -> Result<SocketAddr> {
        let address = format!("{}:{}", self.host, self.port).parse()?;

        Ok(address)
    }
}

#[derive(Deserialize, Clone)]
pub struct Server {
    pub http: HttpSerer,
}

#[derive(Deserialize, Clone)]
pub struct DidResolver {
    pub enabled: bool,
    pub base_url: String,
    pub timeout_seconds: u64,
    pub user_agent: String,
}

#[derive(Deserialize, Clone)]
pub struct Jetstream {
    pub enabled: bool,
    pub base_url: String,
    pub compress: bool,
    pub wanted_collections: Vec<String>,
    pub reconnect_interval: u64,
    pub did_resolver: DidResolver,
}

impl Jetstream {
    pub fn url(&self) -> String {
        format!(
            "{}?compress={}&{}",
            self.base_url,
            self.compress,
            self.wanted_collections
                .iter()
                .map(|c| format!("wantedCollections={c}"))
                .collect::<Vec<String>>()
                .join("&")
        )
    }
}

#[derive(Deserialize, Clone)]
pub struct Gemini {
    pub enabled: bool,
    pub base_url: String,
    pub timeout_seconds: u64,
    pub user_agent: String,
}

#[derive(Deserialize, Clone, Default)]
pub struct Frontend {
    pub enabled: bool,
}

#[derive(Deserialize, Clone)]
pub struct Config {
    pub database: Database,
    pub server: Server,
    pub jetstream: Jetstream,
    pub gemini: Gemini,
    pub frontend: Frontend,
}

impl Config {
    pub fn new() -> figment::error::Result<Self> {
        info!("Fetching config");

        Figment::new()
            .merge(Toml::string(include_str!("../config.toml")))
            .merge(Env::prefixed("BLUFLARE__").split("__"))
            .extract()
    }
}
