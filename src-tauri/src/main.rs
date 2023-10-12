// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn has_token() -> bool {
    true
}

#[tauri::command]
fn set_token(token: &str) -> bool {
    true
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![has_token, set_token])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
