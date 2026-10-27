'use client';

import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileText } from 'lucide-react';
import { WorkspacePage } from './types';

interface TrashViewProps {
  pages: WorkspacePage[];
  onRestorePage: (pageId: string) => void;
  onPermanentlyDeletePage: (pageId: string) => void;
  onEmptyTrash: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  pages,
  onRestorePage,
  onPermanentlyDeletePage,
  onEmptyTrash,
}) => {
  const trashPages = pages.filter((p) => p.isTrash);

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '36px 24px 80px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--text-title)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}
          >
            Trash
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Pages in trash can be restored at any time. Permanent deletion removes the page and associated pulse logs.
          </p>
        </div>

        {trashPages.length > 0 && (
          <button
            onClick={onEmptyTrash}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--status-danger-bg)',
              color: 'var(--status-danger)',
              border: '1px solid var(--status-danger)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Trash2 size={14} />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {trashPages.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 20px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Trash2 size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} strokeWidth={1.5} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Trash is empty
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            There are no deleted pages in your workspace.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          {trashPages.map((page) => (
            <div
              key={page.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{page.icon}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{page.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Moved to trash recently</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => onRestorePage(page.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--sunken)',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                  className="hover:border-[var(--accent)]"
                >
                  <RotateCcw size={12} />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => onPermanentlyDeletePage(page.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px',
                    color: 'var(--status-danger)',
                  }}
                  className="hover:bg-[var(--status-danger-bg)]"
                >
                  Delete permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
