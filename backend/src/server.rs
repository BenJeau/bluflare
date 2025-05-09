use std::net::SocketAddr;
use tokio::net::TcpListener;
use tracing::info;

use crate::{Result, routes::router, state::AppState};

pub async fn start_server(state: AppState) -> Result<()> {
    if !state.config.server.http.enabled {
        info!("Server is disabled, won't listen for HTTP requests");
        return std::future::pending().await;
    }

    let addr = state.config.server.http.address()?;
    let listener = TcpListener::bind(addr).await?;
    info!("Listening on {addr}");

    axum::serve(
        listener,
        router(state).into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await?;

    Ok(())
}
