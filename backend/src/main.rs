mod db;
mod jetstream;
mod models;
mod routes;

use anyhow::Result;
use axum::{Router, ServiceExt, extract::Request};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize database
    let db = db::Database::new("sqlite:bluflare.db").await?;

    // Build our application with a route
    let app = Router::new()
        .nest("/api/interests", routes::interests_router())
        .with_state(db.clone());

    tokio::spawn(async move {
        jetstream::subscribe_to_jetstream(&db).await;
    });

    // Run it with hyper on localhost:3000
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("listening on {}", addr);

    axum::serve(
        tokio::net::TcpListener::bind(addr).await?,
        ServiceExt::<Request>::into_make_service_with_connect_info::<SocketAddr>(app),
    )
    .await?;

    Ok(())
}
