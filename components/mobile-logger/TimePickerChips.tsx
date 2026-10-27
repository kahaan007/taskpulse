'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface TimePickerChipsProps {
  valueMin: number;
  onChangeMin: (min: number) => void;
}

export const TimePickerChips: React.FC<TimePickerChipsProps> = ({ valueMin, onChangeMin }) => {
  const quickChips = [
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '1h', minutes: 60 },
    { label: '2h', minutes: 120 },
    { label: '4h', minutes: 240 },
  ];

  const handleSelect = (m: number) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch (_) {}
    }
    onChangeMin(m);
  };

  const handleStep = (delta: number) => {
    const next = Math.max(15, valueMin + delta);
    handleSelect(next);
  };

  const formatCustomLabel = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const isPredefined = quickChips.some((c) => c.minutes === valueMin);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Quick Select Chips (48px Touch Targets) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px',
        }}
      >
        {quickChips.map((chip) => {
          const isSelected = valueMin === chip.minutes;
          return (
            <button
              key={chip.minutes}
              type="button"
              onClick={() => handleSelect(chip.minutes)}
              style={{
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                color: isSelected ? '#ffffff' : 'var(--text-primary)',
                fontSize: '14px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 150ms ease, border-color 150ms ease',
              }}
              className="touch-target"
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Stepper for 15-Minute Custom Adjustment */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '48px',
          padding: '0 4px',
          backgroundColor: 'var(--surface)',
          border: !isPredefined ? '1px solid var(--accent)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <button
          type="button"
          onClick={() => handleStep(-15)}
          disabled={valueMin <= 15}
          aria-label="Decrease time by 15 minutes"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--sunken)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: valueMin <= 15 ? 'var(--text-tertiary)' : 'var(--text-primary)',
          }}
          className="touch-target"
        >
          <Minus size={16} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              fontSize: '15px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: !isPredefined ? 'var(--accent)' : 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatCustomLabel(valueMin)}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>
            ({valueMin} mins)
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleStep(15)}
          aria-label="Increase time by 15 minutes"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--sunken)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
          className="touch-target"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
