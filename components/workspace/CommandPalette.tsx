'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FileText,
  Plus,
  Moon,
  Sun,
  Maximize2,
  Share2,
  Settings,
  Trash2,
  Clock,
  Sparkles,
  Database,
  ArrowRight,
  X,
} from 'lucide-react';
import { WorkspacePage } from './types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  pages: WorkspacePage[];
  onSelectPage: (pageId: string) => void;
  onSelectScreen: (screen: string) => void;
  onCreatePage: () => void;
  onToggleTheme: () => void;
  onToggleFocusMode: () => void;
  onExportMarkdown: () => void;
  theme: 'light' | 'dark';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  pages,
  onSelectPage,
  onSelectScreen,
  onCreatePage,
  onToggleTheme,
  onToggleFocusMode,
  onExportMarkdown,
  theme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build command items
  const pageItems = pages
    .filter((p) => !p.isTrash && p.title.toLowerCase().includes(query.toLowerCase()))
    .map((p) => ({
      id: `page-${p.id}`,
      type: 'page' as const,
      title: p.title,
      icon: p.icon,
      category: 'Pages',
      action: () => {
        onSelectScreen('page');
        onSelectPage(p.id);
        onClose();
      },
      shortcut: '↵',
    }));

  const actionItems = [
    {
      id: 'act-new-page',
      type: 'action' as const,
      title: 'Create new page',
      icon: <Plus size={15} color="var(--accent)" />,
      category: 'Actions',
      action: () => {
        onCreatePage();
        onClose();
      },
      shortcut: '⌘N',
    },
    {
      id: 'act-focus',
      type: 'action' as const,
      title: 'Toggle Focus Mode',
      icon: <Maximize2 size={15} />,
      category: 'Actions',
      action: () => {
        onToggleFocusMode();
        onClose();
      },
      shortcut: '⌘⇧F',
    },
    {
      id: 'act-theme',
      type: 'action' as const,
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`,
      icon: theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />,
      category: 'Actions',
      action: () => {
        onToggleTheme();
        onClose();
      },
      shortcut: '⌘T',
    },
    {
      id: 'act-database',
      type: 'action' as const,
      title: 'Open Tasks & Projects Database',
      icon: <Database size={15} />,
      category: 'Navigation',
      action: () => {
        onSelectScreen('database');
        onClose();
      },
      shortcut: '⌘D',
    },
    {
      id: 'act-export',
      type: 'action' as const,
      title: 'Export active page to Markdown',
      icon: <Share2 size={15} />,
      category: 'Actions',
      action: () => {
        onExportMarkdown();
        onClose();
      },
      shortcut: '⌘E',
    },
    {
      id: 'act-settings',
      type: 'action' as const,
      title: 'Open Settings & Integrations',
      icon: <Settings size={15} />,
      category: 'Navigation',
      action: () => {
        onSelectScreen('settings');
        onClose();
      },
      shortcut: '⌘,',
    },
    {
      id: 'act-pulse-log',
      type: 'action' as const,
      title: 'Log 15-min task pulse to Notion now',
      icon: <Clock size={15} color="var(--accent)" />,
      category: 'TaskPulse Rhythm',
      action: () => {
        alert('Instant 15-minute slot pulse synced with Notion Daily Task Manager!');
        onClose();
      },
      shortcut: '⌘L',
    },
  ].filter((act) => act.title.toLowerCase().includes(query.toLowerCase()));

  const allItems = [...pageItems, ...actionItems];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 2000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-floating)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="animate-popover"
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Search size={18} color="var(--text-tertiary)" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search pages..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
            }}
          />
          <kbd style={{ fontSize: '10px' }}>ESC</kbd>
        </div>

        {/* Results list */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '6px' }}>
          {allItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              No matching pages or actions found.
            </div>
          ) : (
            allItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--sunken)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: isSelected ? 500 : 400,
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.category}</div>
                    </div>
                  </div>
                  {item.shortcut && <kbd>{item.shortcut}</kbd>}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--sunken)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>esc</kbd> Dismiss</span>
          </div>
          <span>TaskPulse Studio</span>
        </div>
      </div>
    </div>
  );
};
