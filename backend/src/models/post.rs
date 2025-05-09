use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct DbPost {
    pub id: i64,
    pub did: String,
    pub cid: String,
    pub rkey: String,
    pub created_at: String,
    pub text: String,
    pub langs: Vec<u8>,
    pub urls: Vec<u8>,
    pub tags: Vec<u8>,
    pub mentions: Vec<u8>,
    pub aka: Vec<u8>,
    pub interest_id: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Post {
    pub id: i64,
    pub did: String,
    pub cid: String,
    pub rkey: String,
    pub created_at: String,
    pub text: String,
    pub langs: Vec<String>,
    pub urls: Vec<String>,
    pub tags: Vec<String>,
    pub mentions: Vec<String>,
    pub aka: Vec<String>,
    pub interest_id: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePost {
    pub did: String,
    pub cid: String,
    pub rkey: String,
    pub created_at: String,
    pub text: String,
    pub langs: Vec<String>,
    pub urls: Vec<String>,
    pub tags: Vec<String>,
    pub mentions: Vec<String>,
    pub aka: Vec<String>,
    pub interest_id: i64,
}
