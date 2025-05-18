use sqlx::SqlitePool;
use std::collections::BTreeSet;
use tracing::{error, info};

use crate::{
    Result, config, db,
    jetstream::{did::DidClient, message::JetstreamMessage},
    models::{interest::Interest, post::CreatePost, user::CreateUser},
    state::AppState,
};

pub struct Processor {
    did_client: DidClient,
    pool: SqlitePool,
}

impl Processor {
    pub fn new(config: config::Jetstream, pool: SqlitePool) -> Result<Self> {
        let did_client = DidClient::new(config.did_resolver)?;

        Ok(Self { did_client, pool })
    }

    pub fn process_message(
        &self,
        message: JetstreamMessage,
        interests: Vec<Interest>,
        state: AppState,
    ) -> Result<()> {
        let pool = self.pool.clone();
        let did_client = self.did_client.clone();

        tokio::spawn(async move {
            let interest_ids = message.matches_any_interest(&interests);

            if !interest_ids.is_empty() {
                info!(
                    "Found {} interests for post: {:?}",
                    interest_ids.len(),
                    message.text
                );

                let dids = BTreeSet::from_iter(
                    message
                        .mentions
                        .iter()
                        .map(String::to_string)
                        .chain(vec![message.did.clone()]),
                );

                let akas = did_client.resolve_dids(dids).await;

                let mut tx = match pool.begin().await {
                    Ok(tx) => tx,
                    Err(e) => {
                        error!("Error unable to start transaction, not saving message: {e:?}");
                        return Err(crate::Error::Sqlx(e)); // TODO, I think there's a better way to handle this, and all the other errors
                    }
                };

                let users_to_create = akas
                    .iter()
                    .map(|(did, aka)| CreateUser {
                        did: did.clone(),
                        aka: aka.clone(),
                    })
                    .collect();

                let users = db::create_or_get_users(&mut *tx, users_to_create)
                    .await
                    .map_err(|e| {
                        error!("Error getting/creating users: {:?}", e);
                        e
                    })?;

                let post = db::create_post(
                    &mut *tx,
                    CreatePost {
                        cid: message.cid.clone(),
                        rkey: message.rkey.clone(),
                        created_at: message.created_at.clone(),
                        text: message.text.clone(),
                        langs: message.langs.clone(),
                        urls: message.urls.clone(),
                        tags: message.tags.clone(),
                        author_id: users[0].id, // TODO: this is not the right author id, but good enough for testing
                    },
                )
                .await
                .map_err(|e| {
                    error!("Error creating post: {:?}", e);
                    e
                })?;

                db::link_post_to_interests(&mut *tx, post.id, &interest_ids)
                    .await
                    .map_err(|e| {
                        error!("Error linking post to interests: {:?}", e);
                        e
                    })?;

                db::link_mentions_to_post(
                    &mut *tx,
                    post.id,
                    users.iter().map(|user| user.id).collect(),
                )
                .await
                .map_err(|e| {
                    error!("Error linking mentions to post: {:?}", e);
                    e
                })?;

                tx.commit().await.map_err(|e| {
                    error!("Error committing transaction: {:?}", e);
                    e
                })?;

                state.send_message(post, interest_ids, akas).await;
            }

            Ok(())
        });

        Ok(())
    }
}
