use async_stream::try_stream;
use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::{
        IntoResponse, Sse,
        sse::{Event, KeepAlive},
    },
    routing::{get, post},
};
use chrono::Utc;
use futures_util::Stream;
use sqlx::SqlitePool;
use std::convert::Infallible;

use crate::{
    Error, Result, db,
    gemini::GeminiClient,
    models::interest::{CreateInterest, UpdateInterest, UpdateInterestAnalysis},
    state::{AppState, SsePost},
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
        .route("/{id}/analyze", post(analyze_interest))
        .route("/{id}/posts", get(get_posts))
        .route("/{id}/posts/sse", get(sse_posts))
        .route("/slugs/{slug}", get(get_interest_by_slug))
}

async fn get_interest_by_slug(
    State(pool): State<SqlitePool>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse> {
    let interest_id = db::get_interest_id_by_slug(&pool, &slug)
        .await?
        .ok_or(Error::NotFound(format!(
            "Interest with slug {slug} not found"
        )))?;

    Ok(interest_id.to_string())
}

async fn sse_posts(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Sse<impl Stream<Item = std::result::Result<Event, Infallible>>>> {
    if !db::interest_exists(&state.pool, id).await? {
        return Err(Error::NotFound(format!("Interest with id {id} not found")));
    }

    let mut receiver = state.get_post_stream().await;

    let stream = try_stream! {
        loop {
            if let Err(e) = receiver.changed().await {
                tracing::error!(error = ?e, "Failed to get message from stream");
                continue;
            }

            let Some(message) = receiver.borrow_and_update().clone() else {
                continue;
            };

            if !message.interest_ids.contains(&id) {
                continue;
            }

            yield Event::default()
                .id(message.post.cid.to_string())
                .event("post")
                .json_data(SsePost::from(message))
                .unwrap();
        }
    };

    Ok(Sse::new(stream).keep_alive(KeepAlive::default()))
}

async fn analyze_interest(
    State(pool): State<SqlitePool>,
    State(gemini): State<GeminiClient>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    let posts = db::get_interest_posts(&pool, id)
        .await?
        .into_iter()
        .map(|p| p.text)
        .collect::<Vec<String>>();

    let Some(summary) = gemini.analyze_posts(&posts).await? else {
        return Err(Error::GeminiDisabled);
    };

    let analysis = UpdateInterestAnalysis {
        last_analysis: summary.clone(),
        last_analysis_at: Utc::now().naive_utc(),
    };

    db::update_interest_analysis(&pool, id, analysis)
        .await
        .map(Json)
}

async fn update_interest(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(update_interest): Json<UpdateInterest>,
) -> Result<impl IntoResponse> {
    db::update_interest_keywords(&pool, id, update_interest.keywords).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn get_posts(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    db::get_interest_posts(&pool, id).await.map(Json)
}

async fn get_interests(State(pool): State<SqlitePool>) -> Result<impl IntoResponse> {
    db::get_all_interests_with_post_count(&pool).await.map(Json)
}

async fn get_interest(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    db::get_interest(&pool, id).await.map(Json)
}

async fn create_interest(
    State(pool): State<SqlitePool>,
    Json(interest): Json<CreateInterest>,
) -> Result<impl IntoResponse> {
    db::create_interest(&pool, interest).await.map(Json)
}

async fn delete_interest(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    if db::delete_interest(&pool, id).await? {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(Error::NotFound(format!("Interest with id {id} not found")))
    }
}
