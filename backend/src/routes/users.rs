use axum::{Json, Router, extract::State, response::IntoResponse, routing::get};
use futures_util::future::join;
use serde::Serialize;
use sqlx::SqlitePool;

use crate::{Result, db, models::user::User, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new().route("/latest", get(get_latest_users))
}

#[derive(Debug, Serialize)]
pub struct LatestUsers {
    pub users: Vec<User>,
    pub total: i64,
}

async fn get_latest_users(State(pool): State<SqlitePool>) -> Result<impl IntoResponse> {
    let (users, total) = join(db::get_latest_users(&pool), db::get_users_count(&pool)).await;
    Ok(Json(LatestUsers {
        users: users?,
        total: total?,
    }))
}
