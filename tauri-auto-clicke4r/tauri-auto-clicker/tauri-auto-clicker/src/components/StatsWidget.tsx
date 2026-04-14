import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function StatsWidget() {
  const [stats, setStats] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const val = await invoke<number>("get_stats");
        setStats(val);
      } catch (e) {
        // ignore initially if app not fully loaded
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Session Clicks
      </span>
      <span style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)' }}>
        {stats.toLocaleString()}
      </span>
    </div>
  );
}
