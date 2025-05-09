use axum::{Json, extract::State};
use serde::Deserialize;

use crate::{Error, Result, gemini::GeminiClient};

#[derive(Deserialize)]
pub struct SuggestKeywordsRequest {
    subject: String,
    description: String,
}

pub async fn suggest_keywords(
    State(gemini): State<GeminiClient>,
    Json(request): Json<SuggestKeywordsRequest>,
) -> Result<Json<Vec<String>>> {
    let Some(keywords) = gemini
        .generate_keywords(&request.subject, &request.description)
        .await?
    else {
        return Err(Error::GeminiDisabled);
    };

    Ok(Json(keywords))
}
