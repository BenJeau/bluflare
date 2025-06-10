use axum::{
    extract::{ConnectInfo, Request, State},
    middleware::Next,
    response::Response,
};
use axum_extra::{TypedHeader, extract::CookieJar, headers::UserAgent};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use time::OffsetDateTime;

use crate::{Error, Result, state::AppState};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    sub: String,
    exp: i64,
    iat: i64,
}

pub async fn auth_middleware(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    jar: CookieJar,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    request: Request,
    next: Next,
) -> Result<Response> {
    if state.config.server.auth.enabled {
        let Some(session_id) = jar.get("session_id") else {
            return Err(Error::Unauthorized("No session id in cookies".to_string()));
        };

        let state_session_id = state
            .session_id
            .read()
            .await
            .clone()
            .ok_or(Error::Unauthorized("No session id in state".to_string()))?;

        if state_session_id.expires_at < OffsetDateTime::now_utc() {
            return Err(Error::Unauthorized("Session expired".to_string()));
        }

        if session_id.value() != state_session_id.id {
            return Err(Error::Unauthorized("Invalid session id".to_string()));
        }

        tracing::info!("Authenticated user: {}, user agent: {}", addr, user_agent);
    }
    Ok(next.run(request).await)
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum AuthPermission {
    AuthDisabled,
    Authenticated,
    InvalidSession,
}

pub async fn auth_permission(state: &AppState, jar: &CookieJar) -> AuthPermission {
    if !state.config.server.auth.enabled {
        return AuthPermission::AuthDisabled;
    }

    let Some(session_id) = jar.get("session_id") else {
        return AuthPermission::InvalidSession;
    };

    let Some(state_session_id) = state.session_id.read().await.clone() else {
        return AuthPermission::InvalidSession;
    };

    if state_session_id.expires_at < OffsetDateTime::now_utc() {
        return AuthPermission::InvalidSession;
    }

    if session_id.value() != state_session_id.id {
        return AuthPermission::InvalidSession;
    }

    AuthPermission::Authenticated
}
