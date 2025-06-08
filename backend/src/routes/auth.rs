use argon2::{PasswordHash, PasswordVerifier, password_hash::Encoding};
use axum::{Json, extract::State, response::IntoResponse};
use axum_extra::extract::{
    CookieJar,
    cookie::{Cookie, SameSite},
};
use rand_core::{OsRng, RngCore};
use serde::Deserialize;
use time::{Duration, OffsetDateTime};

use crate::{
    Error, Result,
    state::{AppState, Session},
};

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    username: String,
    password: String,
}

pub async fn login(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(credentials): Json<LoginRequest>,
) -> Result<impl IntoResponse> {
    if !state.config.auth.enabled {
        return Err(Error::AuthDisabled);
    }

    let admin_username = state
        .config
        .auth
        .username
        .clone()
        .ok_or(Error::AuthDisabled)?;
    let admin_password_hash = state
        .config
        .auth
        .password_hash
        .clone()
        .ok_or(Error::AuthDisabled)?;
    let cookie_expiry_minutes = state.config.auth.cookie_expiry_minutes.unwrap_or(30);

    if credentials.username != admin_username {
        return Err(Error::InvalidCredentials);
    }

    let Ok(()) = argon2::Argon2::default().verify_password(
        credentials.password.as_bytes(),
        &PasswordHash::parse(&admin_password_hash, Encoding::default()).unwrap(),
    ) else {
        return Err(Error::InvalidCredentials);
    };

    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    let session_id = hex::encode(bytes);

    let cookie = build_cookie(state.clone(), session_id.clone());

    *state.session_id.write().await = Some(Session {
        id: session_id,
        expires_at: OffsetDateTime::now_utc() + Duration::minutes(cookie_expiry_minutes as i64),
    });

    Ok(jar.add(cookie))
}

pub async fn logout(State(state): State<AppState>, jar: CookieJar) -> Result<impl IntoResponse> {
    *state.session_id.write().await = None;

    Ok(jar.remove(build_cookie(state, "".to_string())))
}

fn build_cookie<'a>(state: AppState, session_id: String) -> Cookie<'a> {
    let cookie_expiry_minutes = state.config.auth.cookie_expiry_minutes.unwrap_or(30);
    let cookie_domain = state
        .config
        .auth
        .cookie_domain
        .unwrap_or("localhost".to_string());
    let cookie_secure = state.config.auth.cookie_secure.unwrap_or(false);
    let expires_at = OffsetDateTime::now_utc() + Duration::minutes(cookie_expiry_minutes as i64);

    Cookie::build(("session_id", session_id))
        .path("/")
        .http_only(true)
        .secure(cookie_secure)
        .domain(cookie_domain)
        .same_site(SameSite::Strict)
        .max_age(Duration::minutes(cookie_expiry_minutes as i64))
        .expires(expires_at)
        .build()
}
