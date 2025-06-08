use argon2::{PasswordHash, PasswordVerifier, password_hash::Encoding};
use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};

use crate::{Error, Result, auth::create_jwt_token, config::Config};

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    token: String,
}

pub async fn login(
    State(config): State<Config>,
    Json(credentials): Json<LoginRequest>,
) -> Result<Json<LoginResponse>> {
    if !config.auth.enabled {
        return Err(Error::AuthDisabled);
    }

    let admin_username = config.auth.username.ok_or(Error::AuthDisabled)?;
    let admin_password_hash = config.auth.password_hash.ok_or(Error::AuthDisabled)?;
    let jwt_secret = config.auth.jwt_secret.ok_or(Error::AuthDisabled)?;
    let jwt_expiry_minutes = config.auth.jwt_expiry_minutes.unwrap_or(30);

    if credentials.username != admin_username {
        return Err(Error::InvalidCredentials);
    }

    let Ok(()) = argon2::Argon2::default().verify_password(
        credentials.password.as_bytes(),
        &PasswordHash::parse(&admin_password_hash, Encoding::default()).unwrap(),
    ) else {
        return Err(Error::InvalidCredentials);
    };

    let token = create_jwt_token(credentials.username, jwt_secret, jwt_expiry_minutes as i64)?;

    Ok(Json(LoginResponse { token }))
}
