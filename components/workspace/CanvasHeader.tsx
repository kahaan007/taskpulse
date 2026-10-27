'use client';

import React, { useState } from 'react';
import {
  Image,
  Smile,
  Plus,
  Clock,
  User,
  Calendar,
  Tag,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { WorkspacePage } from './types';

interface CanvasHeaderProps {
  page: WorkspacePage;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateProperty: (key: string, value: any) => void;
  onUpdateIcon: (newIcon: string) => void;
  onToggleCover: () => void;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  page,
  onUpdateTitle,
  onUpdateProperty,
  onUpdateIcon,
  onToggleCover,
}) => {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [coverHover, setCoverHover] = useState(false);

  const sampleIcons = ['📻', '📐', '⚡', '🎨', '💡', '🏛️', '🔬', '⏱️', '🚀', '✨', '📝', '📂'];

  return (
    <div style={{ position: 'relative' }}>
      {/* Cover Image */}
      {page.cover && (
        <div
          onMouseEnter={() => setCoverHover(true)}
          onMouseLeave={() => setCoverHover(false)}
          style={{
            position: 'relative',
            height: '200px',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <img
            src={page.cover}
            alt="Page cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          {coverHover && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '16px',
                display: 'flex',
                gap: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
              }}
            >
              <button
                onClick={onToggleCover}
                style={{
                  fontSize: '12px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={13} />
                Remove cover
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content Header Wrapper (max width 720px for reading comfort) */}
      <div
        style={{
          maxWidth: 'var(--max-reading-width)',
          margin: '0 auto',
          padding: page.cover ? '0 24px 16px' : '40px 24px 16px',
        }}
      >
        {/* Cover / Icon Action bar if none */}
        {!page.cover && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              opacity: 0.8,
            }}
            className="group"
          >
            <button
              onClick={onToggleCover}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                padding: '3px 6px',
                borderRadius: 'var(--radius-xs)',
              }}
              className="hover:text-[var(--text-primary)] hover:bg-[var(--sunken)]"
            >
              <Image size={13} strokeWidth={1.5} />
              Add cover
            </button>
          </div>
        )}

        {/* Page Icon */}
        <div style={{ position: 'relative', marginTop: page.cover ? '-36px' : '0', marginBottom: '16px' }}>
          <button
            onClick={() => setIconPickerOpen(!iconPickerOpen)}
            title="Change icon"
            style={{
              fontSize: '44px',
              lineHeight: 1,
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: page.cover ? 'var(--surface)' : 'transparent',
              boxShadow: page.cover ? 'var(--shadow-floating)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="hover:bg-[var(--sunken)]"
          >
            {page.icon}
          </button>

          {/* Quick Icon Picker Popover */}
          {iconPickerOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-floating)',
                padding: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '6px',
                zIndex: 100,
              }}
              className="animate-popover"
            >
              {sampleIcons.map((ic) => (
                <button
                  key={ic}
                  onClick={() => {
                    onUpdateIcon(ic);
                    setIconPickerOpen(false);
                  }}
                  style={{
                    fontSize: '20px',
                    padding: '6px',
                    borderRadius: 'var(--radius-xs)',
                  }}
                  className="hover:bg-[var(--sunken)]"
                >
                  {ic}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 40px Page Title */}
        <input
          type="text"
          value={page.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Untitled page"
          style={{
            width: '100%',
            fontSize: 'var(--text-title)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            marginBottom: '20px',
          }}
        />

        {/* Properties Row (Notion-grade Database Property Row) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingBottom: '24px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {/* Status Property */}
          <div style={{ display: 'flex', alignItems: 'center', minHeight: '28px' }}>
            <div
              style={{
                width: '130px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
              }}
            >
              <CheckCircle2 size={14} strokeWidth={1.5} />
              <span>Status</span>
            </div>
            <select
              value={page.properties.status || 'In Progress'}
              onChange={(e) => onUpdateProperty('status', e.target.value)}
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor:
                  page.properties.status === 'Done'
                    ? 'var(--status-success-bg)'
                    : page.properties.status === 'In Progress'
                    ? 'var(--accent-subtle)'
                    : 'var(--sunken)',
                color:
                  page.properties.status === 'Done'
                    ? 'var(--status-success)'
                    : page.properties.status === 'In Progress'
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <option value="Backlog">Backlog</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Assignee Property */}
          <div style={{ display: 'flex', alignItems: 'center', minHeight: '28px' }}>
            <div
              style={{
                width: '130px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
              }}
            >
              <User size={14} strokeWidth={1.5} />
              <span>Assignee</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img
                src={page.author.avatar}
                alt={page.author.name}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{page.author.name}</span>
            </div>
          </div>

          {/* Pulse Minutes Property (TaskPulse specific live integration) */}
          <div style={{ display: 'flex', alignItems: 'center', minHeight: '28px' }}>
            <div
              style={{
                width: '130px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
              }}
            >
              <Clock size={14} strokeWidth={1.5} />
              <span>Task Pulse</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--sunken)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                fontWeight: 600,
              }}
            >
              <span>{page.properties.pulseMinutes || 45} mins</span>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>(Notion synced)</span>
            </div>
          </div>

          {/* Due Date Property */}
          {page.properties.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '28px' }}>
              <div
                style={{
                  width: '130px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-tertiary)',
                  fontSize: '13px',
                }}
              >
                <Calendar size={14} strokeWidth={1.5} />
                <span>Due Date</span>
              </div>
              <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                {page.properties.dueDate}
              </span>
            </div>
          )}

          {/* Tags Property */}
          {page.properties.tags && page.properties.tags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '28px' }}>
              <div
                style={{
                  width: '130px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-tertiary)',
                  fontSize: '13px',
                }}
              >
                <Tag size={14} strokeWidth={1.5} />
                <span>Tags</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {page.properties.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--sunken)',
                      border: '1px solid var(--border)',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
