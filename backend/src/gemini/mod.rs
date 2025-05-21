mod client;

use crate::{Result, config};

#[derive(Clone)]
pub struct GeminiClient {
    client: client::GenericGeminiClient,
}

impl GeminiClient {
    pub fn new(config: &config::Gemini) -> Result<Self> {
        let client = client::GenericGeminiClient::new(config)?;
        Ok(Self { client })
    }

    pub async fn generate_keywords(
        &self,
        subject: &str,
        description: &str,
    ) -> Result<Option<Vec<String>>> {
        let prompt = format!(
            "Generate 10-20 relevant keywords for the following subject and description. Return only the keywords separated by commas, no other text.\n\nSubject: {subject}\nDescription: {description}",
        );

        let Some(response) = self.client.send_request(prompt).await? else {
            return Ok(None);
        };

        let keywords = response.split(',').map(|s| s.trim().to_string()).collect();

        Ok(Some(keywords))
    }

    pub async fn analyze_posts(&self, posts: &[String]) -> Result<Option<String>> {
        let prompt = format!(
            "Analyze these posts and provide a summary including:\n\
- Overall sentiment and tone\n\
- Key topics and themes\n\
- Major points being discussed\n\
- Any notable patterns or trends\n\
- Brief summary of the discussion\n\n\
Posts to analyze:\n{}",
            posts.join("\n\n")
        );

        self.client.send_request(prompt).await
    }
}
