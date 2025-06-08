use axum::{
    Router,
    middleware::from_fn_with_state,
    routing::{delete, get, post},
};
use tower_http::{
    services::{ServeDir, ServeFile},
    set_status::SetStatus,
};

use crate::{layers::CommonTowerLayerBuilder, state::AppState};

mod auth;
mod posts;
mod suggest;
mod topics;
mod users;

pub fn router(state: AppState) -> Router {
    let router = Router::new()
        .route("/keywords/suggest", post(suggest::suggest_keywords))
        .route("/topics", post(topics::create_topic))
        .route(
            "/topics/{id}",
            delete(topics::delete_topic).patch(topics::update_topic),
        )
        .route("/topics/{id}/analyze", post(topics::analyze_topic))
        .route_layer(from_fn_with_state(
            state.clone(),
            crate::auth::auth_middleware,
        ))
        .route("/posts/latest", get(posts::get_latest_posts))
        .route("/posts/latest/sse", get(posts::get_posts_sse))
        .route("/topics", get(topics::get_topics))
        .route("/topics/{id}", get(topics::get_topic))
        .route("/topics/{id}/posts", get(topics::get_posts))
        .route("/topics/{id}/posts/sse", get(topics::sse_posts))
        .route("/slugs/{slug}", get(topics::get_topic_by_slug))
        .route("/users/latest", get(users::get_latest_users))
        .route("/auth/login", post(auth::login))
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
