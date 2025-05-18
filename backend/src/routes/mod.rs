use axum::{Router, routing::post};

use crate::{layers::CommonTowerLayerBuilder, state::AppState};

mod interests;
mod posts;
mod suggest;

pub fn router(state: AppState) -> Router {
    let router = Router::new()
        .nest("/interests", interests::router())
        .nest("/posts", posts::router())
        .route("/keywords/suggest", post(suggest::suggest_keywords))
        .with_state(state);

    let versioned_router = Router::new().nest("/api/v1", router);

    CommonTowerLayerBuilder::new()
        .build()
        .apply_middlewares(versioned_router)
}
