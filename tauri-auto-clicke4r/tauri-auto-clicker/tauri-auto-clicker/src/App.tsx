import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar";
import ThemeSelector from "./components/ThemeSelector";
import SimpleSettings from "./components/SimpleSettings";
import AdvancedSettings from "./components/AdvancedSettings";
import StatsWidget from "./components/StatsWidget";
import LoadingScreen from "./components/LoadingScreen";
import MacroSettings from "./components/MacroSettings";
import ProfileManager from "./components/ProfileManager";

export type MacroStep = 
  | { type: 'click'; x: number; y: number; button: string }
  | { type: 'wait'; ms: number }
  | { type: 'keypress'; key: string };

export interface ClickerConfig {
  mode: "simple" | "advanced" | "macro";
  cps: number;
  button: string;
  randomize_cps: boolean;
  random_min: number;
  random_max: number;
  hold_duration_ms: number;
  double_click: boolean;
  stop_on_boundary: boolean;
  boundary_pixels: number;
  limit_clicks: boolean;
  max_clicks: number;
  limit_time: boolean;
  max_time_ms: number;
  fixed_coordinate: boolean;
  target_x: number;
  target_y: number;
  macro_steps: MacroStep[];
}

const DEFAULT_CONFIG: ClickerConfig = {
  mode: "simple",
  cps: 10,
  button: "left",
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
  macro_steps: [],
};

function App() {
  const [mode, setMode] = useState<"simple" | "advanced" | "macro">("simple");
  const [config, setConfig] = useState<ClickerConfig>(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [hotkey, setHotkey] = useState("F6");
  const [loading, setLoading] = useState(true);

  // Theme state
  const [theme, setTheme] = useState("midnight");

  const handleLoadingDone = useCallback(() => setLoading(false), []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Initial fetch and setup
  useEffect(() => {
    registerHotkey(hotkey);
    
    const interval = setInterval(async () => {
      const running = await invoke<boolean>("is_running");
      setIsRunning(running);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const updateConfigInRust = async (newConfig: ClickerConfig) => {
    await invoke("update_config", { newConfig });
  };

  const handleConfigChange = (newConfig: ClickerConfig) => {
    setConfig(newConfig);
    updateConfigInRust(newConfig);
  };

  const registerHotkey = async (key: string) => {
    try {
      await invoke("register_hotkey", { hotkey: key });
    } catch (e) {
      console.error("Failed to register hotkey", e);
    }
  };

  const onHotkeyChange = (key: string) => {
    setHotkey(key);
    registerHotkey(key);
  };

  const handleToggle = async () => {
    if (isRunning) {
      await invoke("stop_clicking");
      setIsRunning(false);
    } else {
      await invoke("start_clicking");
      setIsRunning(true);
    }
  };

  const toggleMiniMode = async () => {
    const newMini = !isMini;
    setIsMini(newMini);
    await invoke("set_mini_mode", { mini: newMini });
  };

  const handleModeChange = (newMode: "simple" | "advanced" | "macro") => {
    setMode(newMode);
    handleConfigChange({ ...config, mode: newMode });
  };

  if (isMini) {
    return (
      <div className="mini-mode" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px' }}>SWIFTSTRIKE</span>
          <button onClick={toggleMiniMode} style={{ opacity: 0.6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StatsWidget />
        </div>
        <button 
          onClick={handleToggle}
          className="btn-primary" 
          style={{ width: '100%', padding: '10px' }}
        >
          {isRunning ? "STOP" : "START"}
        </button>
      </div>
    );
  }

  return (
    <>
      <Sidebar currentMode={mode} onModeChange={handleModeChange} />
      
      <main style={{ padding: '32px 40px' }}>
        <div className="bg-glow glow-1"></div>
        <div className="bg-glow glow-2"></div>

        {loading && <LoadingScreen onDone={handleLoadingDone} />}
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '4px', fontWeight: 900, letterSpacing: '-1px' }}>SwiftStrike</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500 }}>Professional Suite</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={toggleMiniMode} 
              className="btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
              title="Mini Overlay"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="13" y1="3" x2="13" y2="21"/></svg>
              Mini Mode
            </button>
            <ThemeSelector currentTheme={theme} onChangeTheme={setTheme} />
          </div>
        </header>

        <div className="glass-panel" style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 10, overflowY: 'auto' }}>
          {mode === 'simple' ? (
            <SimpleSettings config={config} onChange={handleConfigChange} hotkey={hotkey} onHotkeyChange={onHotkeyChange} />
          ) : mode === 'advanced' ? (
            <AdvancedSettings config={config} onChange={handleConfigChange} hotkey={hotkey} onHotkeyChange={onHotkeyChange} />
          ) : (
            <MacroSettings config={config} onChange={handleConfigChange} />
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />
          
          <ProfileManager config={config} onLoadProfile={handleConfigChange} />

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '32px', borderTop: '1px solid var(--color-border)' }}>
            <StatsWidget />
            
            <button 
              onClick={handleToggle}
              className="btn-primary" 
              style={{ 
                padding: '16px 48px', 
                fontSize: '18px',
                fontWeight: 700,
                background: isRunning ? 'var(--color-surface-hover)' : '',
                boxShadow: isRunning ? 'none' : '0 8px 30px var(--color-primary-glow)',
                transform: isRunning ? 'translateY(1px)' : ''
              }}
            >
              {isRunning ? `STOP (${hotkey})` : `START SWIFTSTRIKE`}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
