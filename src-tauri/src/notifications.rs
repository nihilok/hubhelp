use std::env;
use crate::request;
use crate::request::Notification;
use crate::token::write_token_to_file;

#[derive(Clone, serde::Serialize)]
pub struct Payload {
    notifications: Vec<Notification>,
}

pub async fn single_request() -> Result<Vec<Notification>, crate::errors::RuntimeErrors> {
    match request::notifications_json().await {
        Ok(response) => Ok(response),
        Err(err) => Err(err)
    }
}

#[tauri::command]
pub async fn get_notifications() -> Payload {
    let result = single_request().await;

    if let Ok(res) = result {
    return Payload { notifications: res}
    }
    return Payload {notifications: vec![]}
}

#[tauri::command]
pub fn set_token(token: &str) -> bool {
    write_token_to_file(token);
    env::set_var("GH_NOTIFIER_TOKEN", token);
    true
}
