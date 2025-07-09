import React from 'react';

interface SpeedometerOverlayProps {
  power: number; // 0 to 1
  animatedValue: number; // 0 to 100
  showWow: boolean;
}

const MILESTONES = [50, 75, 100];

export default function SpeedometerOverlay({ power, animatedValue, showWow }: SpeedometerOverlayProps) {
  // Animate needle and arc
  const arcLength = Math.PI * 40;
  const milestone = MILESTONES.find(m => Math.abs(animatedValue - m) < 2);
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 w-full h-full">
      <svg width="100%" height="100%" viewBox="0 0 260 160" className="drop-shadow-2xl max-w-xs w-full h-auto">
        {/* Arc background */}
        <path d="M40,140 A80,80 0 0,1 220,140" fill="none" stroke="#e5e7eb" strokeWidth="20" />
        {/* Arc fill */}
        <path
          d="M40,140 A80,80 0 0,1 220,140"
          fill="none"
          stroke="url(#speedoOverlayGradient)"
          strokeWidth="20"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - power)}
          style={{transition: 'stroke-dashoffset 0.15s linear'}}
        />
        <defs>
          <linearGradient id="speedoOverlayGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Needle */}
        <g style={{transition: 'transform 0.1s linear', transform: `rotate(${-90 + 180 * power} 130 140)`}}>
          <rect x="127" y="40" width="6" height="70" rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="130" cy="140" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
        </g>
        {/* Glow at max */}
        {power > 0.98 && (
          <circle cx="130" cy="140" r="40" fill="#fde68a" opacity="0.15">
            <animate attributeName="opacity" values="0.15;0.35;0.15" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        {/* Milestone pop effect */}
        {milestone && (
          <g>
            <circle cx="130" cy="140" r="32" fill="#fbbf24" opacity="0.18">
              <animate attributeName="r" from="32" to="52" dur="0.25s" fill="freeze" />
              <animate attributeName="opacity" from="0.18" to="0" dur="0.25s" fill="freeze" />
            </circle>
          </g>
        )}
      </svg>
      {/* Animated numeric value */}
      <div className={`absolute left-0 right-0 top-14 sm:top-16 flex flex-col items-center justify-center text-4xl sm:text-5xl font-black ${milestone ? 'animate-bounce text-yellow-400' : 'text-white'} drop-shadow-lg w-full`}>
        {Math.round(animatedValue)}
        <span className="text-xs sm:text-base font-bold text-yellow-400 mt-1 tracking-widest">SPEED</span>
      </div>
      {/* WOW/MAX visual */}
      {showWow && (
        <div className="absolute left-0 right-0 top-2 flex items-center justify-center text-3xl sm:text-6xl font-black animate-bounce text-fuchsia-400 drop-shadow-2xl wow-text-glow w-full">
          WOW!
        </div>
      )}
    </div>
  );
}

// Mobile-first: All elements scale with parent, never overflow, text is always readable.
