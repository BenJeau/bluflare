use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use tracing::error;

#[derive(Debug)]
pub enum Error {
    Request(reqwest::Error),
    Serde(serde_json::Error),
    Sqlx(sqlx::Error),
    SqlxMigrate(sqlx::migrate::MigrateError),
    Config(figment::Error),
    AddrParseError(std::net::AddrParseError),
    Io(std::io::Error),
    InvalidHeaderValue(reqwest::header::InvalidHeaderValue),
    RequestWebSocket(reqwest_websocket::Error),
    NotFound(String),
    GeminiDisabled,
}

pub type Result<T> = std::result::Result<T, Error>;

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl From<reqwest::Error> for Error {
    fn from(error: reqwest::Error) -> Self {
        Self::Request(error)
    }
}

impl From<serde_json::Error> for Error {
    fn from(error: serde_json::Error) -> Self {
        Self::Serde(error)
    }
}

impl From<sqlx::Error> for Error {
    fn from(error: sqlx::Error) -> Self {
        Self::Sqlx(error)
    }
}

impl From<figment::Error> for Error {
    fn from(error: figment::Error) -> Self {
        Self::Config(error)
    }
}

impl From<std::net::AddrParseError> for Error {
    fn from(error: std::net::AddrParseError) -> Self {
        Self::AddrParseError(error)
    }
}

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Self::Io(error)
    }
}

impl From<sqlx::migrate::MigrateError> for Error {
    fn from(error: sqlx::migrate::MigrateError) -> Self {
        Self::SqlxMigrate(error)
    }
}

impl From<reqwest::header::InvalidHeaderValue> for Error {
    fn from(error: reqwest::header::InvalidHeaderValue) -> Self {
        Self::InvalidHeaderValue(error)
    }
}

impl From<reqwest_websocket::Error> for Error {
    fn from(error: reqwest_websocket::Error) -> Self {
        Self::RequestWebSocket(error)
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        error!("Error: {}", self);

        match self {
            Self::NotFound(message) => (StatusCode::NOT_FOUND, message).into_response(),
            Self::GeminiDisabled => {
                (StatusCode::SERVICE_UNAVAILABLE, "Gemini is disabled").into_response()
            }
            _ => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()).into_response(),
        }
    }
}
