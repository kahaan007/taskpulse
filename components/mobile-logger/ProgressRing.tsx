'use client';

import React from 'react';

interface ProgressRingProps {
  completed: number;
  total: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ completed, total }) => {
  const size = 32;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(completed / total, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Animated Accent Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 250ms cubic-bezier(0.2, 0, 0, 1)',
            }}
          />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: completed === total ? 'var(--accent)' : 'var(--text-secondary)',
            letterSpacing: '0.02em',
          }}
        >
          {completed} of {total}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {completed === total ? 'Ready to log' : 'Mandatory'}
        </span>
      </div>
    </div>
  );
};
