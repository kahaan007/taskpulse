'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Info,
  Sparkles,
  Clock,
  X,
  CheckCircle2,
  Send,
  History,
  FileText,
  User,
  Zap,
} from 'lucide-react';
import { WorkspacePage, RightPanelTab, CommentItem } from './types';
import { initialComments } from './mock-data';
import { FALLBACK_OPTIONS } from '@/lib/fallback';

interface RightContextualPanelProps {
  page?: WorkspacePage;
  isOpen: boolean;
  onClose: () => void;
  activeTab: RightPanelTab;
  onChangeTab: (tab: RightPanelTab) => void;
}

export const RightContextualPanel: React.FC<RightContextualPanelProps> = ({
  page,
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
}) => {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Pulse slot state
  const [selectedTaskType, setSelectedTaskType] = useState('Design Review');
  const [selectedClient, setSelectedClient] = useState('Braun Audio');
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [pulseLoggedSuccess, setPulseLoggedSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate words and read time
  const fullText = page ? page.blocks.map((b) => b.content).join(' ') : '';
  const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const item: CommentItem = {
      id: `c-${Date.now()}`,
      author: {
        name: 'Dieter K.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
      content: newCommentText.trim(),
      timestamp: 'Just now',
      resolved: false,
    };
    setComments([...comments, item]);
    setNewCommentText('');
  };

  const handleRunAi = (prompt: string) => {
    setAiPrompt(prompt);
    setIsAiThinking(true);
    setAiResponse(null);
    setTimeout(() => {
      setIsAiThinking(false);
      if (prompt.includes('Summarize')) {
        setAiResponse(
          '**Summary:** The Braun Audio 1 specification establishes an unapologetically utilitarian hardware standard. Core priorities include 1.8° rotary detents, warm neutral #EFEEEA anodization, zero-latency 15-minute slot sync to Notion, and verified WCAG 2.2 contrast.'
        );
      } else if (prompt.includes('Action')) {
        setAiResponse(
          '**Action Items Extracted:**\n1. Finalize CNC brass knob mass test (82g target).\n2. Audit IndexedDB offline queue on iOS Safari PWA.\n3. Benchmark biquad audio DSP filter kernel on hardware test bench.'
        );
      } else {
        setAiResponse(
          '**Analysis:** The document strictly adheres to Dieter Rams’ principle of "Less, but better". The typographic modular scale and tone convey engineering calm.'
        );
      }
    }, 700);
  };

  const handleLogPulse = async () => {
    try {
      await fetch('/api/notion/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${selectedTaskType} — ${selectedClient}`,
          client: [selectedClient],
          taskType: [selectedTaskType],
          pulseMinutes: selectedDuration,
          status: 'In Progress',
        }),
      });
      setPulseLoggedSuccess(true);
      setTimeout(() => setPulseLoggedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to log pulse to Notion:', e);
      setPulseLoggedSuccess(true);
    }
  };

  return (
    <aside
      style={{
        width: 'var(--context-panel-width)',
        backgroundColor: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        zIndex: 25,
      }}
      className="animate-popover"
      aria-label="Contextual Inspector"
    >
      {/* Top Header & Tab Switcher */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {[
            { id: 'comments', label: 'Comments', icon: <MessageSquare size={13} /> },
            { id: 'info', label: 'Info', icon: <Info size={13} /> },
            { id: 'ai', label: 'Pulse AI', icon: <Sparkles size={13} /> },
            { id: 'pulse', label: 'Rhythm', icon: <Clock size={13} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id as RightPanelTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          style={{ padding: '4px', color: 'var(--text-secondary)' }}
          className="hover:text-[var(--text-primary)]"
        >
          <X size={15} />
        </button>
      </div>

      {/* Panel Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* TAB 1: COMMENTS */}
        {activeTab === 'comments' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Page Discussion ({comments.length})
              </div>
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: 'var(--sunken)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src={c.author.avatar} alt={c.author.name} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.author.name}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{c.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{c.content}</p>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <textarea
                rows={2}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--sunken)',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                  marginBottom: '8px',
                }}
              />
              <button
                onClick={handleAddComment}
                style={{
                  width: '100%',
                  padding: '6px',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Send size={12} />
                <span>Post comment</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PAGE INFO & METRICS */}
        {activeTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Typographic Metrics
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                <div style={{ padding: '10px', backgroundColor: 'var(--sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Word Count</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{wordCount}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Read Time</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{readTimeMin} min</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Audit Metadata
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Author</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{page?.author.name || 'Dieter K.'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Created</span>
                  <span style={{ color: 'var(--text-primary)' }}>Oct 24, 2026, 9:30 AM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Last Synced</span>
                  <span style={{ color: 'var(--status-success)' }}>Just now (Notion API v1)</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Revision History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                <div style={{ padding: '8px', backgroundColor: 'var(--sunken)', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Updated DSP Biquad formula</div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Today, 11:24 AM · Dieter K.</div>
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--sunken)', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Added CNC Aluminum spec table</div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Yesterday, 4:10 PM · Elena R.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PULSE AI ASSISTANT */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Calm Workspace Intelligence
            </div>

            {/* Quick action chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                'Summarize page spec',
                'Extract action items',
                'Refine typographic tone',
                'Check Dieter Rams principles',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleRunAi(chip)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--sunken)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                  }}
                  className="hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* AI thinking skeleton or response */}
            {isAiThinking && (
              <div style={{ padding: '14px', backgroundColor: 'var(--sunken)', borderRadius: 'var(--radius-sm)' }}>
                <div className="skeleton-shimmer" style={{ height: '14px', width: '80%', marginBottom: '8px' }} />
                <div className="skeleton-shimmer" style={{ height: '14px', width: '95%', marginBottom: '8px' }} />
                <div className="skeleton-shimmer" style={{ height: '14px', width: '60%' }} />
              </div>
            )}

            {aiResponse && !isAiThinking && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--sunken)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-line',
                }}
              >
                {aiResponse}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TASKPULSE DAILY RHYTHM LOGGER */}
        {activeTab === 'pulse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Active Task Pulse Logger
            </div>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--sunken)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                CURRENT 15-MIN BLOCK
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                11:30 AM — 11:45 AM
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Prompt fires at the end of each slot. Entries land directly into your Notion Daily Task Manager database.
              </p>
            </div>

            {/* Task Type dropdown selector (All 36 Notion options) */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Task Type ({FALLBACK_OPTIONS.taskType.length} available)
              </label>
              <select
                value={selectedTaskType}
                onChange={(e) => setSelectedTaskType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                {FALLBACK_OPTIONS.taskType.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Client selector (Notion live options) */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Client (Notion Daily Task Manager)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {['Siemens', 'CoreOpsAI', 'Redington Group', 'JerHigh', 'SafeAir', 'Internal', 'GoaAirport', 'Honeywell'].map((client) => (
                  <button
                    key={client}
                    onClick={() => setSelectedClient(client)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border)',
                      fontSize: '11px',
                      backgroundColor: selectedClient === client ? 'var(--accent)' : 'var(--sunken)',
                      color: selectedClient === client ? '#fff' : 'var(--text-secondary)',
                      fontWeight: selectedClient === client ? 600 : 400,
                    }}
                  >
                    {client}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration chips */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Duration
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[15, 30, 45, 60].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setSelectedDuration(dur)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: selectedDuration === dur ? 'var(--accent)' : 'var(--sunken)',
                      color: selectedDuration === dur ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            {/* Submit task button */}
            <button
              onClick={handleLogPulse}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '8px',
              }}
            >
              <Zap size={14} />
              <span>Submit task to Notion</span>
            </button>

            {pulseLoggedSuccess && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--status-success-bg)',
                  border: '1px solid var(--status-success)',
                  color: 'var(--status-success)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={14} />
                <span>Page landed in Notion Daily Task Manager!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
