use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Interest {
    pub id: i64,
    pub subject: String,
    pub keywords: Vec<u8>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateInterest {
    pub subject: String,
    pub keywords: Vec<String>,
}
