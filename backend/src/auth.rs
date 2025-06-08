use axum::{
    extract::{ConnectInfo, Request, State},
    middleware::Next,
    response::Response,
};
use axum_extra::{
    TypedHeader,
    headers::{Authorization, UserAgent, authorization::Bearer},
};
use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

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
    bearer_auth: Option<TypedHeader<Authorization<Bearer>>>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    request: Request,
    next: Next,
) -> Result<Response> {
    if let Some(jwt_secret) = state.config.auth.jwt_secret {
        let Some(bearer_auth) = bearer_auth else {
            return Err(Error::Unauthorized("No bearer token".to_string()));
        };

        tracing::info!("Authenticating user: {}, user agent: {}", addr, user_agent);

        let token = bearer_auth.token();
        parse_jwt_token(token, jwt_secret)?;
    }

    Ok(next.run(request).await)
}

fn parse_jwt_token(token: &str, jwt_secret: String) -> Result<Claims> {
    let key = DecodingKey::from_base64_secret(&jwt_secret)?;
    let token = decode::<Claims>(&token, &key, &Validation::default())?;
    Ok(token.claims)
}

pub fn create_jwt_token(
    username: String,
    jwt_secret: String,
    jwt_expiry_minutes: i64,
) -> Result<String> {
    let now = Utc::now();
    let exp = (now + Duration::minutes(jwt_expiry_minutes)).timestamp();
    let iat = now.timestamp();

    let claims = Claims {
        sub: username,
        exp,
        iat,
    };

    let key = EncodingKey::from_base64_secret(&jwt_secret)?;
    let token = encode(&Header::default(), &claims, &key)?;

    Ok(token)
}
