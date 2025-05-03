use std::{collections::HashMap, str::FromStr};

use crate::models::{CreateInterest, CreatePost, DbInterest, DbPost, Interest, Post};
use anyhow::Result;
use sqlx::{
    migrate::MigrateError,
    sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions},
};
use tracing::info;

#[derive(Clone)]
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = connect_to_db(database_url, 75, 5).await?;
        run_migrations(&pool).await?;
        Ok(Self { pool })
    }

    pub async fn get_interest_tags(&self, interest_id: i64) -> Result<HashMap<String, usize>> {
        let tags: Vec<Vec<u8>> = sqlx::query_scalar!(
            r#"
            SELECT tags FROM posts WHERE interest_id = ?
            "#,
            interest_id,
        )
        .fetch_all(&self.pool)
        .await?;

        let tags = tags
            .into_iter()
            .map(|tag| serde_json::from_slice::<Vec<String>>(&tag).unwrap())
            .flatten()
            .collect::<Vec<String>>();

        let mut tags_map = HashMap::new();
        for tag in tags {
            *tags_map.entry(tag).or_insert(0) += 1;
        }

        Ok(tags_map)
    }

    pub async fn create_interest(&self, interest: CreateInterest) -> Result<i64> {
        let keywords = serde_json::to_value(interest.keywords.clone()).unwrap();

        let result = sqlx::query_scalar!(
            r#"
            INSERT INTO interests (subject, description, keywords)
            VALUES (?, ?, ?)
            RETURNING id
            "#,
            interest.subject,
            interest.description,
            keywords,
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(result)
    }

    pub async fn get_all_interests(&self) -> Result<Vec<Interest>> {
        let db_interests = sqlx::query_as!(
            DbInterest,
            r#"
            SELECT *
            FROM interests
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        let interests = db_interests
            .into_iter()
            .map(|db_interest| Interest {
                id: db_interest.id,
                subject: db_interest.subject,
                description: db_interest.description,
                keywords: serde_json::from_slice(&db_interest.keywords).unwrap(),
                created_at: db_interest.created_at,
            })
            .collect();

        Ok(interests)
    }

    pub async fn get_interest(&self, id: i64) -> Result<Interest> {
        let db_interest = sqlx::query_as!(
            DbInterest,
            r#"
            SELECT * FROM interests WHERE id = ?
            "#,
            id,
        )
        .fetch_one(&self.pool)
        .await?;

        let interest = Interest {
            id: db_interest.id,
            subject: db_interest.subject,
            description: db_interest.description,
            keywords: serde_json::from_slice(&db_interest.keywords).unwrap(),
            created_at: db_interest.created_at,
        };

        Ok(interest)
    }

    pub async fn delete_interest(&self, id: i64) -> Result<bool> {
        let result = sqlx::query!(
            r#"
            DELETE FROM interests
            WHERE id = ?
            "#,
            id,
        )
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn create_post(&self, post: CreatePost) -> Result<i64> {
        let langs = serde_json::to_vec(&post.langs).unwrap();
        let urls = serde_json::to_vec(&post.urls).unwrap();
        let tags = serde_json::to_vec(&post.tags).unwrap();
        let aka = serde_json::to_vec(&post.aka).unwrap();
        let num_urls = post.urls.len() as i64;
        let num_tags = post.tags.len() as i64;

        let result = sqlx::query_scalar!(
            r#"
            INSERT INTO posts (did, cid, rkey, text, langs, urls, interest_id, num_urls, tags, num_tags, aka)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id
            "#,
            post.did,
            post.cid,
            post.rkey,
            post.text,
            langs,
            urls,
            post.interest_id,
            num_urls,
            tags,
            num_tags,
            aka,
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(result)
    }

    pub async fn get_interest_urls(&self, interest_id: i64) -> Result<HashMap<String, usize>> {
        let urls: Vec<Vec<u8>> = sqlx::query_scalar!(
            r#"
            SELECT urls FROM posts WHERE interest_id = ?
            "#,
            interest_id,
        )
        .fetch_all(&self.pool)
        .await?;

        let urls = urls
            .into_iter()
            .map(|url| serde_json::from_slice::<Vec<String>>(&url).unwrap())
            .flatten()
            .collect::<Vec<String>>();

        let mut urls_map = HashMap::new();
        for url in urls {
            *urls_map.entry(url).or_insert(0) += 1;
        }

        Ok(urls_map)
    }

    pub async fn get_all_posts(&self, interest_id: i64) -> Result<Vec<Post>> {
        let db_posts = sqlx::query_as!(
            DbPost,
            r#"
            SELECT * FROM posts WHERE interest_id = ? ORDER BY created_at DESC
            "#,
            interest_id,
        )
        .fetch_all(&self.pool)
        .await?;

        let posts = db_posts
            .into_iter()
            .map(|db_post| Post {
                id: db_post.id,
                did: db_post.did,
                cid: db_post.cid,
                rkey: db_post.rkey,
                created_at: db_post.created_at,
                text: db_post.text,
                langs: serde_json::from_slice(&db_post.langs).unwrap(),
                urls: serde_json::from_slice(&db_post.urls).unwrap(),
                num_urls: db_post.num_urls,
                tags: serde_json::from_slice(&db_post.tags).unwrap(),
                num_tags: db_post.num_tags,
                interest_id: db_post.interest_id,
                aka: serde_json::from_slice(&db_post.aka).unwrap(),
            })
            .collect();

        Ok(posts)
    }
}

async fn connect_to_db(
    url: &str,
    max_connections: u32,
    min_connections: u32,
) -> Result<SqlitePool, sqlx::Error> {
    assert!(max_connections >= min_connections);

    info!(url, "Connecting to database");
    let options = SqliteConnectOptions::from_str(url)?;

    SqlitePoolOptions::new()
        .max_connections(max_connections)
        .min_connections(min_connections)
        .connect_with(options)
        .await
}

async fn run_migrations(pool: &SqlitePool) -> Result<(), MigrateError> {
    info!("Running migrations");
    sqlx::migrate!("./migrations").run(pool).await
}
