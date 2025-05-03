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
    pub num_urls: i64,
    pub tags: Vec<u8>,
    pub num_tags: i64,
    pub interest_id: i64,
    pub aka: Vec<u8>,
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
    pub num_urls: i64,
    pub tags: Vec<String>,
    pub num_tags: i64,
    pub interest_id: i64,
    pub aka: Vec<String>,
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
    pub interest_id: i64,
    pub aka: Vec<String>,
}
