'use client';

import React, { useState } from 'react';
import {
  Users,
  Palette,
  Key,
  Bell,
  Check,
  ShieldCheck,
  Plus,
  Send,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { WorkspaceMember } from './types';
import { workspaceMembers } from './mock-data';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isSerif: boolean;
  onToggleSerif: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onToggleTheme,
  isSerif,
  onToggleSerif,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'appearance' | 'integrations'>('members');
  const [members, setMembers] = useState<WorkspaceMember[]>(workspaceMembers);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [vapidTestSent, setVapidTestSent] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const newMember: WorkspaceMember = {
      id: `mem-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      lastActive: 'Invited just now',
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
    setInviteModalOpen(false);
  };

  const handleSendVapidTest = () => {
    setVapidTestSent(true);
    setTimeout(() => setVapidTestSent(false), 3000);
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Settings Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: 'var(--text-title)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}
        >
          Workspace Settings
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
          Manage members, typography system preferences, and Notion Daily Task Manager API connections.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '28px',
        }}
      >
        {[
          { id: 'members', label: 'Members & Roles', icon: <Users size={14} /> },
          { id: 'appearance', label: 'Appearance & System', icon: <Palette size={14} /> },
          { id: 'integrations', label: 'Integrations & Sync', icon: <Key size={14} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Team Members</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Colleagues with access to TaskPulse Studio and Notion Daily Task Manager slots.
              </p>
            </div>
            <button
              onClick={() => setInviteModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <Plus size={14} strokeWidth={2} />
              <span>Invite member</span>
            </button>
          </div>

          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--sunken)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Name & Email
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', width: '120px' }}>
                    Role
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', width: '140px' }}>
                    Activity
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={m.avatar} alt={m.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '11px',
                          fontWeight: 500,
                          backgroundColor: m.role === 'Owner' ? 'var(--accent-subtle)' : 'var(--sunken)',
                          color: m.role === 'Owner' ? 'var(--accent)' : 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {m.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: APPEARANCE & SYSTEM */}
      {activeTab === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Theme Mode */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Color System & Theme
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Braun-inspired palette with single signal orange accent (#E8590C) and neutral off-white or obsidian background.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => theme === 'dark' && onToggleTheme()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: theme === 'light' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: '#F7F6F3',
                  color: '#1A1A18',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>Light (Warm off-white)</div>
                <div style={{ fontSize: '11px', color: '#6B6A65' }}>#F7F6F3 base with #FFFFFF surfaces</div>
              </button>
              <button
                onClick={() => theme === 'light' && onToggleTheme()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: theme === 'dark' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: '#141413',
                  color: '#ECEAE4',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>Dark (Low-glare Obsidian)</div>
                <div style={{ fontSize: '11px', color: '#8E8C85' }}>#141413 base with #1C1C1A surfaces</div>
              </button>
            </div>
          </div>

          {/* Typography */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Default Reading Typography
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Choose between pristine Swiss sans-serif (Inter) and literary editorial serif (Newsreader).
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => isSerif && onToggleSerif()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: !isSerif ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: 'var(--sunken)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Inter Sans (Default)</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Clean, modern, highly legible</div>
              </button>
              <button
                onClick={() => !isSerif && onToggleSerif()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSerif ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: 'var(--sunken)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '15px' }}>Newsreader Serif</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Long-form calm editorial prose</div>
              </button>
            </div>
          </div>

          {/* Interface Density */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Interface Density
            </h3>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={() => setDensity('comfortable')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  border: density === 'comfortable' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: density === 'comfortable' ? 'var(--accent-subtle)' : 'var(--sunken)',
                  color: density === 'comfortable' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                Comfortable (8px rhythm)
              </button>
              <button
                onClick={() => setDensity('compact')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  border: density === 'compact' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: density === 'compact' ? 'var(--accent-subtle)' : 'var(--sunken)',
                  color: density === 'compact' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                Compact (4px base tight)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Notion Daily Task Manager */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-success)',
                  }}
                />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Notion Daily Task Manager
                </h3>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--status-success)',
                  backgroundColor: 'var(--status-success-bg)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 600,
                }}
              >
                Connected
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Every 15 minutes (Mon–Fri, 9:30 AM–6:30 PM IST) TaskPulse prompts you. Pages land directly into your database title property "Time Taken" with "Minutes" duration.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
              <div>DATABASE: Daily Task Manager</div>
              <div>DATA_SOURCE_ID: 884cfc0c-ee75-82ea-bfe3-87095464a681</div>
              <div>ASSIGN_USER: cb0d6e4a-725d-4737-abb3-f934bbf8172c</div>
            </div>
          </div>

          {/* Web Push VAPID Notifications */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="var(--accent)" />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Web Push Nudges (VAPID)
                </h3>
              </div>
              <button
                onClick={handleSendVapidTest}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Send size={12} />
                <span>Send test nudge</span>
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
              Receive discrete slot notifications even when the browser tab is closed. Action buttons include "Log now", "Same as last", and "Snooze 5 min".
            </p>
            {vapidTestSent && (
              <div style={{ fontSize: '12px', color: 'var(--status-success)', fontWeight: 500 }}>
                ✓ Test push dispatched to active service worker!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div
          onClick={() => setInviteModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-floating)',
            }}
            className="animate-popover"
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>Invite Teammate</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Send an invite to collaborate on TaskPulse workspace documents and Daily Task Manager sync.
            </p>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@taskpulse.studio"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--sunken)',
                fontSize: '14px',
                marginBottom: '16px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setInviteModalOpen(false)}
                style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
