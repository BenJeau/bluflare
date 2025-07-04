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
        post::{CreatePost, DbPost, DbPostWithAuthor, Post, PostWithAuthor},
        topic::{
            CreateTopic, DbTopic, DbTopicWithPostCount, Topic, TopicWithPostCount, UpdateTopic,
            UpdateTopicAnalysis,
        },
        user::{CreateUser, DbUser, User},
    },
    slug::slugify,
};

pub async fn new(database_url: &str) -> Result<SqlitePool> {
    let executor = connect_to_db(database_url, 75, 5).await?;
    run_migrations(&executor).await?;
    Ok(executor)
}

pub async fn get_latest_users<'e>(executor: impl SqliteExecutor<'e>) -> Result<Vec<User>> {
    let db_users = sqlx::query_as!(
        DbUser,
        r#"SELECT * FROM users ORDER BY created_at DESC LIMIT 20"#,
    )
    .fetch_all(executor)
    .await?;

    let users = db_users.into_iter().map(User::from).collect();

    Ok(users)
}

pub async fn get_users_count<'e>(executor: impl SqliteExecutor<'e>) -> Result<i64> {
    let count = sqlx::query_scalar!(r#"SELECT COUNT(*) FROM users"#)
        .fetch_one(executor)
        .await?;

    Ok(count)
}

pub async fn get_latest_posts<'e>(
    executor: impl SqliteExecutor<'e>,
) -> Result<Vec<PostWithAuthor>> {
    let db_posts = sqlx::query_as!(
        DbPostWithAuthor,
        r#"SELECT posts.*, users.aka, users.did FROM posts
        JOIN users ON posts.author_id = users.id
        ORDER BY created_at DESC LIMIT 20"#,
    )
    .fetch_all(executor)
    .await?;

    let posts = db_posts.into_iter().map(PostWithAuthor::from).collect();

    Ok(posts)
}

pub async fn get_topic_id_by_slug<'e>(
    executor: impl SqliteExecutor<'e>,
    slug: &str,
) -> Result<Option<i64>> {
    sqlx::query_scalar!(r#"SELECT id FROM topics WHERE slug = ?"#, slug)
        .fetch_optional(executor)
        .await
        .map_err(Into::into)
}

pub async fn topic_exists<'e>(executor: impl SqliteExecutor<'e>, id: i64) -> Result<bool> {
    let result = sqlx::query_scalar!(
        r#"
            SELECT EXISTS(SELECT 1 FROM topics WHERE id = ?)
            "#,
        id,
    )
    .fetch_one(executor)
    .await?;

    Ok(result == 1)
}

pub async fn update_topic_analysis<'e>(
    executor: impl SqliteExecutor<'e>,
    id: i64,
    analysis: UpdateTopicAnalysis,
) -> Result<()> {
    sqlx::query_scalar!(
        r#"
        UPDATE topics SET last_analysis = ?, last_analysis_at = ? WHERE id = ?
        "#,
        analysis.last_analysis,
        analysis.last_analysis_at,
        id,
    )
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn update_topic<'e>(
    executor: impl SqliteExecutor<'e>,
    id: i64,
    topic: UpdateTopic,
) -> Result<()> {
    let keywords = topic
        .keywords
        .map(|keywords| serde_json::to_value(keywords).unwrap());

    sqlx::query_scalar!(
        r#"
        UPDATE topics SET 
            keywords = COALESCE(?, keywords),
            description = COALESCE(?, description),
            enabled = COALESCE(?, enabled)
        WHERE id = ?
        "#,
        keywords,
        topic.description,
        topic.enabled,
        id,
    )
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn create_topic<'e>(
    executor: impl SqliteExecutor<'e>,
    topic: CreateTopic,
) -> Result<Topic> {
    let keywords = serde_json::to_value(topic.keywords.clone()).unwrap();
    let slug = slugify(&topic.subject);

    let result = sqlx::query_as!(
        DbTopic,
        r#"
            INSERT INTO topics (subject, slug, description, keywords)
            VALUES (?, ?, ?, ?)
            RETURNING *
            "#,
        topic.subject,
        slug,
        topic.description,
        keywords,
    )
    .fetch_one(executor)
    .await?;

    Ok(result.into())
}

pub async fn get_all_topics<'e>(executor: impl SqliteExecutor<'e>) -> Result<Vec<Topic>> {
    let db_topics = sqlx::query_as!(
        DbTopic,
        r#"
            SELECT *
            FROM topics
            ORDER BY created_at DESC
            "#,
    )
    .fetch_all(executor)
    .await?;

    let topics = db_topics.into_iter().map(Topic::from).collect();

    Ok(topics)
}

pub async fn get_all_enabled_topics<'e>(executor: impl SqliteExecutor<'e>) -> Result<Vec<Topic>> {
    let db_topics = sqlx::query_as!(
        DbTopic,
        r#"
            SELECT *
            FROM topics
            WHERE enabled = 1
            ORDER BY created_at DESC
            "#,
    )
    .fetch_all(executor)
    .await?;

    let topics = db_topics.into_iter().map(Topic::from).collect();

    Ok(topics)
}

pub async fn get_all_topics_with_post_count<'e>(
    executor: impl SqliteExecutor<'e>,
) -> Result<Vec<TopicWithPostCount>> {
    let db_topics = sqlx::query_as!(
        DbTopicWithPostCount,
        r#"
            SELECT topics.*, (
                SELECT COUNT(*) FROM post_topics WHERE post_topics.topic_id = topics.id
            ) as post_count
            FROM topics
            ORDER BY created_at DESC
            "#,
    )
    .fetch_all(executor)
    .await?;

    let topics = db_topics
        .into_iter()
        .map(TopicWithPostCount::from)
        .collect();

    Ok(topics)
}

pub async fn get_topic<'e>(executor: impl SqliteExecutor<'e>, id: i64) -> Result<Topic> {
    let topic = sqlx::query_as!(
        DbTopic,
        r#"
            SELECT * FROM topics WHERE id = ?
            "#,
        id,
    )
    .fetch_one(executor)
    .await?;

    Ok(topic.into())
}

pub async fn delete_topic<'e>(executor: impl SqliteExecutor<'e>, id: i64) -> Result<bool> {
    let result = sqlx::query!(
        r#"
            DELETE FROM topics
            WHERE id = ?
            "#,
        id,
    )
    .execute(executor)
    .await?;

    Ok(result.rows_affected() > 0)
}

pub async fn get_topic_posts<'e>(
    executor: impl SqliteExecutor<'e>,
    topic_id: i64,
) -> Result<Vec<PostWithAuthor>> {
    let db_posts = sqlx::query_as!(
        DbPostWithAuthor,
        r#"
            SELECT posts.*, users.aka, users.did FROM posts
            JOIN users ON posts.author_id = users.id
            JOIN post_topics ON posts.id = post_topics.post_id AND post_topics.topic_id = ?
            ORDER BY created_at DESC
            "#,
        topic_id,
    )
    .fetch_all(executor)
    .await?;

    let posts = db_posts.into_iter().map(PostWithAuthor::from).collect();

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

pub async fn link_post_to_topics<'e>(
    executor: impl SqliteExecutor<'e>,
    post_id: i64,
    topic_ids: &BTreeSet<i64>,
) -> Result<()> {
    let mut query_builder = QueryBuilder::new("INSERT INTO post_topics (post_id, topic_id) ");

    query_builder.push_values(topic_ids, |mut b, topic_id| {
        b.push_bind(post_id).push_bind(topic_id);
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
