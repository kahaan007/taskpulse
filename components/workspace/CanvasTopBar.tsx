'use client';

import React, { useState } from 'react';
import {
  Menu,
  ChevronRight,
  Maximize2,
  BookOpen,
  Type,
  Share2,
  PanelRight,
  Check,
  AlertCircle,
  Eye,
  Sparkles,
  SlidersHorizontal,
  Smartphone,
} from 'lucide-react';
import { WorkspacePage, ScreenState } from './types';

interface CanvasTopBarProps {
  page?: WorkspacePage;
  activeScreen: string;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  isSerif: boolean;
  onToggleSerif: () => void;
  isContextPanelOpen: boolean;
  onToggleContextPanel: () => void;
  onToggleSidebarMobile: () => void;
  screenState: ScreenState;
  onChangeScreenState: (state: ScreenState) => void;
  onExportMarkdown: () => void;
  onToggleMobileLogger?: () => void;
  lastSavedText?: string;
}

export const CanvasTopBar: React.FC<CanvasTopBarProps> = ({
  page,
  activeScreen,
  isFocusMode,
  onToggleFocusMode,
  isSerif,
  onToggleSerif,
  isContextPanelOpen,
  onToggleContextPanel,
  onToggleSidebarMobile,
  screenState,
  onChangeScreenState,
  onExportMarkdown,
  onToggleMobileLogger,
  lastSavedText = 'Saved just now',
}) => {
  const [stateMenuOpen, setStateMenuOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = () => {
    onExportMarkdown();
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        height: '48px',
        backgroundColor: 'rgba(var(--surface-rgb, 255, 255, 255), 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 30,
        userSelect: 'none',
      }}
    >
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        <button
          onClick={onToggleSidebarMobile}
          title="Open sidebar"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
          }}
          className="sm:hidden hover:bg-[var(--sunken)]"
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>

        {/* Breadcrumb path */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>TaskPulse</span>
          <ChevronRight size={13} strokeWidth={1.5} color="var(--text-tertiary)" />
          {activeScreen === 'home' && (
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Dashboard</span>
          )}
          {activeScreen === 'database' && (
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Tasks & Projects</span>
          )}
          {activeScreen === 'settings' && (
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Settings</span>
          )}
          {activeScreen === 'trash' && (
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Trash</span>
          )}
          {activeScreen === 'page' && page && (
            <>
              {page.properties.category && (
                <>
                  <span style={{ color: 'var(--text-tertiary)' }}>{page.properties.category}</span>
                  <ChevronRight size={13} strokeWidth={1.5} color="var(--text-tertiary)" />
                </>
              )}
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  maxWidth: '240px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {page.icon} {page.title}
              </span>
            </>
          )}
        </nav>

        {/* Nielsen Heuristic: System status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: '8px',
            paddingLeft: '8px',
            borderLeft: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
          }}
          className="hidden md:flex"
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-success)',
              display: 'inline-block',
            }}
          />
          <span>{lastSavedText}</span>
        </div>
      </div>

      {/* Right: Actions and Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* State Preview Switcher (Normal / Skeleton Loading / Empty / Error) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setStateMenuOpen(!stateMenuOpen)}
            title="Inspect Empty / Skeleton / Error states"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: screenState === 'normal' ? 'var(--text-secondary)' : 'var(--accent)',
              backgroundColor: screenState === 'normal' ? 'transparent' : 'var(--accent-subtle)',
              border: screenState === 'normal' ? '1px solid transparent' : '1px solid var(--accent-border)',
            }}
            className="hover:bg-[var(--sunken)]"
          >
            <SlidersHorizontal size={13} strokeWidth={1.5} />
            <span className="hidden sm:inline">State: {screenState}</span>
          </button>

          {stateMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '180px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-floating)',
                padding: '4px',
                zIndex: 100,
              }}
              className="animate-popover"
            >
              <div style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                UX States Demo
              </div>
              {(['normal', 'loading', 'empty', 'error'] as ScreenState[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    onChangeScreenState(st);
                    setStateMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    color: screenState === st ? 'var(--accent)' : 'var(--text-secondary)',
                    backgroundColor: screenState === st ? 'var(--accent-subtle)' : 'transparent',
                    textTransform: 'capitalize',
                  }}
                  className="hover:bg-[var(--sunken)]"
                >
                  <span>{st} state</span>
                  {screenState === st && <Check size={12} strokeWidth={2} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Task Logger Quick Mode Toggle */}
        {onToggleMobileLogger && (
          <button
            onClick={onToggleMobileLogger}
            title="Switch to Mobile Task Logging View (375-430px focus)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--accent)',
              backgroundColor: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
            }}
            className="hover:bg-[var(--sunken)]"
          >
            <Smartphone size={13} strokeWidth={1.5} />
            <span className="hidden sm:inline">Mobile Logger</span>
          </button>
        )}

        {/* Serif / Sans Typography Toggle (Prompt requirement) */}
        {activeScreen === 'page' && (
          <button
            onClick={onToggleSerif}
            title={isSerif ? 'Switch to Sans-serif (Inter)' : 'Switch to Editorial Serif (Newsreader)'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: isSerif ? 'var(--accent)' : 'var(--text-secondary)',
              backgroundColor: isSerif ? 'var(--accent-subtle)' : 'transparent',
            }}
            className="hover:bg-[var(--sunken)]"
          >
            <Type size={14} strokeWidth={1.5} />
            <span className="hidden sm:inline">{isSerif ? 'Serif' : 'Sans'}</span>
          </button>
        )}

        {/* Focus Mode button (Cmd+Shift+F) */}
        <button
          onClick={onToggleFocusMode}
          title="Focus Mode (Cmd+Shift+F)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: isFocusMode ? 'var(--accent)' : 'var(--text-secondary)',
            backgroundColor: isFocusMode ? 'var(--accent-subtle)' : 'transparent',
          }}
          className="hover:bg-[var(--sunken)]"
        >
          <Maximize2 size={14} strokeWidth={1.5} />
          <span className="hidden lg:inline">Focus</span>
        </button>

        {/* Share / Export Markdown */}
        <button
          onClick={handleShare}
          title="Export Markdown / Copy link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
          className="hover:bg-[var(--sunken)]"
        >
          {copiedShare ? (
            <>
              <Check size={14} strokeWidth={2} color="var(--status-success)" />
              <span style={{ color: 'var(--status-success)' }}>Exported</span>
            </>
          ) : (
            <>
              <Share2 size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">Export</span>
            </>
          )}
        </button>

        {/* Right Contextual Panel Toggle */}
        <button
          onClick={onToggleContextPanel}
          title="Toggle Contextual Inspector (Comments, Info, AI, Pulse)"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            color: isContextPanelOpen ? 'var(--accent)' : 'var(--text-secondary)',
            backgroundColor: isContextPanelOpen ? 'var(--accent-subtle)' : 'transparent',
          }}
          className="hover:bg-[var(--sunken)]"
        >
          <PanelRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};
