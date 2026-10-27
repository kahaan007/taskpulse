'use client';

import React from 'react';
import { Minimize2 } from 'lucide-react';

interface FocusModeOverlayProps {
  isFocusMode: boolean;
  onExitFocusMode: () => void;
  wordCount: number;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  isFocusMode,
  onExitFocusMode,
  wordCount,
}) => {
  if (!isFocusMode) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-pill)',
        padding: '6px 16px',
        boxShadow: 'var(--shadow-floating)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        zIndex: 500,
        opacity: 0.9,
        transition: 'opacity var(--transition-fast)',
      }}
      className="hover:opacity-100"
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
          }}
        />
        <strong>Focus Mode</strong>
      </span>
      <span style={{ color: 'var(--text-tertiary)' }}>·</span>
      <span>{wordCount} words</span>
      <span style={{ color: 'var(--text-tertiary)' }}>·</span>
      <button
        onClick={onExitFocusMode}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--accent)',
          fontWeight: 500,
        }}
      >
        <Minimize2 size={12} />
        <span>Exit (Esc)</span>
      </button>
    </div>
  );
};
