'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  Coffee,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
} from 'lucide-react';
import { TaskRecord } from './types';
import { FALLBACK_OPTIONS } from '@/lib/fallback';

interface MobileTaskLoggerProps {
  onTaskLogged: (newTask: TaskRecord) => void;
  recentTasks: TaskRecord[];
  onSwitchToWorkspace?: () => void;
}

export const MobileTaskLogger: React.FC<MobileTaskLoggerProps> = ({
  onTaskLogged,
  recentTasks,
  onSwitchToWorkspace,
}) => {
  const [description, setDescription] = useState('');
  const [selectedClient, setSelectedClient] = useState('Siemens');
  const [selectedTaskType, setSelectedTaskType] = useState('High Fidelity');
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [selectedStatus, setSelectedStatus] = useState<'In Progress' | 'Done'>('In Progress');
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // 15-minute slot countdown simulation
  const [slotSeconds, setSlotSeconds] = useState(740);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlotSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const clients = [
    'Siemens',
    'CoreOpsAI',
    'Redington Group',
    'JerHigh',
    'SafeAir',
    'Internal',
    'GoaAirport',
    'Honeywell',
    'NDMC',
    'Udaiti',
  ];

  const taskTypes = FALLBACK_OPTIONS.taskType.map((t) => t.name);

  const handleSubmit = async (overrideTitle?: string, overrideClient?: string, overrideType?: string) => {
    setSubmitting(true);
    const c = overrideClient || selectedClient;
    const t = overrideType || selectedTaskType;
    const title = overrideTitle || (description.trim() ? description.trim() : `${t} — ${c}`);

    const newTask: TaskRecord = {
      id: `task-${Date.now()}`,
      title,
      status: selectedStatus,
      priority: 'High',
      assignee: {
        name: 'Dieter K.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
      dueDate: new Date().toISOString().slice(0, 10),
      pulseMinutes: selectedMinutes,
      category: c,
      client: [c],
      taskType: [t],
      tags: [c, t],
      notionSynced: true,
      notes: `Logged directly via mobile TaskPulse into Notion Daily Task Manager.`,
    };

    onTaskLogged(newTask);

    try {
      await fetch('/api/notion/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          client: [c],
          taskType: [t],
          pulseMinutes: selectedMinutes,
          status: selectedStatus,
          priority: 'High',
        }),
      });
      setSuccessBanner(`Logged "${title}" to Notion!`);
      setDescription('');
      setTimeout(() => setSuccessBanner(null), 3500);
    } catch (e) {
      console.error('Error submitting task:', e);
      setSuccessBanner(`Saved offline — will sync with Notion`);
      setTimeout(() => setSuccessBanner(null), 3500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTakeBreak = () => {
    setSuccessBanner('Logged 15m Break/Idle slot');
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleSameAsLast = () => {
    if (recentTasks.length > 0) {
      const last = recentTasks[0];
      const client = last.client?.[0] || 'Siemens';
      const type = last.taskType?.[0] || 'High Fidelity';
      handleSubmit(`${type} — ${client}`, client, type);
    } else {
      handleSubmit();
    }
  };

  const totalLoggedMinutes = recentTasks.reduce((sum, t) => sum + (t.pulseMinutes || 0), 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        backgroundColor: 'var(--bg)',
        color: 'var(--text-primary)',
        paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Top Mobile Instrument Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            TP
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              TaskPulse
            </div>
            <div style={{ fontSize: '10px', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
              <span>Daily Task Manager</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'var(--accent)',
              backgroundColor: 'var(--accent-subtle)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            {Math.floor(totalLoggedMinutes / 60)}h {totalLoggedMinutes % 60}m today
          </div>

          {onSwitchToWorkspace && (
            <button
              onClick={onSwitchToWorkspace}
              title="Switch to full Workspace view"
              style={{
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border)',
              }}
            >
              Docs ↗
            </button>
          )}
        </div>
      </header>

      {/* Main Task Adding Content Container */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Success Banner */}
        {successBanner && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--status-success-bg)',
              border: '1px solid var(--status-success)',
              color: 'var(--status-success)',
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            className="animate-popover"
          >
            <CheckCircle2 size={16} />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Hero Active 15-Minute Slot Card */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-hairline)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CURRENT 15-MIN INTERVAL
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                fontWeight: 600,
              }}
            >
              <Clock size={12} />
              <span>{formatTime(slotSeconds)}</span>
            </div>
          </div>

          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            11:30 AM — 11:45 AM
          </div>

          {/* Rapid 1-Tap Quick Action Row */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSameAsLast}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
              className="touch-target"
            >
              <RotateCcw size={12} strokeWidth={2} />
              <span>Same as last</span>
            </button>
            <button
              onClick={handleTakeBreak}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--sunken)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
              className="touch-target"
            >
              <Coffee size={12} />
              <span>Break / Idle</span>
            </button>
          </div>
        </div>

        {/* Task Title / Description Input */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Auto-titled: "${selectedTaskType} — ${selectedClient}"`}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              fontSize: '14px',
              outline: 'none',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Client Selector Chips (From live Notion Daily Task Manager) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Client (Notion Database)
            </label>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{selectedClient}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {clients.map((c) => {
              const isSelected = selectedClient === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedClient(c)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                  className="touch-target"
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Task Type Dropdown Selector (All 36 items) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Task Type ({taskTypes.length} available)
            </label>
            <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>Notion Option</span>
          </div>
          <select
            value={selectedTaskType}
            onChange={(e) => setSelectedTaskType(e.target.value)}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
            className="touch-target"
          >
            {taskTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Duration & Status Selector */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Minutes
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[15, 30, 45, 60].map((m) => {
                const isSelected = selectedMinutes === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMinutes(m)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 'var(--radius-xs)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                    className="touch-target"
                  >
                    {m}m
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ width: '110px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Status
            </label>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? 'Done' : 'In Progress')}
              style={{
                width: '100%',
                padding: '8px 6px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border)',
                backgroundColor: selectedStatus === 'Done' ? 'var(--status-success-bg)' : 'var(--sunken)',
                color: selectedStatus === 'Done' ? 'var(--status-success)' : 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'center',
              }}
              className="touch-target"
            >
              {selectedStatus}
            </button>
          </div>
        </div>

        {/* PRIMARY SUBMIT BUTTON (Fitts's Law thumb anchor) */}
        <button
          onClick={() => handleSubmit()}
          disabled={submitting}
          style={{
            width: '100%',
            minHeight: '48px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 3px 12px rgba(232, 89, 12, 0.35)',
            marginTop: '8px',
          }}
          className="touch-target"
        >
          <Zap size={16} />
          <span>{submitting ? 'Writing to Notion...' : 'Submit task to Notion'}</span>
        </button>

        {/* Today's Logged Slots Feed */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Today's Logged Slots ({recentTasks.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {t.client?.[0] || 'General'} · {t.dueDate}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                    {t.pulseMinutes}m
                  </span>
                  {t.url && (
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
