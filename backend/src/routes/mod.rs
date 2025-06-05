use axum::{Router, routing::post};
use tower_http::{
    services::{ServeDir, ServeFile},
    set_status::SetStatus,
};

use crate::{layers::CommonTowerLayerBuilder, state::AppState};

mod interests;
mod posts;
mod suggest;
mod users;

pub fn router(state: AppState) -> Router {
    let router = Router::new()
        .nest("/interests", interests::router())
        .nest("/posts", posts::router())
        .nest("/users", users::router())
        .route("/keywords/suggest", post(suggest::suggest_keywords))
        .with_state(state.clone());

    let versioned_router = Router::new().nest("/api/v1", router);

    let router_with_frontend = if state.config.frontend.enabled {
        versioned_router.fallback_service(frontend_router())
    } else {
        versioned_router
    };

    CommonTowerLayerBuilder::new()
        .build()
        .apply_middlewares(router_with_frontend)
}

fn frontend_router() -> ServeDir<SetStatus<ServeFile>> {
    ServeDir::new("dist").not_found_service(ServeFile::new("dist/index.html"))
}
