use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use chrono::Utc;

use crate::{
    Error, Result,
    db::Database,
    gemini::GeminiClient,
    models::interest::{CreateInterest, UpdateInterest, UpdateInterestAnalysis},
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(get_interests).post(create_interest))
        .route(
            "/{id}",
            get(get_interest)
                .delete(delete_interest)
                .patch(update_interest),
        )
        .route("/{id}/urls", get(get_urls))
        .route("/{id}/tags", get(get_tags))
        .route("/{id}/words", get(get_words))
        .route("/{id}/langs", get(get_langs))
        .route("/{id}/analyze", post(analyze_interest))
        .route("/{id}/posts", get(get_posts))
}

async fn analyze_interest(
    State(db): State<Database>,
    State(gemini): State<GeminiClient>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    let posts = db
        .get_all_posts(id)
        .await?
        .into_iter()
        .map(|p| p.text)
        .collect::<Vec<String>>();
    let Some(summary) = gemini.analyze_posts(&posts).await? else {
        return Err(Error::NotFound);
    };

    let analysis = UpdateInterestAnalysis {
        last_analysis: summary.clone(),
        last_analysis_at: Utc::now().naive_utc(),
    };

    db.update_interest_analysis(id, analysis).await.map(Json)
}

async fn update_interest(
    State(db): State<Database>,
    Path(id): Path<i64>,
    Json(update_interest): Json<UpdateInterest>,
) -> Result<impl IntoResponse> {
    db.update_interest_keywords(id, update_interest.keywords)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn get_langs(State(db): State<Database>, Path(id): Path<i64>) -> Result<impl IntoResponse> {
    db.get_interest_langs(id).await.map(Json)
}

async fn get_words(State(db): State<Database>, Path(id): Path<i64>) -> Result<impl IntoResponse> {
    db.get_interest_words(id).await.map(Json)
}

async fn get_urls(State(db): State<Database>, Path(id): Path<i64>) -> Result<impl IntoResponse> {
    db.get_interest_urls(id).await.map(Json)
}

async fn get_tags(State(db): State<Database>, Path(id): Path<i64>) -> Result<impl IntoResponse> {
    db.get_interest_tags(id).await.map(Json)
}

async fn get_posts(State(db): State<Database>, Path(id): Path<i64>) -> Result<impl IntoResponse> {
    db.get_all_posts(id).await.map(Json)
}

async fn get_interests(State(db): State<Database>) -> Result<impl IntoResponse> {
    db.get_all_interests().await.map(Json)
}

async fn get_interest(
    State(db): State<Database>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    db.get_interest(id).await.map(Json)
}

async fn create_interest(
    State(db): State<Database>,
    Json(interest): Json<CreateInterest>,
) -> Result<impl IntoResponse> {
    db.create_interest(interest).await.map(Json)
}

async fn delete_interest(
    State(db): State<Database>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    if db.delete_interest(id).await? {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(Error::NotFound)
    }
}
