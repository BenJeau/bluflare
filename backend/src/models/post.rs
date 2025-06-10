use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct DbPost {
    pub id: i64,
    pub cid: String,
    pub rkey: String,
    pub created_at: String,
    pub text: String,
    pub langs: Vec<u8>,
    pub urls: Vec<u8>,
    pub tags: Vec<u8>,
    pub author_id: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Post {
    pub id: i64,
    pub cid: String,
    pub rkey: String,
    pub created_at: String,
    pub text: String,
    pub langs: Vec<String>,
    pub urls: Vec<String>,
    pub tags: Vec<String>,
    pub author_id: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePost {
    pub cid: String,
    pub rkey: String,
    pub created_at: String,
    pub text: String,
    pub langs: Vec<String>,
    pub urls: Vec<String>,
    pub tags: Vec<String>,
    pub author_id: i64,
}

impl From<DbPost> for Post {
    fn from(db_post: DbPost) -> Self {
        Post {
            id: db_post.id,
            cid: db_post.cid,
            rkey: db_post.rkey,
            created_at: db_post.created_at,
            text: db_post.text,
            langs: serde_json::from_slice(&db_post.langs).unwrap(),
            urls: serde_json::from_slice(&db_post.urls).unwrap(),
            tags: serde_json::from_slice(&db_post.tags).unwrap(),
            author_id: db_post.author_id,
        }
    }
}

#[derive(Debug, FromRow)]
pub struct DbPostWithAuthor {
    pub id: i64,
    pub cid: String,
    pub rkey: String,
    pub created_at: String,
    pub text: String,
    pub langs: Vec<u8>,
    pub urls: Vec<u8>,
    pub tags: Vec<u8>,
    pub author_id: i64,
    pub aka: Vec<u8>,
    pub did: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct PostWithAuthor {
    #[serde(flatten)]
    pub post: Post,
    pub aka: Vec<String>,
    pub did: String,
}

impl From<DbPostWithAuthor> for PostWithAuthor {
    fn from(db_post: DbPostWithAuthor) -> Self {
        PostWithAuthor {
            post: Post {
                id: db_post.id,
                cid: db_post.cid,
                rkey: db_post.rkey,
                created_at: db_post.created_at,
                text: db_post.text,
                langs: serde_json::from_slice(&db_post.langs).unwrap(),
                urls: serde_json::from_slice(&db_post.urls).unwrap(),
                tags: serde_json::from_slice(&db_post.tags).unwrap(),
                author_id: db_post.author_id,
            },
            aka: serde_json::from_slice(&db_post.aka).unwrap(),
            did: db_post.did,
        }
    }
}
