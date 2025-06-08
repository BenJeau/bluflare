use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct DbTopic {
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
pub struct Topic {
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

impl From<DbTopic> for Topic {
    fn from(db_topic: DbTopic) -> Self {
        Self {
            id: db_topic.id,
            created_at: db_topic.created_at,
            enabled: db_topic.enabled,
            slug: db_topic.slug,
            subject: db_topic.subject,
            description: db_topic.description,
            keywords: serde_json::from_slice(&db_topic.keywords).unwrap(),
            last_analysis: db_topic.last_analysis,
            last_analysis_at: db_topic.last_analysis_at,
        }
    }
}

#[derive(Debug, FromRow)]
pub struct DbTopicWithPostCount {
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
pub struct TopicWithPostCount {
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

impl From<DbTopicWithPostCount> for TopicWithPostCount {
    fn from(db_topic: DbTopicWithPostCount) -> Self {
        Self {
            id: db_topic.id,
            created_at: db_topic.created_at,
            enabled: db_topic.enabled,
            slug: db_topic.slug,
            subject: db_topic.subject,
            description: db_topic.description,
            keywords: serde_json::from_slice(&db_topic.keywords).unwrap(),
            last_analysis: db_topic.last_analysis,
            last_analysis_at: db_topic.last_analysis_at,
            post_count: db_topic.post_count,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTopic {
    pub subject: String,
    pub description: String,
    pub keywords: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTopic {
    pub keywords: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTopicAnalysis {
    pub last_analysis: String,
    pub last_analysis_at: NaiveDateTime,
}
