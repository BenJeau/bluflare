use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct DbInterest {
    pub id: i64,
    pub subject: String,
    pub description: String,
    pub keywords: Vec<u8>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Interest {
    pub id: i64,
    pub subject: String,
    pub description: String,
    pub keywords: Vec<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateInterest {
    pub subject: String,
    pub description: String,
    pub keywords: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInterest {
    pub keywords: Vec<String>,
}
