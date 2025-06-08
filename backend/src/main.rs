mod auth;
mod config;
mod db;
mod error;
mod gemini;
mod jetstream;
mod layers;
mod models;
mod routes;
mod server;
mod slug;
mod state;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub use error::{Error, Result};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = config::Config::new()?;
    let state = state::AppState::new(config.clone()).await?;

    jetstream::start_processor(state.clone());
    server::start_server(state).await
}
