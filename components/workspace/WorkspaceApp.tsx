'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { CanvasTopBar } from './CanvasTopBar';
import { CanvasHeader } from './CanvasHeader';
import { BlockEditor } from './BlockEditor';
import { DatabaseView } from './DatabaseView';
import { HomeDashboard } from './HomeDashboard';
import { SettingsView } from './SettingsView';
import { TrashView } from './TrashView';
import { RightContextualPanel } from './RightContextualPanel';
import { CommandPalette } from './CommandPalette';
import { StatesPreview } from './StatesPreview';
import { MobileNav } from './MobileNav';
import { FocusModeOverlay } from './FocusModeOverlay';
import { MobileTaskPulseApp } from '../mobile-logger/MobileTaskPulseApp';
import { WorkspacePage, TaskRecord, RightPanelTab, ScreenState, MainViewType } from './types';
import { initialPages, initialTasks } from './mock-data';

export const WorkspaceApp: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Navigation & Screen state
  const [activeScreen, setActiveScreen] = useState<MainViewType>('home');
  const [activePageId, setActivePageId] = useState<string>('page-braun-spec');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [contextPanelOpen, setContextPanelOpen] = useState<boolean>(false);
  const [contextPanelTab, setContextPanelTab] = useState<RightPanelTab>('pulse');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isSerif, setIsSerif] = useState<boolean>(false);
  const [screenState, setScreenState] = useState<ScreenState>('normal');

  // Data states
  const [pages, setPages] = useState<WorkspacePage[]>(initialPages);
  const [tasks, setTasks] = useState<TaskRecord[]>(initialTasks);
  const [isNotionSyncing, setIsNotionSyncing] = useState<boolean>(false);
  const [notionDatabaseId, setNotionDatabaseId] = useState<string>('884cfc0c-ee75-82ea-bfe3-87095464a681');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile-First view mode (Defaults to mobile: "The mobile UI should look mobile first")
  const [viewMode, setViewMode] = useState<'mobile' | 'workspace'>('mobile');
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync theme with html data-theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toast auto-dismiss
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Fetch real Notion database records on mount
  const fetchNotionTasks = useCallback(async () => {
    setIsNotionSyncing(true);
    try {
      const res = await fetch('/api/notion/tasks');
      if (res.ok) {
        const data = await res.json();
        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
          setNotionDatabaseId(data.databaseId || '884cfc0c-ee75-82ea-bfe3-87095464a681');
          showToast(`Synced ${data.tasks.length} tasks from Notion Daily Task Manager`);
        }
      }
    } catch (e) {
      console.warn('Using offline cached tasks:', e);
    } finally {
      setIsNotionSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchNotionTasks();
  }, [fetchNotionTasks]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K: Quick find
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      // Cmd+\: Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
      // Cmd+Shift+F: Toggle Focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }
      // Escape: Close layers & Focus mode
      if (e.key === 'Escape') {
        if (isFocusMode) setIsFocusMode(false);
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        if (mobileSidebarOpen) setMobileSidebarOpen(false);
      }
      // Cmd+Z: Undo notification
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        showToast('Undo completed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, commandPaletteOpen, mobileSidebarOpen, showToast]);

  // Active page lookup
  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  // Actions
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    showToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} mode`);
  };

  const handleCreatePage = () => {
    const newId = `page-${Date.now()}`;
    const newPage: WorkspacePage = {
      id: newId,
      title: 'Untitled Document',
      icon: '📝',
      createdAt: new Date().toISOString(),
      updatedAt: 'Just now',
      author: {
        name: 'Dieter K.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
      properties: {
        status: 'In Progress',
        priority: 'Medium',
        category: 'Product Specs',
        pulseMinutes: 15,
        dueDate: 'Nov 25, 2026',
        tags: ['Draft', 'Spec'],
      },
      blocks: [
        {
          id: `b-${Date.now()}-1`,
          type: 'heading1',
          content: 'Untitled Document',
        },
        {
          id: `b-${Date.now()}-2`,
          type: 'paragraph',
          content: 'Begin drafting your specification or type "/" to browse blocks...',
        },
      ],
    };

    setPages([newPage, ...pages]);
    setActivePageId(newId);
    setActiveScreen('page');
    setMobileSidebarOpen(false);
    showToast('Created new page');
  };

  const handleDeletePage = (pageId: string) => {
    setPages(pages.map((p) => (p.id === pageId ? { ...p, isTrash: true } : p)));
    showToast('Moved page to Trash (undo with ⌘Z)');
    if (activePageId === pageId) {
      const remaining = pages.filter((p) => p.id !== pageId && !p.isTrash);
      if (remaining.length > 0) {
        setActivePageId(remaining[0].id);
      } else {
        setActiveScreen('home');
      }
    }
  };

  const handleRestorePage = (pageId: string) => {
    setPages(pages.map((p) => (p.id === pageId ? { ...p, isTrash: false } : p)));
    showToast('Restored page from Trash');
  };

  const handlePermanentlyDeletePage = (pageId: string) => {
    setPages(pages.filter((p) => p.id !== pageId));
    showToast('Page permanently deleted');
  };

  const handleEmptyTrash = () => {
    setPages(pages.filter((p) => !p.isTrash));
    showToast('Emptied Trash');
  };

  const handleToggleFavorite = (pageId: string) => {
    setPages(
      pages.map((p) => (p.id === pageId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleUpdatePageTitle = (newTitle: string) => {
    setPages(
      pages.map((p) => (p.id === activePageId ? { ...p, title: newTitle, updatedAt: 'Just now' } : p))
    );
  };

  const handleUpdatePageProperty = (key: string, value: any) => {
    setPages(
      pages.map((p) =>
        p.id === activePageId
          ? { ...p, properties: { ...p.properties, [key]: value }, updatedAt: 'Just now' }
          : p
      )
    );
  };

  const handleUpdatePageIcon = (newIcon: string) => {
    setPages(
      pages.map((p) => (p.id === activePageId ? { ...p, icon: newIcon, updatedAt: 'Just now' } : p))
    );
  };

  const handleTogglePageCover = () => {
    setPages(
      pages.map((p) => {
        if (p.id === activePageId) {
          const hasCover = Boolean(p.cover);
          return {
            ...p,
            cover: hasCover
              ? undefined
              : 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=1600&q=80',
          };
        }
        return p;
      })
    );
  };

  const handleExportMarkdown = () => {
    if (!activePage) return;
    const md = `# ${activePage.title}\n\n` +
      activePage.blocks.map((b) => b.content).join('\n\n');
    navigator.clipboard.writeText(md);
    showToast('Exported page markdown to clipboard');
  };

  const currentWordCount = activePage
    ? activePage.blocks.map((b) => b.content).join(' ').trim().split(/\s+/).filter(Boolean).length
    : 0;

  // Mobile-First: Default to the mobile task logging experience
  if (viewMode === 'mobile') {
    return (
      <MobileTaskPulseApp
        onSwitchToWorkspace={() => setViewMode('workspace')}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: isSerif && activeScreen === 'page' ? 'var(--font-serif)' : 'var(--font-sans)',
        paddingTop: '36px',
      }}
    >
      {/* Return to Mobile Logger banner */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '36px',
          backgroundColor: 'var(--accent)',
          color: '#fff',
          padding: '0 16px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000,
        }}
      >
        <span>Viewing Workspace Documentation & Database</span>
        <button
          onClick={() => setViewMode('mobile')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            color: '#fff',
            border: 'none',
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📱 Return to Mobile Task Logger
        </button>
      </div>

      {/* 1. LEFT SIDEBAR (Hidden in Focus Mode) */}
      {!isFocusMode && (
        <Sidebar
          pages={pages}
          activePageId={activePageId}
          activeScreen={activeScreen}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSelectPage={(id) => {
            setActivePageId(id);
            setActiveScreen('page');
            setMobileSidebarOpen(false);
          }}
          onSelectScreen={(screen) => {
            setActiveScreen(screen as any);
            setMobileSidebarOpen(false);
          }}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onCreatePage={handleCreatePage}
          onDeletePage={handleDeletePage}
          onToggleFavorite={handleToggleFavorite}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 2. MAIN CANVAS ZONE */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'var(--bg)',
        }}
      >
        {/* Top Header Bar (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <CanvasTopBar
            page={activeScreen === 'page' ? activePage : undefined}
            activeScreen={activeScreen}
            isFocusMode={isFocusMode}
            onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
            isSerif={isSerif}
            onToggleSerif={() => setIsSerif(!isSerif)}
            isContextPanelOpen={contextPanelOpen}
            onToggleContextPanel={() => setContextPanelOpen(!contextPanelOpen)}
            onToggleSidebarMobile={() => setMobileSidebarOpen(true)}
            screenState={screenState}
            onChangeScreenState={(st) => setScreenState(st)}
            onExportMarkdown={handleExportMarkdown}
            onToggleMobileLogger={() => setViewMode('mobile')}
          />
        )}

        {/* Scrollable Document Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: '60px',
            backgroundColor: isFocusMode ? 'var(--surface)' : 'var(--bg)',
          }}
        >
          {/* Skeletons, Empty, Error state overlay */}
          {screenState !== 'normal' ? (
            <StatesPreview
              state={screenState}
              onResetToNormal={() => setScreenState('normal')}
              onRetryError={() => showToast('Notion API reconnected successfully!')}
            />
          ) : (
            <>
              {/* SCREEN 1: HOME / DASHBOARD */}
              {activeScreen === 'home' && (
                <HomeDashboard
                  pages={pages}
                  tasks={tasks}
                  onSelectPage={(id) => {
                    setActivePageId(id);
                    setActiveScreen('page');
                  }}
                  onSelectScreen={(sc) => setActiveScreen(sc as any)}
                  onCreatePage={handleCreatePage}
                />
              )}

              {/* SCREEN 2: PAGE EDITOR */}
              {activeScreen === 'page' && activePage && (
                <article>
                  {!isFocusMode && (
                    <CanvasHeader
                      page={activePage}
                      onUpdateTitle={handleUpdatePageTitle}
                      onUpdateProperty={handleUpdatePageProperty}
                      onUpdateIcon={handleUpdatePageIcon}
                      onToggleCover={handleTogglePageCover}
                    />
                  )}
                  {isFocusMode && (
                    <div style={{ maxWidth: 'var(--max-reading-width)', margin: '40px auto 16px', padding: '0 24px' }}>
                      <h1 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '20px' }}>
                        {activePage.title}
                      </h1>
                    </div>
                  )}
                  <BlockEditor
                    blocks={activePage.blocks}
                    onChangeBlocks={(newBlocks) => {
                      setPages(
                        pages.map((p) =>
                          p.id === activePageId
                            ? { ...p, blocks: newBlocks, updatedAt: 'Just now' }
                            : p
                        )
                      );
                    }}
                    isSerif={isSerif}
                  />
                </article>
              )}

              {/* SCREEN 3: DATABASE VIEWS (Table, Board, List, Gallery, Calendar) */}
              {activeScreen === 'database' && (
                <DatabaseView
                  tasks={tasks}
                  onUpdateTasks={(newTasks) => setTasks(newTasks)}
                  onRefreshNotion={fetchNotionTasks}
                  isSyncing={isNotionSyncing}
                />
              )}

              {/* SCREEN 4: SETTINGS & WORKSPACE */}
              {activeScreen === 'settings' && (
                <SettingsView
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                  isSerif={isSerif}
                  onToggleSerif={() => setIsSerif(!isSerif)}
                />
              )}

              {/* SCREEN 5: TRASH */}
              {activeScreen === 'trash' && (
                <TrashView
                  pages={pages}
                  onRestorePage={handleRestorePage}
                  onPermanentlyDeletePage={handlePermanentlyDeletePage}
                  onEmptyTrash={handleEmptyTrash}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* 3. RIGHT CONTEXTUAL PANEL (320px, Hidden in Focus Mode) */}
      {!isFocusMode && (
        <RightContextualPanel
          page={activeScreen === 'page' ? activePage : undefined}
          isOpen={contextPanelOpen}
          onClose={() => setContextPanelOpen(false)}
          activeTab={contextPanelTab}
          onChangeTab={(tab) => setContextPanelTab(tab)}
        />
      )}

      {/* 4. COMMAND PALETTE (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        pages={pages}
        onSelectPage={(id) => {
          setActivePageId(id);
          setActiveScreen('page');
        }}
        onSelectScreen={(screen) => setActiveScreen(screen as any)}
        onCreatePage={handleCreatePage}
        onToggleTheme={handleToggleTheme}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        onExportMarkdown={handleExportMarkdown}
        theme={theme}
      />

      {/* 5. FOCUS MODE OVERLAY (Cmd+Shift+F) */}
      <FocusModeOverlay
        isFocusMode={isFocusMode}
        onExitFocusMode={() => setIsFocusMode(false)}
        wordCount={currentWordCount}
      />

      {/* 6. MOBILE BOTTOM NAVIGATION (<640px, Hidden in Focus Mode) */}
      {!isFocusMode && (
        <MobileNav
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen as any)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onCreatePage={handleCreatePage}
        />
      )}

      {/* 7. SYSTEM TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--bg)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            boxShadow: 'var(--shadow-floating)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className="animate-popover"
        >
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
