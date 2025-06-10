use async_stream::try_stream;
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::{
        IntoResponse, Sse,
        sse::{Event, KeepAlive},
    },
};
use chrono::Utc;
use futures_util::Stream;
use sqlx::SqlitePool;
use std::convert::Infallible;

use crate::{
    Error, Result, db,
    gemini::GeminiClient,
    models::{
        post::PostWithAuthor,
        topic::{CreateTopic, UpdateTopic, UpdateTopicAnalysis},
    },
    state::AppState,
};

pub async fn get_topic_by_slug(
    State(pool): State<SqlitePool>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse> {
    let topic_id = db::get_topic_id_by_slug(&pool, &slug)
        .await?
        .ok_or(Error::NotFound(format!("Topic with slug {slug} not found")))?;

    Ok(topic_id.to_string())
}

pub async fn sse_posts(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Sse<impl Stream<Item = std::result::Result<Event, Infallible>>>> {
    if !db::topic_exists(&state.pool, id).await? {
        return Err(Error::NotFound(format!("Topic with id {id} not found")));
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

            if !message.topic_ids.contains(&id) {
                continue;
            }

            yield Event::default()
                .id(&message.post.cid)
                .event("post")
                .json_data(PostWithAuthor::from(message))
                .unwrap();
        }
    };

    Ok(Sse::new(stream).keep_alive(KeepAlive::default()))
}

pub async fn analyze_topic(
    State(pool): State<SqlitePool>,
    State(gemini): State<GeminiClient>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    let posts = db::get_topic_posts(&pool, id)
        .await?
        .into_iter()
        .map(|p| p.post.text)
        .collect::<Vec<String>>();

    let Some(summary) = gemini.analyze_posts(&posts).await? else {
        return Err(Error::GeminiDisabled);
    };

    let analysis = UpdateTopicAnalysis {
        last_analysis: summary.clone(),
        last_analysis_at: Utc::now().naive_utc(),
    };

    db::update_topic_analysis(&pool, id, analysis)
        .await
        .map(Json)
}

pub async fn update_topic(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(update_topic): Json<UpdateTopic>,
) -> Result<impl IntoResponse> {
    db::update_topic(&pool, id, update_topic).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn get_posts(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    db::get_topic_posts(&pool, id).await.map(Json)
}

pub async fn get_topics(State(pool): State<SqlitePool>) -> Result<impl IntoResponse> {
    db::get_all_topics_with_post_count(&pool).await.map(Json)
}

pub async fn get_topic(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    db::get_topic(&pool, id).await.map(Json)
}

pub async fn create_topic(
    State(pool): State<SqlitePool>,
    Json(topic): Json<CreateTopic>,
) -> Result<impl IntoResponse> {
    db::create_topic(&pool, topic).await.map(Json)
}

pub async fn delete_topic(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse> {
    if db::delete_topic(&pool, id).await? {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(Error::NotFound(format!("Topic with id {id} not found")))
    }
}
