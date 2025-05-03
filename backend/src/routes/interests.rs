use crate::db::Database;
use crate::models::CreateInterest;
use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
};

pub fn router() -> Router<Database> {
    Router::new()
        .route("/", get(get_interests))
        .route("/", post(create_interest))
        .route("/:id", delete(delete_interest))
}

async fn get_interests(
    State(db): State<Database>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let interests = db.get_all_interests().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;
    Ok(Json(interests))
}

async fn create_interest(
    State(db): State<Database>,
    Json(interest): Json<CreateInterest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let interest = db.create_interest(interest).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;
    Ok(Json(interest))
}

async fn delete_interest(
    State(db): State<Database>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let deleted = db.delete_interest(id).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;

    if deleted {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err((StatusCode::NOT_FOUND, "Interest not found".to_string()))
    }
}
