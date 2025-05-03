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
    pub last_analysis: Option<String>,
    pub last_analysis_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Interest {
    pub id: i64,
    pub subject: String,
    pub description: String,
    pub keywords: Vec<String>,
    pub created_at: NaiveDateTime,
    pub last_analysis: Option<String>,
    pub last_analysis_at: Option<NaiveDateTime>,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInterestAnalysis {
    pub last_analysis: String,
    pub last_analysis_at: NaiveDateTime,
}
