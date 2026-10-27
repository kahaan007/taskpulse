'use client';

import React from 'react';
import { ActiveSegment } from './types';

interface SegmentedControlProps {
  activeSegment: ActiveSegment;
  onChangeSegment: (seg: ActiveSegment) => void;
  todayCount: number;
  countBouncing?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  activeSegment,
  onChangeSegment,
  todayCount,
  countBouncing = false,
}) => {
  const isSubmit = activeSegment === 'submit';

  const handleClick = (seg: ActiveSegment) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch (_) {}
    }
    onChangeSegment(seg);
  };

  return (
    <div
      role="tablist"
      aria-label="TaskPulse Navigation"
      style={{
        backgroundColor: 'var(--surface)',
        padding: '6px 16px 10px',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '44px',
          backgroundColor: 'var(--sunken)',
          borderRadius: 'var(--radius-pill)',
          padding: '3px',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* Animated Sliding Pill Thumb */}
        <div
          style={{
            position: 'absolute',
            top: '3px',
            bottom: '3px',
            width: 'calc(50% - 3px)',
            left: isSubmit ? '3px' : 'calc(50%)',
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            transition: 'left 200ms cubic-bezier(0.2, 0, 0, 1)',
            zIndex: 1,
          }}
        />

        {/* Tab 1: Submit task */}
        <button
          role="tab"
          aria-selected={isSubmit}
          aria-controls="submit-task-panel"
          onClick={() => handleClick('submit')}
          style={{
            position: 'relative',
            flex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: isSubmit ? 600 : 500,
            color: isSubmit ? 'var(--text-primary)' : 'var(--text-secondary)',
            zIndex: 2,
            transition: 'color 150ms ease',
          }}
          className="touch-target"
        >
          Submit task
        </button>

        {/* Tab 2: Today's log · N */}
        <button
          role="tab"
          aria-selected={!isSubmit}
          aria-controls="today-log-panel"
          onClick={() => handleClick('log')}
          style={{
            position: 'relative',
            flex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: !isSubmit ? 600 : 500,
            color: !isSubmit ? 'var(--text-primary)' : 'var(--text-secondary)',
            zIndex: 2,
            transition: 'color 150ms ease',
          }}
          className="touch-target"
        >
          <span>Today's log</span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: !isSubmit ? 'var(--accent)' : 'var(--border)',
              color: !isSubmit ? '#ffffff' : 'var(--text-tertiary)',
              transform: countBouncing ? 'scale(1.25)' : 'scale(1)',
              transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1), background-color 150ms ease, color 150ms ease',
            }}
          >
            {todayCount}
          </span>
        </button>
      </div>
    </div>
  );
};
