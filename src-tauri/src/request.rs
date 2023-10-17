use crate::errors::RuntimeErrors;
use crate::token;
use chrono::{DateTime, Utc}; // 0.4.15
use reqwest::header::{ACCEPT, AUTHORIZATION, USER_AGENT};
use reqwest::{Client, Response};
use serde::Deserialize;
use std::collections::HashMap;
use std::time::SystemTime;
use url::Url;

static DEFAULT_USER_AGENT: &str = "hubhelper 0.1 (Rust reqwest)";

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
    pub subscription_url: String,
}

async fn github_request(url: &str) -> Result<Response, RuntimeErrors> {
    let token = token::get_token()?;
    let client = Client::new();
    let response = client
        .get(url)
        .header(USER_AGENT, DEFAULT_USER_AGENT)
        .header(AUTHORIZATION, format!("Bearer {token}"))
        .header(ACCEPT, "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await?;
    response.error_for_status_ref()?;
    Ok(response)
}

fn remove_last_segment(url_str: &str) -> Result<String, url::ParseError> {
    let mut url = Url::parse(url_str)?;
    {
        let mut path_segments = url.path_segments_mut().unwrap();
        path_segments.pop_if_empty();
        path_segments.pop();
    }
    Ok(url.into())
}

pub async fn unsubscribe_request(url: &str) -> Result<(), RuntimeErrors> {
    let mark_read_url = remove_last_segment(url).unwrap();
    println!("{}", &mark_read_url);

    let mut map = HashMap::new();
    map.insert("ignored", true);
    let token = token::get_token()?;
    let client = Client::new();
    let response = client
        .put(url)
        .json(&map)
        .header(USER_AGENT, DEFAULT_USER_AGENT)
        .header(AUTHORIZATION, format!("Bearer {token}"))
        .header(ACCEPT, "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await?;
    response.error_for_status_ref()?;

    // mark original notification as read
    let now = SystemTime::now();
    let now: DateTime<Utc> = now.into();
    let now = now.to_rfc3339();
    let mut map1 = HashMap::new();
    let mut map2 = HashMap::new();
    map1.insert("read", true);
    map2.insert("last_read_at", now);
    let token = token::get_token()?;
    let client = Client::new();
    let response = client
        .patch(mark_read_url)
        .header(USER_AGENT, "gh-notifier 0.4.0 - rust reqwest")
        .header(AUTHORIZATION, format!("Bearer {token}"))
        .header(ACCEPT, "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28");

    match response.send().await {
        Ok(r) => {
            let status = r.status();
            println!("{}", status);
            Ok(())
        }
        Err(err) => {
            eprintln!("{}", err);
            Err(err.into())
        }
    }
}

#[tauri::command]
pub async fn unsubscribe(url: &str) -> Result<(), ()> {
    match unsubscribe_request(url).await {
        _ => (),
    };
    Ok(())
}

pub async fn notifications_json() -> Result<Vec<Notification>, RuntimeErrors> {
    let url = "https://api.github.com/notifications";
    let response = github_request(url).await?;
    let response_json: Vec<Notification> = response.json().await?;
    Ok(response_json)
}

#[tauri::command]
pub async fn has_token() -> bool {
    match notifications_json().await {
        Ok(_) => true,
        _ => false,
    }
}
