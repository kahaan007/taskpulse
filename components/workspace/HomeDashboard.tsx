'use client';

import React from 'react';
import {
  Clock,
  Pin,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Activity,
  Plus,
} from 'lucide-react';
import { WorkspacePage, TaskRecord } from './types';

interface HomeDashboardProps {
  pages: WorkspacePage[];
  tasks: TaskRecord[];
  onSelectPage: (id: string) => void;
  onSelectScreen: (screen: string) => void;
  onCreatePage: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  pages,
  tasks,
  onSelectPage,
  onSelectScreen,
  onCreatePage,
}) => {
  const favoritePages = pages.filter((p) => p.isFavorite && !p.isTrash);
  const activeTasks = tasks.filter((t) => t.status === 'In Progress' || t.status === 'In Review');
  const totalPulseMinutes = tasks.reduce((sum, t) => sum + (t.pulseMinutes || 0), 0);

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Calm Greeting Header (Dieter Rams: honest, unobtrusive) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
          Tuesday · 11:32 AM IST
        </div>
        <h1
          style={{
            fontSize: 'var(--text-title)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          Good morning, Dieter.
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
          Active rhythm: 5 of 36 slots logged today into Notion Daily Task Manager. Next prompt in 13 minutes.
        </p>
      </div>

      {/* TaskPulse Live Rhythm Instrument Banner */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          marginBottom: '36px',
          boxShadow: 'var(--shadow-hairline)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                boxShadow: '0 0 0 3px var(--accent-subtle)',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              TaskPulse Rhythm · Mon–Fri 9:30 AM – 6:30 PM IST
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Total logged today: <strong style={{ color: 'var(--accent)' }}>{totalPulseMinutes} mins</strong></span>
            <span>Sync: <strong style={{ color: 'var(--status-success)' }}>Active (Notion)</strong></span>
          </div>
        </div>

        {/* 15-Minute Slot Visual Meter (36 slots per day) */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(36, 1fr)',
              gap: '3px',
              height: '14px',
            }}
          >
            {Array.from({ length: 36 }).map((_, idx) => {
              const isLogged = idx < 6;
              const isCurrent = idx === 6;
              return (
                <div
                  key={idx}
                  title={`Slot ${idx + 1} (${9 + Math.floor((30 + idx * 15) / 60)}:${((30 + idx * 15) % 60).toString().padStart(2, '0')})`}
                  style={{
                    borderRadius: '2px',
                    backgroundColor: isLogged
                      ? 'var(--accent)'
                      : isCurrent
                      ? 'var(--accent-subtle)'
                      : 'var(--sunken)',
                    border: isCurrent ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            <span>9:30 AM</span>
            <span>1:00 PM</span>
            <span>6:30 PM</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Current block: <strong>11:30 — 11:45 AM</strong> (Prompt fires at the end of block)
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => alert('Logged current slot to Notion!')}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              Log current slot
            </button>
            <button
              onClick={() => alert('Slot snoozed for 5 minutes.')}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--sunken)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              Snooze 5 min
            </button>
          </div>
        </div>
      </div>

      {/* Recently Visited / Pinned Pages (Horizontal Cards) */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pinned & Recently Visited
          </h2>
          <button
            onClick={onCreatePage}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}
          >
            <Plus size={13} />
            <span>New page</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          {pages.slice(0, 4).map((page) => (
            <div
              key={page.id}
              onClick={() => {
                onSelectScreen('page');
                onSelectPage(page.id);
              }}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '120px',
              }}
              className="hover:border-[var(--accent)] hover:shadow-[var(--shadow-floating)]"
            >
              <div>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{page.icon}</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '6px' }}>
                  {page.title}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                <span>{page.properties.category || 'General'}</span>
                <span>{page.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Grid: Active Tasks & Quiet Activity Feed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Upcoming & Active Tasks */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Active Tasks in Progress
            </h3>
            <button
              onClick={() => onSelectScreen('database')}
              style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectScreen('database')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--sunken)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                className="hover:border-[var(--accent)]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <CheckCircle2 size={14} color="var(--accent)" strokeWidth={1.5} />
                  <span style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>
                  {task.pulseMinutes}m
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Activity Feed */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Workspace Pulse Activity
            </h3>
            <Activity size={14} color="var(--text-tertiary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { text: 'Dieter K. logged 45m pulse to Notion on "Rotary Slider Detent"', time: '12m ago' },
              { text: 'Elena Rostova updated "Principles of Calm Software"', time: '1h ago' },
              { text: 'Marcus Chen resolved comment on Notion Schema Migration', time: '2h ago' },
              { text: 'Daily TaskPulse cron trigger pushed 10:45 AM slot', time: '3h ago' },
            ].map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-tertiary)',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>{act.text}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
