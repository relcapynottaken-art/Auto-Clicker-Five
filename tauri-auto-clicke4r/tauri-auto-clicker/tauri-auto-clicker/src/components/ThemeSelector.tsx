import { useState } from "react";

interface ThemeSelectorProps {
  currentTheme: string;
  onChangeTheme: (theme: string) => void;
}

export default function ThemeSelector({ currentTheme, onChangeTheme }: ThemeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customPrimary, setCustomPrimary] = useState("#ffaa00");
  const [customAccent, setCustomAccent] = useState("#ff3300");

  const themes = [
    { id: "midnight", name: "Midnight" },
    { id: "cyberpunk", name: "Cyberpunk" },
    { id: "blood", name: "Blood" },
    { id: "custom", name: "Custom" },
  ];

  const handleCustomThemeUpdate = (primary: string, accent: string) => {
    setCustomPrimary(primary);
    setCustomAccent(accent);
    
    // Convert hex to rgb for glow effect loosely
    const root = document.documentElement;
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--color-primary-glow', `${primary}80`); // approx 50% opacity hex
    root.style.setProperty('--color-accent-glow', `${accent}80`);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChangeTheme(val);
    
    if (val === "custom") {
      setShowCustom(true);
      handleCustomThemeUpdate(customPrimary, customAccent);
    } else {
      setShowCustom(false);
      // Reset custom properties so data-theme takes over completely
      const root = document.documentElement;
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-accent');
      root.style.removeProperty('--color-primary-glow');
      root.style.removeProperty('--color-accent-glow');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <select 
        value={currentTheme} 
        onChange={handleSelect}
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-text-main)',
          border: '1px solid var(--color-border)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        {themes.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      
      {showCustom && (
        <div style={{ display: 'flex', gap: '8px', background: 'var(--color-surface)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <input 
            type="color" 
            value={customPrimary} 
            onChange={e => handleCustomThemeUpdate(e.target.value, customAccent)} 
            style={{ width: '28px', height: '28px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
            title="Primary Color"
          />
          <input 
            type="color" 
            value={customAccent} 
            onChange={e => handleCustomThemeUpdate(customPrimary, e.target.value)} 
            style={{ width: '28px', height: '28px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
            title="Accent Color"
          />
        </div>
      )}
    </div>
  );
}
