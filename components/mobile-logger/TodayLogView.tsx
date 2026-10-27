'use client';

import React, { useState } from 'react';
import {
  Clock,
  Trash2,
  ExternalLink,
  Plus,
  Palette,
  Eye,
  Users,
  Search,
  Code,
  Briefcase,
  Cpu,
  Sparkles,
  Edit2,
  X,
  Check,
  Layers,
  Layout,
  Compass,
  Video,
  Image,
} from 'lucide-react';
import { TaskLogEntry } from './types';

interface TodayLogViewProps {
  logs: TaskLogEntry[];
  onDeleteLog: (id: string) => void;
  onEditLog: (log: TaskLogEntry) => void;
  onSwitchToSubmit: () => void;
}

export const TodayLogView: React.FC<TodayLogViewProps> = ({
  logs,
  onDeleteLog,
  onEditLog,
  onSwitchToSubmit,
}) => {
  const [editingLog, setEditingLog] = useState<TaskLogEntry | null>(null);

  const totalMin = logs.reduce((sum, l) => sum + (l.durationMin || 0), 0);
  const targetMin = 8 * 60; // 8 hours daily target
  const remainingMin = Math.max(0, targetMin - totalMin);
  const progressRatio = Math.min(totalMin / targetMin, 1);

  const hoursLogged = Math.floor(totalMin / 60);
  const minsLogged = totalMin % 60;
  const hoursRemaining = Math.floor(remainingMin / 60);
  const minsRemaining = remainingMin % 60;

  // Group by client
  const groupedByClient: Record<string, TaskLogEntry[]> = {};
  for (const log of logs) {
    if (!groupedByClient[log.clientName]) {
      groupedByClient[log.clientName] = [];
    }
    groupedByClient[log.clientName].push(log);
  }

  const getTaskIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette':
        return <Palette size={14} color="var(--accent)" />;
      case 'Eye':
        return <Eye size={14} color="var(--text-secondary)" />;
      case 'Users':
        return <Users size={14} color="var(--text-secondary)" />;
      case 'Search':
        return <Search size={14} color="var(--text-secondary)" />;
      case 'Code':
        return <Code size={14} color="var(--text-secondary)" />;
      case 'Cpu':
        return <Cpu size={14} color="var(--text-secondary)" />;
      case 'Sparkles':
        return <Sparkles size={14} color="var(--accent)" />;
      case 'Layers':
        return <Layers size={14} color="var(--accent)" />;
      case 'Layout':
        return <Layout size={14} color="var(--accent)" />;
      case 'Compass':
        return <Compass size={14} color="var(--accent)" />;
      case 'Video':
        return <Video size={14} color="var(--accent)" />;
      case 'Image':
        return <Image size={14} color="var(--accent)" />;
      default:
        return <Briefcase size={14} color="var(--text-secondary)" />;
    }
  };

  return (
    <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Summary & Day-Completion Nudge */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
          TODAY'S WORK LOGGED
        </div>

        {/* Large 28px Tabular Hours */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '10px',
          }}
        >
          {hoursLogged}h {String(minsLogged).padStart(2, '0')}m
        </div>

        {/* Progress Bar Toward 8h Target */}
        <div
          style={{
            height: '6px',
            backgroundColor: 'var(--sunken)',
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressRatio * 100}%`,
              backgroundColor: 'var(--accent)',
              borderRadius: 'var(--radius-pill)',
              transition: 'width 250ms cubic-bezier(0.2, 0, 0, 1)',
            }}
          />
        </div>

        {/* Quiet Day-Completion Nudge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span>
            {remainingMin > 0
              ? `${hoursRemaining}h ${minsRemaining}m to reach 8h goal`
              : 'Daily 8h target achieved'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
            {Math.round(progressRatio * 100)}%
          </span>
        </div>
      </div>

      {/* 2. Empty State */}
      {logs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '56px 20px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--sunken)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Clock size={20} color="var(--text-tertiary)" strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Nothing logged yet
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Record your first 15-minute slot straight into Notion.
          </p>
          <button
            onClick={onSwitchToSubmit}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="touch-target"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Log your first task</span>
          </button>
        </div>
      ) : (
        /* 3. Grouped by Client List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.keys(groupedByClient).map((clientName) => {
            const clientLogs = groupedByClient[clientName];
            const clientMin = clientLogs.reduce((s, l) => s + l.durationMin, 0);

            return (
              <div
                key={clientName}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                {/* Client Section Subheader */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--sunken)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {clientName}
                  </span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                    {clientMin}m
                  </span>
                </div>

                {/* Rows */}
                {clientLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setEditingLog(log)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      gap: '12px',
                    }}
                    className="hover:bg-[var(--sunken)] touch-target"
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        {getTaskIcon(log.taskTypeIcon)}
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.projectName}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: '4px',
                        }}
                      >
                        {log.description}
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {log.taskTypeLabel} · {log.loggedAt}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: 'var(--accent)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {log.durationMin}m
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLog(log.id);
                        }}
                        aria-label="Delete entry"
                        style={{
                          padding: '4px',
                          color: 'var(--text-tertiary)',
                        }}
                        className="hover:text-[var(--status-danger)]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Entry Bottom Sheet */}
      {editingLog && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingLog(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 600,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--surface)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '20px',
              boxShadow: 'var(--shadow-floating)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Edit Task Entry</span>
              <button onClick={() => setEditingLog(null)} style={{ color: 'var(--text-tertiary)' }}>
                <X size={16} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Description
              </label>
              <input
                type="text"
                value={editingLog.description}
                onChange={(e) => setEditingLog({ ...editingLog, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--sunken)',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Minutes
              </label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                {[15, 30, 45, 60, 90].map((m) => (
                  <button
                    key={m}
                    onClick={() => setEditingLog({ ...editingLog, durationMin: m })}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 'var(--radius-xs)',
                      border: editingLog.durationMin === m ? '1px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: editingLog.durationMin === m ? 'var(--accent)' : 'var(--sunken)',
                      color: editingLog.durationMin === m ? '#fff' : 'var(--text-primary)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => setEditingLog(null)}
                style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEditLog(editingLog);
                  setEditingLog(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
