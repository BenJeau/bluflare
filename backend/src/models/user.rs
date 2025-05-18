use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct DbUser {
    pub id: i64,
    pub created_at: NaiveDateTime,
    pub did: String,
    pub aka: Vec<u8>,
    pub aka_retrieved_at: NaiveDateTime,
    pub last_analysis: Option<String>,
    pub last_analysis_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i64,
    pub created_at: NaiveDateTime,
    pub did: String,
    pub aka: Vec<String>,
    pub aka_retrieved_at: NaiveDateTime,
    pub last_analysis: Option<String>,
    pub last_analysis_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUser {
    pub did: String,
    pub aka: Vec<String>,
}

impl From<DbUser> for User {
    fn from(db_user: DbUser) -> Self {
        User {
            id: db_user.id,
            created_at: db_user.created_at,
            did: db_user.did,
            aka: serde_json::from_slice(&db_user.aka).unwrap(),
            aka_retrieved_at: db_user.aka_retrieved_at,
            last_analysis: db_user.last_analysis,
            last_analysis_at: db_user.last_analysis_at,
        }
    }
}
