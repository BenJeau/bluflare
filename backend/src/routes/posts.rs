use async_stream::try_stream;
use axum::{
    Json,
    extract::State,
    response::{
        IntoResponse, Sse,
        sse::{Event, KeepAlive},
    },
};
use futures_util::Stream;
use sqlx::SqlitePool;
use std::convert::Infallible;

use crate::{Result, db, models::post::PostWithAuthor, state::AppState};

pub async fn get_latest_posts(State(pool): State<SqlitePool>) -> Result<impl IntoResponse> {
    let posts = db::get_latest_posts(&pool).await?;
    Ok(Json(posts))
}

pub async fn get_posts_sse(
    State(state): State<AppState>,
) -> Result<Sse<impl Stream<Item = std::result::Result<Event, Infallible>>>> {
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

            yield Event::default()
                .id(&message.post.cid)
                .event("post")
                .json_data(PostWithAuthor::from(message))
                .unwrap();
        }
    };

    Ok(Sse::new(stream).keep_alive(KeepAlive::default()))
}
