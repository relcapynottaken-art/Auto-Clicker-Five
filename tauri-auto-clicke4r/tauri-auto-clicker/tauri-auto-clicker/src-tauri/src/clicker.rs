use enigo::{Button, Direction, Enigo, Mouse, Settings};
use rand::RngExt;
use spin_sleep::sleep as spin_slp;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};

#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum MacroStep {
    Click { x: i32, y: i32, button: String },
    Wait { ms: u64 },
    KeyPress { key: String },
}

#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct ClickerConfig {
    pub mode: String, // "simple", "advanced", "macro"
    pub cps: u32,
    pub button: String,
    pub randomize_cps: bool,
    pub random_min: u32,
    pub random_max: u32,
    pub hold_duration_ms: u32,
    pub double_click: bool,
    pub stop_on_boundary: bool,
    pub boundary_pixels: u32,
    pub limit_clicks: bool,
    pub max_clicks: u64,
    pub limit_time: bool,
    pub max_time_ms: u64,
    pub fixed_coordinate: bool,
    pub target_x: i32,
    pub target_y: i32,
    pub macro_steps: Vec<MacroStep>,
}

impl Default for ClickerConfig {
    fn default() -> Self {
        Self {
            mode: "simple".to_string(),
            cps: 10,
            button: "left".to_string(),
            randomize_cps: false,
            random_min: 8,
            random_max: 12,
            hold_duration_ms: 0,
            double_click: false,
            stop_on_boundary: false,
            boundary_pixels: 5,
            limit_clicks: false,
            max_clicks: 100,
            limit_time: false,
            max_time_ms: 10000,
            fixed_coordinate: false,
            target_x: 0,
            target_y: 0,
            macro_steps: Vec::new(),
        }
    }
}

pub struct ClickerState {
    pub is_running: Arc<AtomicBool>,
    pub stats_clicks: Arc<Mutex<u64>>,
    pub config: Arc<Mutex<ClickerConfig>>,
}

impl Default for ClickerState {
    fn default() -> Self {
        Self {
            is_running: Arc::new(AtomicBool::new(false)),
            stats_clicks: Arc::new(Mutex::new(0)),
            config: Arc::new(Mutex::new(ClickerConfig::default())),
        }
    }
}

pub fn start_clicker(state: tauri::State<'_, ClickerState>) -> Result<(), String> {
    if state.is_running.load(Ordering::SeqCst) {
        return Ok(());
    }

    state.is_running.store(true, Ordering::SeqCst);
    
    *state.stats_clicks.lock().unwrap() = 0;

    let is_running = state.is_running.clone();
    let stats_clicks = state.stats_clicks.clone();
    let config_val = state.config.lock().unwrap().clone();

    thread::spawn(move || {
        let mut enigo = Enigo::new(&Settings::default()).expect("Failed to initialize Enigo");
        
        let mouse_btn = match config_val.button.as_str() {
            "right" => Button::Right,
            "middle" => Button::Middle,
            _ => Button::Left,
        };

        let start_time = Instant::now();
        let mut rng = rand::rng();

        while is_running.load(Ordering::SeqCst) {
            if config_val.mode == "macro" {
                for step in &config_val.macro_steps {
                    if !is_running.load(Ordering::SeqCst) { break; }

                    match step {
                        MacroStep::Click { x, y, button } => {
                            let _ = enigo.move_mouse(*x, *y, enigo::Coordinate::Abs);
                            let btn = match button.as_str() {
                                "right" => Button::Right,
                                "middle" => Button::Middle,
                                _ => Button::Left,
                            };
                            let _ = enigo.button(btn, Direction::Press);
                            let _ = enigo.button(btn, Direction::Release);
                            
                            let mut clicks = stats_clicks.lock().unwrap();
                            *clicks += 1;
                        }
                        MacroStep::Wait { ms } => {
                            spin_slp(Duration::from_millis(*ms));
                        }
                        MacroStep::KeyPress { key } => {
                            // Basic mapping for common keys
                            use enigo::Key;
                            let enigo_key = match key.to_lowercase().as_str() {
                                "enter" => Some(Key::Return),
                                "space" => Some(Key::Space),
                                "tab" => Some(Key::Tab),
                                "backspace" => Some(Key::Backspace),
                                "escape" => Some(Key::Escape),
                                s if s.len() == 1 => Some(Key::Unicode(s.chars().next().unwrap())),
                                _ => None,
                            };
                            if let Some(k) = enigo_key {
                                use enigo::Keyboard;
                                let _ = enigo.key(k, Direction::Press);
                                let _ = enigo.key(k, Direction::Release);
                            }
                        }
                    }
                }
                // Small yield to prevent 100% CPU if macro is empty or all-clicks
                spin_slp(Duration::from_millis(1));
            } else {
                // Check limits
                if config_val.limit_time && start_time.elapsed().as_millis() as u64 >= config_val.max_time_ms {
                    is_running.store(false, Ordering::SeqCst);
                    break;
                }

                if config_val.limit_clicks {
                    let current_clicks = *stats_clicks.lock().unwrap();
                    if current_clicks >= config_val.max_clicks {
                        is_running.store(false, Ordering::SeqCst);
                        break;
                    }
                }

                // Check boundaries
                if config_val.stop_on_boundary {
                    if let Ok((x, y)) = enigo.location() {
                        let boundary = config_val.boundary_pixels as i32;
                        if x < boundary || y < boundary {
                            is_running.store(false, Ordering::SeqCst);
                            break;
                        }
                    }
                }

                // Move to Target if specified
                if config_val.fixed_coordinate {
                    let _ = enigo.move_mouse(config_val.target_x, config_val.target_y, enigo::Coordinate::Abs);
                }

                // Click Execution
                let click_count = if config_val.double_click { 2 } else { 1 };
                
                for _ in 0..click_count {
                    let _ = enigo.button(mouse_btn, Direction::Press);
                    if config_val.hold_duration_ms > 0 {
                        spin_slp(Duration::from_millis(config_val.hold_duration_ms as u64));
                    }
                    let _ = enigo.button(mouse_btn, Direction::Release);
                    
                    if config_val.double_click {
                        // Small delay between double clicks
                        spin_slp(Duration::from_millis(10));
                    }

                    // Increment stats
                    {
                        let mut clicks = stats_clicks.lock().unwrap();
                        *clicks += 1;
                    }
                }

                // Sleep logic
                let cps = if config_val.randomize_cps && config_val.random_min > 0 && config_val.random_max >= config_val.random_min {
                    rng.random_range(config_val.random_min..=config_val.random_max)
                } else {
                    config_val.cps
                };

                let cps = if cps == 0 { 1 } else { cps };
                
                // Subtract the hold duration from the total sleep duration to maintain accurate CPS
                let total_micros = 1_000_000 / cps as u64;
                let hold_micros = (config_val.hold_duration_ms as u64) * 1000 * click_count as u64;
                
                let sleep_micros = if total_micros > hold_micros {
                    total_micros - hold_micros
                } else {
                    10 // Minimum 10 microsecond yield
                };
                
                spin_slp(Duration::from_micros(sleep_micros));
            }
        }
    });

    Ok(())
}

pub fn get_mouse_position() -> Result<(i32, i32), String> {
    let enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    enigo.location().map_err(|e| e.to_string())
}

pub fn stop_clicker(state: tauri::State<'_, ClickerState>) {
    state.is_running.store(false, Ordering::SeqCst);
}
