import { ClickerConfig } from "../App";

interface Props {
  config: ClickerConfig;
  onChange: (config: ClickerConfig) => void;
  hotkey: string;
  onHotkeyChange: (key: string) => void;
}

export default function SimpleSettings({ config, onChange, hotkey, onHotkeyChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Target CPS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label style={{ fontWeight: 600 }}>Target CPS (Clicks Per Second)</label>
          <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{config.cps}</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="1000" 
          value={config.cps}
          onChange={(e) => onChange({ ...config, cps: parseInt(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <span>1</span>
          <span>1000</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Mouse Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 600 }}>Mouse Button</label>
          <select 
            value={config.button} 
            onChange={(e) => onChange({ ...config, button: e.target.value })}
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-main)',
              border: '1px solid var(--color-border)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <option value="left">Left Click</option>
            <option value="right">Right Click</option>
            <option value="middle">Middle Click</option>
          </select>
        </div>

        {/* Hotkey Binding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 600 }}>Toggle Hotkey</label>
          <input 
            type="text" 
            value={hotkey}
            onChange={(e) => onHotkeyChange(e.target.value.toUpperCase())}
            spellCheck={false}
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-main)',
              border: '1px solid var(--color-border)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: '1px'
            }}
          />
        </div>
      </div>

    </div>
  );
}
