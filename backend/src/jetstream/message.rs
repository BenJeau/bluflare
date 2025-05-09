use serde::Deserialize;
use tracing::error;

use crate::models::interest::Interest;

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
enum Message {
    Commit { did: String, commit: Commit },
    Identity,
    Account,
}

#[derive(Deserialize)]
#[serde(tag = "operation", rename_all = "camelCase")]
enum Commit {
    Delete,
    Update,
    Create {
        record: Record,
        rkey: String,
        cid: String,
    },
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Record {
    text: String,
    created_at: String,
    #[serde(default)]
    langs: Vec<String>,
    #[serde(default)]
    facets: Vec<Facet>,
}

#[derive(Deserialize)]
struct Facet {
    features: Vec<Feature>,
}

#[derive(Deserialize)]
#[serde(tag = "$type")]
enum Feature {
    #[serde(rename = "app.bsky.richtext.facet#link")]
    Link { uri: String },
    #[serde(rename = "app.bsky.richtext.facet#tag")]
    Tag { tag: String },
    #[serde(rename = "app.bsky.richtext.facet#hashtag")]
    Hashtag { tag: String },
    #[serde(rename = "app.bsky.richtext.facet#mention")]
    Mention { did: String },
}

#[derive(Debug)]
pub struct JetstreamMessage {
    pub langs: Vec<String>,
    pub text: String,
    pub text_lower: String,
    pub created_at: String,
    pub did: String,
    pub cid: String,
    pub rkey: String,
    pub urls: Vec<String>,
    pub tags: Vec<String>,
    pub mentions: Vec<String>,
}

impl JetstreamMessage {
    pub fn new(message: String) -> Option<Self> {
        let Ok(message) = serde_json::from_str::<Message>(&message) else {
            error!("Invalid Jetstream message, ignoring: {message}");
            return None;
        };

        let Message::Commit { did, commit } = message else {
            return None;
        };

        let Commit::Create { record, rkey, cid } = commit else {
            return None;
        };

        let (mentions, urls, tags) = record
            .facets
            .iter()
            .flat_map(|facet| facet.features.iter())
            .fold(
                (Vec::new(), Vec::new(), Vec::new()),
                |(mut mentions, mut urls, mut tags), feature| {
                    match feature {
                        Feature::Mention { did } => mentions.push(did.clone()),
                        Feature::Link { uri } => urls.push(uri.clone()),
                        Feature::Tag { tag } => tags.push(tag.clone()),
                        Feature::Hashtag { tag } => tags.push(tag.clone()),
                    };
                    (mentions, urls, tags)
                },
            );

        Some(Self {
            rkey,
            cid,
            did,
            urls,
            tags,
            mentions,
            text_lower: record.text.to_lowercase(),
            langs: record.langs,
            text: record.text,
            created_at: record.created_at,
        })
    }

    pub fn matches_any_interest(&self, interests: &[Interest]) -> Vec<i64> {
        interests
            .iter()
            .filter(|i| self.matches_interest(i))
            .map(|i| i.id)
            .collect()
    }

    fn matches_interest(&self, interest: &Interest) -> bool {
        interest.keywords.iter().any(|k| {
            let k_lower = k.to_lowercase();
            self.text_lower.split_whitespace().any(|w| w == k_lower)
        })
    }
}
