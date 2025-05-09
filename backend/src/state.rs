use axum::extract::FromRef;

use crate::{Result, config, db::Database, gemini::GeminiClient};

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub gemini: GeminiClient,
    pub config: config::Config,
}

impl AppState {
    pub async fn new(config: config::Config) -> Result<Self> {
        let db = Database::new(&config.database.url).await?;
        let gemini = GeminiClient::new(&config.gemini)?;

        Ok(Self { db, gemini, config })
    }
}

impl FromRef<AppState> for Database {
    fn from_ref(state: &AppState) -> Self {
        state.db.clone()
    }
}

impl FromRef<AppState> for GeminiClient {
    fn from_ref(state: &AppState) -> Self {
        state.gemini.clone()
    }
}
