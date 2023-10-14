// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod notifications;
mod request;
mod token;
mod errors;
mod search;

use notifications::{get_notifications, set_token, single_request};


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn has_token() -> bool {
    match single_request().await { Ok(_) => true, _ => false }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_notifications, has_token, set_token])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
