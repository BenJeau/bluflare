use chrono::Utc;
use sqlx::{
    FromRow, QueryBuilder, SqliteExecutor,
    sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions},
};
use std::{collections::BTreeSet, str::FromStr};
use tracing::info;

use crate::{
    Result,
    models::{
        interest::{
            CreateInterest, DbInterest, DbInterestWithPostCount, Interest, InterestWithPostCount,
            UpdateInterestAnalysis,
        },
        post::{CreatePost, DbPost, Post},
        user::{CreateUser, DbUser, User},
    },
    slug::slugify,
};

pub async fn new(database_url: &str) -> Result<SqlitePool> {
    let executor = connect_to_db(database_url, 75, 5).await?;
    run_migrations(&executor).await?;
    Ok(executor)
}

pub async fn get_latest_posts<'e>(executor: impl SqliteExecutor<'e>) -> Result<Vec<Post>> {
    let db_posts = sqlx::query_as!(
        DbPost,
        r#"SELECT * FROM posts ORDER BY created_at DESC LIMIT 20"#,
    )
    .fetch_all(executor)
    .await?;

    let posts = db_posts.into_iter().map(Post::from).collect();

    Ok(posts)
}

pub async fn get_interest_id_by_slug<'e>(
    executor: impl SqliteExecutor<'e>,
    slug: &str,
) -> Result<Option<i64>> {
    sqlx::query_scalar!(r#"SELECT id FROM interests WHERE slug = ?"#, slug)
        .fetch_optional(executor)
        .await
        .map_err(Into::into)
}

pub async fn interest_exists<'e>(executor: impl SqliteExecutor<'e>, id: i64) -> Result<bool> {
    let result = sqlx::query_scalar!(
        r#"
            SELECT EXISTS(SELECT 1 FROM interests WHERE id = ?)
            "#,
        id,
    )
    .fetch_one(executor)
    .await?;

    Ok(result == 1)
}

pub async fn update_interest_analysis<'e>(
    executor: impl SqliteExecutor<'e>,
    id: i64,
    analysis: UpdateInterestAnalysis,
) -> Result<()> {
    sqlx::query_scalar!(
        r#"
            UPDATE interests SET last_analysis = ?, last_analysis_at = ? WHERE id = ?
            "#,
        analysis.last_analysis,
        analysis.last_analysis_at,
        id,
    )
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn update_interest_keywords<'e>(
    executor: impl SqliteExecutor<'e>,
    id: i64,
    keywords: Vec<String>,
) -> Result<()> {
    let keywords = serde_json::to_value(keywords.clone()).unwrap();

    sqlx::query_scalar!(
        r#"
            UPDATE interests SET keywords = ? WHERE id = ?
            "#,
        keywords,
        id,
    )
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn create_interest<'e>(
    executor: impl SqliteExecutor<'e>,
    interest: CreateInterest,
) -> Result<i64> {
    let keywords = serde_json::to_value(interest.keywords.clone()).unwrap();
    let slug = slugify(&interest.subject);

    let result = sqlx::query_scalar!(
        r#"
            INSERT INTO interests (subject, slug, description, keywords)
            VALUES (?, ?, ?, ?)
            RETURNING id
            "#,
        interest.subject,
        slug,
        interest.description,
        keywords,
    )
    .fetch_one(executor)
    .await?;

    Ok(result)
}

pub async fn get_all_interests<'e>(executor: impl SqliteExecutor<'e>) -> Result<Vec<Interest>> {
    let db_interests = sqlx::query_as!(
        DbInterest,
        r#"
            SELECT *
            FROM interests
            ORDER BY created_at DESC
            "#,
    )
    .fetch_all(executor)
    .await?;

    let interests = db_interests.into_iter().map(Interest::from).collect();

    Ok(interests)
}

pub async fn get_all_interests_with_post_count<'e>(
    executor: impl SqliteExecutor<'e>,
) -> Result<Vec<InterestWithPostCount>> {
    let db_interests = sqlx::query_as!(
        DbInterestWithPostCount,
        r#"
            SELECT interests.*, COUNT(post_interests.post_id) as post_count
            FROM interests
            LEFT JOIN post_interests ON interests.id = post_interests.interest_id
            GROUP BY interests.id
            ORDER BY created_at DESC
            "#,
    )
    .fetch_all(executor)
    .await?;

    let interests = db_interests
        .into_iter()
        .map(InterestWithPostCount::from)
        .collect();

    Ok(interests)
}

pub async fn get_interest<'e>(executor: impl SqliteExecutor<'e>, id: i64) -> Result<Interest> {
    let interest = sqlx::query_as!(
        DbInterest,
        r#"
            SELECT * FROM interests WHERE id = ?
            "#,
        id,
    )
    .fetch_one(executor)
    .await?;

    Ok(interest.into())
}

pub async fn delete_interest<'e>(executor: impl SqliteExecutor<'e>, id: i64) -> Result<bool> {
    let result = sqlx::query!(
        r#"
            DELETE FROM interests
            WHERE id = ?
            "#,
        id,
    )
    .execute(executor)
    .await?;

    Ok(result.rows_affected() > 0)
}

pub async fn get_interest_posts<'e>(
    executor: impl SqliteExecutor<'e>,
    interest_id: i64,
) -> Result<Vec<Post>> {
    let db_posts = sqlx::query_as!(
            DbPost,
            r#"
            SELECT posts.* FROM posts
            JOIN post_interests ON posts.id = post_interests.post_id AND post_interests.interest_id = ?
            ORDER BY created_at DESC
            "#,
            interest_id,
        )
        .fetch_all(executor)
        .await?;

    let posts = db_posts.into_iter().map(Post::from).collect();

    Ok(posts)
}

pub async fn create_post<'e>(executor: impl SqliteExecutor<'e>, post: CreatePost) -> Result<Post> {
    let langs = serde_json::to_vec(&post.langs).unwrap();
    let urls = serde_json::to_vec(&post.urls).unwrap();
    let tags = serde_json::to_vec(&post.tags).unwrap();

    let post = sqlx::query_as!(
        DbPost,
        r#"
            INSERT INTO posts (cid, rkey, created_at, text, langs, urls, tags, author_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            "#,
        post.cid,
        post.rkey,
        post.created_at,
        post.text,
        langs,
        urls,
        tags,
        post.author_id,
    )
    .fetch_one(executor)
    .await?;

    Ok(post.into())
}

pub async fn link_post_to_interests<'e>(
    executor: impl SqliteExecutor<'e>,
    post_id: i64,
    interest_ids: &BTreeSet<i64>,
) -> Result<()> {
    let mut query_builder = QueryBuilder::new("INSERT INTO post_interests (post_id, interest_id) ");

    query_builder.push_values(interest_ids, |mut b, interest_id| {
        b.push_bind(post_id).push_bind(interest_id);
    });

    let query = query_builder.build();
    query.execute(executor).await?;

    Ok(())
}

pub async fn link_mentions_to_post<'e>(
    executor: impl SqliteExecutor<'e>,
    post_id: i64,
    mentions: Vec<i64>,
) -> Result<()> {
    let mut query_builder = QueryBuilder::new("INSERT INTO post_mentions (post_id, user_id) ");

    query_builder.push_values(mentions, |mut b, mention| {
        b.push_bind(post_id).push_bind(mention);
    });

    let query = query_builder.build();
    query.execute(executor).await?;

    Ok(())
}

pub async fn create_or_get_users<'e>(
    executor: impl SqliteExecutor<'e>,
    users: Vec<CreateUser>,
) -> Result<Vec<User>> {
    let mut query_builder = QueryBuilder::new("INSERT INTO users (did, aka, aka_retrieved_at) ");

    query_builder.push_values(users, |mut b, new_user| {
        b.push_bind(new_user.did)
            .push_bind(serde_json::to_vec(&new_user.aka).unwrap())
            .push_bind(Utc::now().naive_utc()); // TODO - actually get the time at the time of the query
    });

    let query = query_builder
        .push(
            r#"
ON CONFLICT(did) DO UPDATE SET 
    aka = excluded.aka,
    aka_retrieved_at = excluded.aka_retrieved_at
RETURNING *
"#,
        )
        .build();
    let rows = query.fetch_all(executor).await?;
    let posts = rows
        .into_iter()
        .map(|row| DbUser::from_row(&row).unwrap())
        .map(User::from)
        .collect();

    Ok(posts)
}
async fn connect_to_db(
    url: &str,
    max_connections: u32,
    min_connections: u32,
) -> Result<SqlitePool> {
    assert!(max_connections >= min_connections);

    info!(url, "Connecting to database");
    let options = SqliteConnectOptions::from_str(url)?;

    let pool = SqlitePoolOptions::new()
        .max_connections(max_connections)
        .min_connections(min_connections)
        .connect_with(options)
        .await?;

    Ok(pool)
}

async fn run_migrations(pool: &SqlitePool) -> Result<()> {
    info!("Running migrations");
    sqlx::migrate!("./migrations").run(pool).await?;

    Ok(())
}
