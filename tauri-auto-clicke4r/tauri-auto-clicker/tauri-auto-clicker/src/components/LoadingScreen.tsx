import { useEffect, useState } from "react";
import "./LoadingScreen.css";

interface Props {
  onDone: () => void;
}

export default function LoadingScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    // Enter → hold after 600ms
    const t1 = setTimeout(() => setPhase("hold"), 600);
    // Hold → exit after 1.8s
    const t2 = setTimeout(() => setPhase("exit"), 1800);
    // Unmount & hand off after exit animation finishes (400ms)
    const t3 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`loading-screen loading-${phase}`}>
      {/* Radial glow behind the logo */}
      <div className="loading-glow" />

      {/* Animated lightning bolt */}
      <div className="loading-bolt">
        <svg viewBox="0 0 40 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M24 2L4 36H20L16 62L36 28H20L24 2Z"
            fill="url(#boltGrad)"
            stroke="url(#boltGrad)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="boltGrad" x1="20" y1="2" x2="20" y2="62" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--color-primary)" />
              <stop offset="1" stopColor="var(--color-accent)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand name */}
      <div className="loading-wordmark">
        <span className="loading-swift">Swift</span>
        <span className="loading-strike">Strike</span>
      </div>

      {/* Tagline */}
      <p className="loading-tagline">Precision at every click</p>

      {/* Progress bar */}
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}
