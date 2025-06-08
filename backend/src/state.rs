use axum::extract::FromRef;
use serde::Serialize;
use sqlx::SqlitePool;
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};
use tokio::sync::{
    RwLock,
    watch::{Receiver, Sender, channel},
};
use tracing::error;

use crate::{Result, config, db, gemini::GeminiClient, models::post::Post};

#[derive(Clone)]
pub struct StreamPost {
    pub post: Post,
    pub topic_ids: BTreeSet<i64>,
    pub akas: BTreeMap<String, Vec<String>>,
}

#[derive(Debug, Serialize, Clone)]
pub struct SsePost {
    #[serde(flatten)]
    post: Post,
    akas: BTreeMap<String, Vec<String>>,
}

impl From<StreamPost> for SsePost {
    fn from(post: StreamPost) -> Self {
        Self {
            post: post.post,
            akas: post.akas,
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
    pub gemini: GeminiClient,
    pub config: config::Config,
    pub post_streams: Arc<RwLock<(Sender<Option<StreamPost>>, Receiver<Option<StreamPost>>)>>,
}

impl AppState {
    pub async fn new(config: config::Config) -> Result<Self> {
        let pool = db::new(&config.database.url).await?;
        let gemini = GeminiClient::new(&config.gemini)?;

        let (sender, receiver) = channel(None);
        let post_streams = Arc::new(RwLock::new((sender, receiver)));

        Ok(Self {
            pool,
            gemini,
            config,
            post_streams,
        })
    }

    pub async fn send_message(
        &self,
        post: Post,
        topic_ids: BTreeSet<i64>,
        akas: BTreeMap<String, Vec<String>>,
    ) {
        let inner_stream = self.post_streams.write().await;
        let (sender, _) = inner_stream.clone();
        if let Err(err) = sender.send(Some(StreamPost {
            post,
            topic_ids: topic_ids.clone(),
            akas,
        })) {
            error!("Error sending message to watch channel with topics {topic_ids:?}: {err}",);
        }
    }

    pub async fn get_post_stream(&self) -> Receiver<Option<StreamPost>> {
        let inner_stream = self.post_streams.read().await;
        inner_stream.clone().1
    }
}

impl FromRef<AppState> for SqlitePool {
    fn from_ref(state: &AppState) -> Self {
        state.pool.clone()
    }
}

impl FromRef<AppState> for GeminiClient {
    fn from_ref(state: &AppState) -> Self {
        state.gemini.clone()
    }
}

impl FromRef<AppState> for config::Config {
    fn from_ref(state: &AppState) -> Self {
        state.config.clone()
    }
}
