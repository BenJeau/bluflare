use tracing::{error, info};

use crate::{
    Result, config,
    db::Database,
    jetstream::{did::DidClient, message::JetstreamMessage},
    models::{interest::Interest, post::CreatePost},
};

pub struct Processor {
    did_client: DidClient,
    db: Database,
}

impl Processor {
    pub fn new(config: config::Jetstream, db: Database) -> Result<Self> {
        let did_client = DidClient::new(config.did_resolver)?;

        Ok(Self { did_client, db })
    }

    pub fn process_message(
        &self,
        message: JetstreamMessage,
        interests: Vec<Interest>,
    ) -> Result<()> {
        let db = self.db.clone();
        let did_client = self.did_client.clone();

        tokio::spawn(async move {
            let interest_ids = message.matches_any_interest(&interests);
            if !interest_ids.is_empty() {
                info!(
                    "Found {} interests for post: {:?}",
                    interest_ids.len(),
                    message.text
                );

                let aka = match did_client.resolve_did(message.did.clone()).await {
                    Ok(aka) => aka,
                    Err(e) => {
                        error!("Error resolving DID: {:?}", e);
                        return Err(e);
                    }
                };

                let posts = interest_ids
                    .into_iter()
                    .map(|interest_id| CreatePost {
                        did: message.did.clone(),
                        cid: message.cid.clone(),
                        rkey: message.rkey.clone(),
                        created_at: message.created_at.clone(),
                        text: message.text.clone(),
                        langs: message.langs.clone(),
                        urls: message.urls.clone(),
                        tags: message.tags.clone(),
                        mentions: message.mentions.clone(),
                        interest_id,
                        aka: aka.clone(),
                    })
                    .collect();

                db.bulk_create_posts(posts).await.map_err(|e| {
                    error!("Error creating posts: {:?}", e);
                    e
                })?;
            }

            Ok(())
        });

        Ok(())
    }
}
