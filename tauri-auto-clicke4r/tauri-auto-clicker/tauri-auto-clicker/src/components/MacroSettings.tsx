import { ClickerConfig, MacroStep } from "../App";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  config: ClickerConfig;
  onChange: (config: ClickerConfig) => void;
}

export default function MacroSettings({ config, onChange }: Props) {
  
  const addStep = (type: 'click' | 'wait' | 'keypress') => {
    let newStep: MacroStep;
    if (type === 'click') {
      newStep = { type: 'click', x: 0, y: 0, button: 'left' };
    } else if (type === 'wait') {
      newStep = { type: 'wait', ms: 500 };
    } else {
      newStep = { type: 'keypress', key: 'Enter' };
    }
    onChange({ ...config, macro_steps: [...config.macro_steps, newStep] });
  };

  const removeStep = (index: number) => {
    const newSteps = [...config.macro_steps];
    newSteps.splice(index, 1);
    onChange({ ...config, macro_steps: newSteps });
  };

  const updateStep = (index: number, updates: Partial<MacroStep>) => {
    const newSteps = [...config.macro_steps];
    newSteps[index] = { ...newSteps[index], ...updates } as MacroStep;
    onChange({ ...config, macro_steps: newSteps });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...config.macro_steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    onChange({ ...config, macro_steps: newSteps });
  };

  const grabPosition = async (index: number) => {
    try {
      // Small delay to let the user move the mouse after clicking the button?
      // Or just grab it immediately if they are hovering over the spot.
      // Usually "Grab" requires them to be at the spot. 
      // We can add a 2s delay if we want.
      const pos = await invoke<[number, number]>("get_mouse_position");
      updateStep(index, { x: pos[0], y: pos[1] } as any);
    } catch (e) {
      console.error("Failed to grab mouse position", e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => addStep('click')} className="btn-secondary" style={{ flex: 1, fontSize: '12px' }}>+ Add Click</button>
        <button onClick={() => addStep('wait')} className="btn-secondary" style={{ flex: 1, fontSize: '12px' }}>+ Add Wait</button>
        <button onClick={() => addStep('keypress')} className="btn-secondary" style={{ flex: 1, fontSize: '12px' }}>+ Add Key</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {config.macro_steps.map((step, index) => (
          <div key={index} className="glass-panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)' }}>Step {index + 1}: {step.type}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => moveStep(index, 'up')} style={{ fontSize: '10px', opacity: 0.6 }}>↑</button>
                <button onClick={() => moveStep(index, 'down')} style={{ fontSize: '10px', opacity: 0.6 }}>↓</button>
                <button onClick={() => removeStep(index)} style={{ fontSize: '10px', color: '#ff4d4d', marginLeft: '8px' }}>Remove</button>
              </div>
            </div>

            {step.type === 'click' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  value={step.x} 
                  onChange={(e) => updateStep(index, { x: parseInt(e.target.value) })}
                  style={{ width: '60px', padding: '4px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff' }}
                  placeholder="X"
                />
                <input 
                  type="number" 
                  value={step.y} 
                  onChange={(e) => updateStep(index, { y: parseInt(e.target.value) })}
                  style={{ width: '60px', padding: '4px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff' }}
                  placeholder="Y"
                />
                <button onClick={() => grabPosition(index)} style={{ fontSize: '11px', background: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>Grab</button>
                <select 
                  value={step.button} 
                  onChange={(e) => updateStep(index, { button: e.target.value })}
                  style={{ padding: '4px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff' }}
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="middle">Middle</option>
                </select>
              </div>
            )}

            {step.type === 'wait' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  value={step.ms} 
                  onChange={(e) => updateStep(index, { ms: parseInt(e.target.value) })}
                  style={{ width: '100px', padding: '4px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff' }}
                />
                <span style={{ fontSize: '12px' }}>ms delay</span>
              </div>
            )}

            {step.type === 'keypress' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={step.key} 
                  onChange={(e) => updateStep(index, { key: e.target.value })}
                  style={{ width: '120px', padding: '4px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Common: Enter, Space, Tab, Escape, etc.</span>
              </div>
            )}
          </div>
        ))}
        {config.macro_steps.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '20px' }}>No macro steps yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}
