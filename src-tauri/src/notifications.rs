use crate::request;
use crate::request::Notification;

#[derive(Clone, serde::Serialize)]
pub struct Payload {
    notifications: Vec<Notification>,
}

#[tauri::command]
pub async fn get_notifications() -> Payload {
    let result = request::notifications_json().await;

    if let Ok(res) = result {
        return Payload { notifications: res };
    }
    return Payload {
        notifications: vec![],
    };
}
