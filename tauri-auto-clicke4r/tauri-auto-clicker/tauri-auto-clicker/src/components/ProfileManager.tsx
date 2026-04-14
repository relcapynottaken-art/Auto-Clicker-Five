import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ClickerConfig } from "../App";

interface Props {
  config: ClickerConfig;
  onLoadProfile: (config: ClickerConfig) => void;
}

export default function ProfileManager({ config, onLoadProfile }: Props) {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [newProfileName, setNewProfileName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    loadProfileList();
  }, []);

  const loadProfileList = async () => {
    try {
      const list = await invoke<string[]>("list_profiles");
      setProfiles(list);
    } catch (e) {
      console.error("Failed to list profiles", e);
    }
  };

  const handleSave = async () => {
    if (!newProfileName) return;
    try {
      await invoke("save_profile", { name: newProfileName, config });
      setNewProfileName("");
      setShowSaveInput(false);
      loadProfileList();
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  };

  const handleLoad = async (name: string) => {
    try {
      const loadedConfig = await invoke<ClickerConfig>("load_profile", { name });
      onLoadProfile(loadedConfig);
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Configuration Profiles</h3>
        <button 
          onClick={() => setShowSaveInput(!showSaveInput)}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          {showSaveInput ? "Cancel" : "Save Current"}
        </button>
      </div>

      {showSaveInput && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Profile Name..."
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '8px 12px', 
              background: 'var(--color-surface)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '6px',
              color: '#fff'
            }}
          />
          <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 16px' }}>Save</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
        {profiles.map(name => (
          <button 
            key={name}
            onClick={() => handleLoad(name)}
            className="glass-panel"
            style={{ 
              padding: '12px', 
              textAlign: 'left', 
              fontSize: '13px', 
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginBottom: '2px' }}>PROFILE</div>
            {name}
          </button>
        ))}
        {profiles.length === 0 && !showSaveInput && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', gridColumn: '1/-1', textAlign: 'center', padding: '12px' }}>
            No saved profiles yet.
          </p>
        )}
      </div>
    </div>
  );
}
