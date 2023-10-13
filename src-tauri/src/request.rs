use crate::errors::RuntimeErrors;
use crate::token;
use reqwest::header::{ACCEPT, AUTHORIZATION, USER_AGENT};
use reqwest::{Client, Response};
use serde::Deserialize;

#[derive(Deserialize, Debug, serde::Serialize, Clone)]
pub struct NotificationSubject {
    pub title: String,
    pub url: Option<String>,
    pub latest_comment_url: Option<String>,
}

#[derive(Deserialize, Debug, serde::Serialize, Clone)]
pub struct Notification {
    pub id: String,
    pub subject: NotificationSubject,
    pub reason: String,
    pub updated_at: String,
}

#[derive(Deserialize, Debug)]
struct CommentPayload {
    html_url: Option<String>,
}

async fn github_request(url: &str) -> Result<Response, RuntimeErrors> {
    let token = token::get_token()?;
    let client = Client::new();
    let response = client
        .get(url)
        .header(USER_AGENT, "gh-notifier 0.4.0 - rust reqwest")
        .header(AUTHORIZATION, format!("Bearer {token}"))
        .header(ACCEPT, "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await?;
    response.error_for_status_ref()?;
    Ok(response)
}

pub(crate) async fn get_html_url_from_api_url(
    url: &Option<String>,
) -> Result<String, RuntimeErrors> {
    let fallback = "https://github.com/notifications".to_string();
    let url = match url {
        Some(url) => url,
        None => return Ok(fallback),
    };
    let response = github_request(url).await?;
    let response_json: CommentPayload = response.json().await?;
    match response_json.html_url {
        Some(url) => Ok(url),
        None => Ok(fallback),
    }
}

pub async fn notifications_json() -> Result<Vec<Notification>, RuntimeErrors> {
    let url = "https://api.github.com/notifications";
    let response = github_request(url).await?;
    let response_json: Vec<Notification> = response.json().await?;
    Ok(response_json)
}
