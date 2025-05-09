mod config;
mod db;
mod error;
mod gemini;
mod jetstream;
mod layers;
mod models;
mod routes;
mod server;
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

    jetstream::start_processor(config.jetstream.clone(), state.db.clone());
    server::start_server(state).await
}
