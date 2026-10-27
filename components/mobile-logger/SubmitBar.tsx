'use client';

import React from 'react';
import { Check, ArrowRight, Loader2 } from 'lucide-react';

interface SubmitBarProps {
  isValid: boolean;
  missingFieldLabel: string | null;
  onDisabledTap: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isSuccessMorph?: boolean;
}

export const SubmitBar: React.FC<SubmitBarProps> = ({
  isValid,
  missingFieldLabel,
  onDisabledTap,
  onSubmit,
  isSubmitting = false,
  isSuccessMorph = false,
}) => {
  const handleClick = () => {
    if (isSubmitting || isSuccessMorph) return;
    if (!isValid) {
      if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        try {
          navigator.vibrate([10, 50, 10]);
        } catch (_) {}
      }
      onDisabledTap();
      return;
    }

    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch (_) {}
    }
    onSubmit();
  };

  const getButtonLabel = () => {
    if (isSubmitting) return 'Writing to Notion...';
    if (isSuccessMorph) return 'Logged to Notion';
    if (!isValid) {
      return missingFieldLabel ? `${missingFieldLabel} to continue` : 'Complete required fields';
    }
    return 'Log task';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
        zIndex: 40,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={handleClick}
          disabled={isSubmitting}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isSuccessMorph
              ? 'var(--status-success)'
              : isValid
              ? 'var(--accent)'
              : 'var(--sunken)',
            color: isValid || isSuccessMorph ? '#ffffff' : 'var(--text-tertiary)',
            border: isValid || isSuccessMorph ? 'none' : '1px solid var(--border)',
            fontSize: '16px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 200ms cubic-bezier(0.2, 0, 0, 1), transform 150ms ease, opacity 200ms ease',
            opacity: isSubmitting ? 0.8 : 1,
            cursor: isValid ? 'pointer' : 'default',
          }}
          className="touch-target"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isSuccessMorph ? (
            <Check size={20} strokeWidth={3} className="animate-check" />
          ) : isValid ? (
            <ArrowRight size={18} strokeWidth={2.5} />
          ) : (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
              }}
            />
          )}
          <span>{getButtonLabel()}</span>
        </button>
      </div>
    </div>
  );
};
