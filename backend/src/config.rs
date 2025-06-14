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
    pub cors: Cors,
    pub frontend: Frontend,
    pub auth: Auth,
}

#[derive(Deserialize, Clone)]
pub struct Cors {
    pub allowed_origin: String,
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
pub struct Auth {
    pub enabled: bool,
    pub username: Option<String>,
    pub password_hash: Option<String>,
    pub cookie_expiry_minutes: Option<u64>,
    pub cookie_domain: Option<String>,
    pub cookie_secure: Option<bool>,
}

#[derive(Deserialize, Clone)]
pub struct Config {
    pub database: Database,
    pub server: Server,
    pub jetstream: Jetstream,
    pub gemini: Gemini,
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
