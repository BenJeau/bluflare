use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct DbInterest {
    pub id: i64,
    pub created_at: NaiveDateTime,
    pub enabled: bool,
    pub slug: String,
    pub subject: String,
    pub description: String,
    pub keywords: Vec<u8>,
    pub last_analysis: Option<String>,
    pub last_analysis_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Interest {
    pub id: i64,
    pub created_at: NaiveDateTime,
    pub enabled: bool,
    pub slug: String,
    pub subject: String,
    pub description: String,
    pub keywords: Vec<String>,
    pub last_analysis: Option<String>,
    pub last_analysis_at: Option<NaiveDateTime>,
}

impl From<DbInterest> for Interest {
    fn from(db_interest: DbInterest) -> Self {
        Self {
            id: db_interest.id,
            created_at: db_interest.created_at,
            enabled: db_interest.enabled,
            slug: db_interest.slug,
            subject: db_interest.subject,
            description: db_interest.description,
            keywords: serde_json::from_slice(&db_interest.keywords).unwrap(),
            last_analysis: db_interest.last_analysis,
            last_analysis_at: db_interest.last_analysis_at,
        }
    }
}

#[derive(Debug, FromRow)]
pub struct DbInterestWithPostCount {
    pub id: i64,
    pub created_at: NaiveDateTime,
    pub enabled: bool,
    pub slug: String,
    pub subject: String,
    pub description: String,
    pub keywords: Vec<u8>,
    pub last_analysis: Option<String>,
    pub last_analysis_at: Option<NaiveDateTime>,
    pub post_count: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InterestWithPostCount {
    pub id: i64,
    pub created_at: NaiveDateTime,
    pub enabled: bool,
    pub slug: String,
    pub subject: String,
    pub description: String,
    pub keywords: Vec<String>,
    pub last_analysis: Option<String>,
    pub last_analysis_at: Option<NaiveDateTime>,
    pub post_count: i64,
}

impl From<DbInterestWithPostCount> for InterestWithPostCount {
    fn from(db_interest: DbInterestWithPostCount) -> Self {
        Self {
            id: db_interest.id,
            created_at: db_interest.created_at,
            enabled: db_interest.enabled,
            slug: db_interest.slug,
            subject: db_interest.subject,
            description: db_interest.description,
            keywords: serde_json::from_slice(&db_interest.keywords).unwrap(),
            last_analysis: db_interest.last_analysis,
            last_analysis_at: db_interest.last_analysis_at,
            post_count: db_interest.post_count,
        }
    }
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
