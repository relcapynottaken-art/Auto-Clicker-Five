mod clicker;

use clicker::{ClickerConfig, ClickerState};
use std::sync::atomic::Ordering;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use std::str::FromStr;

#[tauri::command]
fn start_clicking(state: State<'_, ClickerState>) -> Result<(), String> {
    clicker::start_clicker(state)
}

#[tauri::command]
fn stop_clicking(state: State<'_, ClickerState>) {
    clicker::stop_clicker(state)
}

#[tauri::command]
fn get_stats(state: State<'_, ClickerState>) -> u64 {
    let clicks = state.stats_clicks.lock().unwrap();
    *clicks
}

#[tauri::command]
fn update_config(new_config: ClickerConfig, state: State<'_, ClickerState>, _app: AppHandle) -> Result<(), String> {
    let mut config = state.config.lock().unwrap();
    *config = new_config.clone();
    Ok(())
}

#[tauri::command]
fn is_running(state: State<'_, ClickerState>) -> bool {
    state.is_running.load(Ordering::SeqCst)
}

#[tauri::command]
fn register_hotkey(hotkey: String, app: AppHandle) -> Result<(), String> {
    let _ = app.global_shortcut().unregister_all();
    let shortcut = Shortcut::from_str(&hotkey).map_err(|e| e.to_string())?;
    
    app.global_shortcut().on_shortcut(shortcut, move |app, _shortcut, event| {
        if event.state() == ShortcutState::Pressed {
            let state = app.state::<ClickerState>();
            let running = state.is_running.load(Ordering::SeqCst);
            if running {
                clicker::stop_clicker(state);
            } else {
                let _ = clicker::start_clicker(state);
            }
        }
    }).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_mouse_position() -> Result<(i32, i32), String> {
    clicker::get_mouse_position()
}

#[tauri::command]
fn set_mini_mode(mini: bool, app: AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Main window not found")?;
    if mini {
        window.set_always_on_top(true).map_err(|e| e.to_string())?;
        window.set_size(tauri::LogicalSize::new(300.0, 180.0)).map_err(|e| e.to_string())?;
        window.set_resizable(false).map_err(|e| e.to_string())?;
    } else {
        window.set_always_on_top(false).map_err(|e| e.to_string())?;
        window.set_size(tauri::LogicalSize::new(800.0, 600.0)).map_err(|e| e.to_string())?;
        window.set_resizable(true).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn save_profile(name: String, config: ClickerConfig, app: AppHandle) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let profiles_dir = app_dir.join("profiles");
    std::fs::create_dir_all(&profiles_dir).map_err(|e| e.to_string())?;
    
    let file_path = profiles_dir.join(format!("{}.json", name));
    let json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    std::fs::write(file_path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_profile(name: String, app: AppHandle) -> Result<ClickerConfig, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let file_path = app_dir.join("profiles").join(format!("{}.json", name));
    let json = std::fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    let config: ClickerConfig = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
fn list_profiles(app: AppHandle) -> Result<Vec<String>, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let profiles_dir = app_dir.join("profiles");
    if !profiles_dir.exists() {
        return Ok(Vec::new());
    }
    
    let mut names = Vec::new();
    for entry in std::fs::read_dir(profiles_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().map_or(false, |ext| ext == "json") {
            if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                names.push(name.to_string());
            }
        }
    }
    Ok(names)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(ClickerState::default())
        .invoke_handler(tauri::generate_handler![
            start_clicking,
            stop_clicking,
            get_stats,
            update_config,
            is_running,
            register_hotkey,
            get_mouse_position,
            set_mini_mode,
            save_profile,
            load_profile,
            list_profiles
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
