// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod errors;
mod notifications;
mod request;
mod search;
mod token;

use notifications::get_notifications;
use request::{has_token, unsubscribe};
use search::gh_search;
use token::set_token;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_notifications,
            has_token,
            set_token,
            gh_search,
            unsubscribe
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
