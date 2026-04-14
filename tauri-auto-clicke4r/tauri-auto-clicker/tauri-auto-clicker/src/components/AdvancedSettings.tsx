import { ClickerConfig } from "../App";

interface Props {
  config: ClickerConfig;
  onChange: (config: ClickerConfig) => void;
  hotkey: string;
  onHotkeyChange: (key: string) => void;
}

export default function AdvancedSettings({ config, onChange, hotkey, onHotkeyChange }: Props) {
  
  const toggleCheckbox = (key: keyof ClickerConfig) => {
    onChange({ ...config, [key]: !config[key] });
  };

  const updateNumber = (key: keyof ClickerConfig, value: string) => {
    const parsed = parseInt(value);
    if (!isNaN(parsed)) {
      onChange({ ...config, [key]: parsed });
    } else if (value === "") {
      onChange({ ...config, [key]: 0 });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Container for common inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

      {/* Core Click Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-muted)' }}>HOLD DURATION (MS)</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              type="range" 
              min="0" 
              max="500" 
              step="5"
              value={config.hold_duration_ms}
              onChange={(e) => updateNumber('hold_duration_ms', e.target.value)}
              style={{ flex: 1, accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>{config.hold_duration_ms}ms</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-muted)' }}>SPECIAL</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', height: '100%' }}>
            <input 
              type="checkbox" 
              checked={config.double_click} 
              onChange={() => toggleCheckbox('double_click')} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontWeight: 600 }}>Enable Double-Click</span>
          </label>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

      {/* Randomization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={config.randomize_cps} 
            onChange={() => toggleCheckbox('randomize_cps')} 
            style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
          />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Randomize Click Speed (Humanize)</span>
        </label>
        
        {config.randomize_cps && (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingLeft: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>MIN CPS</span>
              <input 
                type="number" 
                value={config.random_min}
                onChange={(e) => updateNumber('random_min', e.target.value)}
                style={{ width: '80px', padding: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>MAX CPS</span>
              <input 
                type="number" 
                value={config.random_max}
                onChange={(e) => updateNumber('random_max', e.target.value)}
                style={{ width: '80px', padding: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: '4px' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Constraints */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={config.stop_on_boundary} 
              onChange={() => toggleCheckbox('stop_on_boundary')} 
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontWeight: 600 }}>Stop when moving mouse near screen edge</span>
          </label>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', paddingLeft: '26px' }}>
            Safety feature to regain control if stuck at extreme CPS.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={config.limit_clicks} 
              onChange={() => toggleCheckbox('limit_clicks')} 
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontWeight: 600 }}>Stop after X clicks</span>
          </label>
          {config.limit_clicks && (
            <div style={{ paddingLeft: '26px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="number" 
                value={config.max_clicks}
                onChange={(e) => updateNumber('max_clicks', e.target.value)}
                style={{ width: '100px', padding: '6px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: '4px' }}
              />
              <span>clicks</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={config.limit_time} 
              onChange={() => toggleCheckbox('limit_time')} 
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontWeight: 600 }}>Stop after running duration</span>
          </label>
          {config.limit_time && (
            <div style={{ paddingLeft: '26px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="number" 
                value={config.max_time_ms}
                onChange={(e) => updateNumber('max_time_ms', e.target.value)}
                style={{ width: '100px', padding: '6px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: '4px' }}
              />
              <span>milliseconds</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={config.fixed_coordinate} 
              onChange={() => toggleCheckbox('fixed_coordinate')} 
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontWeight: 600 }}>Click at fixed screen coordinates</span>
          </label>
          {config.fixed_coordinate && (
            <div style={{ paddingLeft: '26px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>X:</span>
              <input 
                type="number" 
                value={config.target_x}
                onChange={(e) => updateNumber('target_x', e.target.value)}
                style={{ width: '80px', padding: '6px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: '4px' }}
              />
              <span>Y:</span>
              <input 
                type="number" 
                value={config.target_y}
                onChange={(e) => updateNumber('target_y', e.target.value)}
                style={{ width: '80px', padding: '6px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: '4px' }}
              />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
