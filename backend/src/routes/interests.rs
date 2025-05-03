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
        .route("/:id", get(get_interest))
        .route("/:id/urls", get(get_urls))
        .route("/:id/tags", get(get_tags))
        .route("/", post(create_interest))
        .route("/:id", delete(delete_interest))
        .route("/:id/posts", get(get_posts))
}

async fn get_urls(
    State(db): State<Database>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let urls = db.get_interest_urls(id).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;
    Ok(Json(urls))
}

async fn get_tags(
    State(db): State<Database>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let tags = db.get_interest_tags(id).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;
    Ok(Json(tags))
}

async fn get_posts(
    State(db): State<Database>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let posts = db.get_all_posts(id).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;
    Ok(Json(posts))
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

async fn get_interest(
    State(db): State<Database>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let interest = db.get_interest(id).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;
    Ok(Json(interest))
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
