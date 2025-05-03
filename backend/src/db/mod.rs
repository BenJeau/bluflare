use std::str::FromStr;

use crate::models::{CreateInterest, Interest};
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

    pub async fn create_interest(&self, interest: CreateInterest) -> Result<i64> {
        let result = sqlx::query_scalar!(
            r#"
            INSERT INTO interests (keyword)
            VALUES (?)
            RETURNING id
            "#,
            interest.keyword,
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(result)
    }

    pub async fn get_all_interests(&self) -> Result<Vec<Interest>> {
        let interests = sqlx::query_as!(
            Interest,
            r#"
            SELECT *
            FROM interests
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(interests)
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
