'use client';

import React from 'react';
import { AlertCircle, RotateCcw, FilePlus, Sparkles, Database, Check } from 'lucide-react';
import { ScreenState } from './types';

interface StatesPreviewProps {
  state: ScreenState;
  onResetToNormal: () => void;
  onRetryError?: () => void;
}

export const StatesPreview: React.FC<StatesPreviewProps> = ({
  state,
  onResetToNormal,
  onRetryError,
}) => {
  if (state === 'normal') return null;

  // 1. SKELETON LOADING STATE (Not spinners, pure peaceful Rams shimmer)
  if (state === 'loading') {
    return (
      <div
        style={{
          maxWidth: 'var(--max-reading-width)',
          margin: '0 auto',
          padding: '40px 24px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Simulating Skeleton Shimmer Loading State...
          </div>
          <button
            onClick={onResetToNormal}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}
          >
            Exit preview
          </button>
        </div>

        {/* Icon & Title Skeleton */}
        <div className="skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }} />
        <div className="skeleton-shimmer" style={{ width: '75%', height: '36px', marginBottom: '24px' }} />

        {/* Properties Rows Skeletons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="skeleton-shimmer" style={{ width: '100px', height: '18px' }} />
            <div className="skeleton-shimmer" style={{ width: '120px', height: '18px' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="skeleton-shimmer" style={{ width: '100px', height: '18px' }} />
            <div className="skeleton-shimmer" style={{ width: '160px', height: '18px' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="skeleton-shimmer" style={{ width: '100px', height: '18px' }} />
            <div className="skeleton-shimmer" style={{ width: '90px', height: '18px' }} />
          </div>
        </div>

        {/* Content Blocks Skeletons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton-shimmer" style={{ width: '90%', height: '16px' }} />
          <div className="skeleton-shimmer" style={{ width: '98%', height: '16px' }} />
          <div className="skeleton-shimmer" style={{ width: '60%', height: '16px' }} />
          <div style={{ height: '12px' }} />
          <div className="skeleton-shimmer" style={{ width: '40%', height: '24px' }} />
          <div className="skeleton-shimmer" style={{ width: '100%', height: '16px' }} />
          <div className="skeleton-shimmer" style={{ width: '85%', height: '16px' }} />
          <div style={{ height: '12px' }} />
          <div className="skeleton-shimmer" style={{ width: '100%', height: '90px', borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    );
  }

  // 2. EMPTY STATE
  if (state === 'empty') {
    return (
      <div
        style={{
          maxWidth: '560px',
          margin: '60px auto',
          padding: '48px 32px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-hairline)',
        }}
        className="animate-popover"
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--sunken)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '22px',
          }}
        >
          📄
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          This page is empty
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          Press Enter or type “/” to insert text, headings, to-do lists, or link a live TaskPulse 15-minute slot pulse.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={onResetToNormal}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FilePlus size={14} />
            <span>Load sample content</span>
          </button>
          <button
            onClick={onResetToNormal}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--sunken)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}
          >
            Start writing
          </button>
        </div>
      </div>
    );
  }

  // 3. ERROR STATE
  if (state === 'error') {
    return (
      <div
        style={{
          maxWidth: '560px',
          margin: '60px auto',
          padding: '36px 32px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--status-danger)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-floating)',
        }}
        className="animate-popover"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-danger-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertCircle size={20} color="var(--status-danger)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--status-danger)', marginBottom: '4px' }}>
              Notion API Synchronization Interrupted
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The upstream connection to Notion Daily Task Manager returned <strong>504 Gateway Timeout</strong>. Your local edits are safely stored in IndexedDB and will not be lost.
            </p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--sunken)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            marginBottom: '20px',
          }}
        >
          ERR_NOTION_RATE_LIMIT_SLOT: Retry scheduled with exponential backoff (attempt 3/5).
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onResetToNormal}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}
          >
            Work in offline mode
          </button>
          <button
            onClick={() => {
              if (onRetryError) onRetryError();
              onResetToNormal();
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={13} />
            <span>Retry connection</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
