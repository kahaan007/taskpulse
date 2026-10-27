'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Settings,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  LayoutGrid,
  MoreHorizontal,
  Folder,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  CheckSquare,
  Home,
  Layers,
  Database,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { WorkspacePage } from './types';

interface SidebarProps {
  pages: WorkspacePage[];
  activePageId: string;
  activeScreen: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectPage: (pageId: string) => void;
  onSelectScreen: (screen: string) => void;
  onOpenCommandPalette: () => void;
  onCreatePage: () => void;
  onDeletePage: (pageId: string) => void;
  onToggleFavorite: (pageId: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pages,
  activePageId,
  activeScreen,
  isCollapsed,
  onToggleCollapse,
  onSelectPage,
  onSelectScreen,
  onOpenCommandPalette,
  onCreatePage,
  onDeletePage,
  onToggleFavorite,
  theme,
  onToggleTheme,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [activeMenuPageId, setActiveMenuPageId] = useState<string | null>(null);

  const favoritePages = pages.filter((p) => p.isFavorite && !p.isTrash);
  const regularPages = pages.filter((p) => !p.isTrash);
  const trashPages = pages.filter((p) => p.isTrash);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 998,
          }}
          className="sm:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: isCollapsed ? 'var(--sidebar-rail-width)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--sunken)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexShrink: 0,
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          userSelect: 'none',
          position: isMobileOpen ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: isMobileOpen ? 999 : 20,
          transform: isMobileOpen ? 'translateX(0)' : undefined,
        }}
        aria-label="Workspace Sidebar"
      >
        {/* Workspace Switcher & Top Header */}
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '52px',
          }}
        >
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar (Cmd+\)"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
              }}
            >
              <PanelLeftOpen size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                  className="hover:bg-[var(--border)]"
                >
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    TP
                  </span>
                  <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    TaskPulse Studio
                  </span>
                  <ChevronDown size={14} strokeWidth={1.5} color="var(--text-tertiary)" />
                </button>

                {/* Workspace Switcher Popover */}
                {workspaceMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '6px',
                      width: '220px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-floating)',
                      padding: '6px',
                      zIndex: 100,
                    }}
                    className="animate-popover"
                  >
                    <div style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Workspaces
                    </div>
                    <button
                      onClick={() => setWorkspaceMenuOpen(false)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--sunken)',
                      }}
                    >
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          backgroundColor: 'var(--accent)',
                          color: '#fff',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        TP
                      </span>
                      TaskPulse Studio (Active)
                    </button>
                    <button
                      onClick={() => setWorkspaceMenuOpen(false)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                      }}
                      className="hover:bg-[var(--sunken)]"
                    >
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          backgroundColor: 'var(--border)',
                          color: 'var(--text-secondary)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        BR
                      </span>
                      Braun Audio Lab
                    </button>
                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
                    <button
                      onClick={() => {
                        setWorkspaceMenuOpen(false);
                        onSelectScreen('settings');
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                      }}
                      className="hover:bg-[var(--sunken)]"
                    >
                      <Settings size={14} strokeWidth={1.5} />
                      Manage workspace
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button
                  onClick={onToggleCollapse}
                  title="Collapse sidebar (Cmd+\)"
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                  }}
                  className="hover:bg-[var(--border)]"
                >
                  <PanelLeftClose size={16} strokeWidth={1.5} />
                </button>
                {isMobileOpen && (
                  <button
                    onClick={onCloseMobile}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                    }}
                    className="sm:hidden"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Scrollable Nav Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isCollapsed ? '10px 6px' : '10px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Quick Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={onOpenCommandPalette}
              title="Search and Command Palette (Cmd+K)"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
              }}
              className="hover:bg-[var(--border)]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={16} strokeWidth={1.5} color="var(--text-secondary)" />
                {!isCollapsed && <span>Quick find</span>}
              </div>
              {!isCollapsed && <kbd>⌘K</kbd>}
            </button>

            <button
              onClick={() => onSelectScreen('home')}
              title="Workspace Home"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                color: activeScreen === 'home' ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: activeScreen === 'home' ? 'var(--surface)' : 'transparent',
                borderLeft: activeScreen === 'home' ? '2px solid var(--accent)' : '2px solid transparent',
                fontWeight: activeScreen === 'home' ? 500 : 400,
              }}
              className="hover:bg-[var(--border)]"
            >
              <Home size={16} strokeWidth={1.5} color={activeScreen === 'home' ? 'var(--accent)' : 'var(--text-secondary)'} />
              {!isCollapsed && <span>Home</span>}
            </button>

            <button
              onClick={() => onSelectScreen('database')}
              title="Projects & Tasks Database"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                color: activeScreen === 'database' ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: activeScreen === 'database' ? 'var(--surface)' : 'transparent',
                borderLeft: activeScreen === 'database' ? '2px solid var(--accent)' : '2px solid transparent',
                fontWeight: activeScreen === 'database' ? 500 : 400,
              }}
              className="hover:bg-[var(--border)]"
            >
              <Database size={16} strokeWidth={1.5} color={activeScreen === 'database' ? 'var(--accent)' : 'var(--text-secondary)'} />
              {!isCollapsed && <span>Tasks & Projects</span>}
            </button>

            <button
              onClick={onCreatePage}
              title="Create new page"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
              }}
              className="hover:bg-[var(--border)]"
            >
              <Plus size={16} strokeWidth={1.5} color="var(--accent)" />
              {!isCollapsed && <span style={{ color: 'var(--accent)', fontWeight: 500 }}>New page</span>}
            </button>
          </div>

          {!isCollapsed && (
            <>
              {/* Favorites Section */}
              {favoritePages.length > 0 && (
                <div>
                  <div
                    onClick={() => setFavoritesExpanded(!favoritesExpanded)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-xs)',
                    }}
                    className="hover:text-[var(--text-secondary)]"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {favoritesExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      Favorites
                    </span>
                    <Pin size={11} strokeWidth={1.5} />
                  </div>

                  {favoritesExpanded && (
                    <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      {favoritePages.map((page) => {
                        const isActive = activeScreen === 'page' && activePageId === page.id;
                        return (
                          <div
                            key={page.id}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: isActive ? 'var(--surface)' : 'transparent',
                              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                            }}
                            className="group hover:bg-[var(--border)]"
                          >
                            <button
                              onClick={() => {
                                onSelectScreen('page');
                                onSelectPage(page.id);
                              }}
                              style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                fontSize: 'var(--text-sm)',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                textAlign: 'left',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span style={{ fontSize: '14px', flexShrink: 0 }}>{page.icon}</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {page.title}
                              </span>
                            </button>

                            <button
                              onClick={() => onToggleFavorite(page.id)}
                              title="Remove from favorites"
                              style={{
                                padding: '4px',
                                color: 'var(--accent)',
                                opacity: 0.8,
                              }}
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Pin size={12} strokeWidth={2} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Workspace Pages Tree */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span
                    onClick={() => setPagesExpanded(!pagesExpanded)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                    className="hover:text-[var(--text-secondary)]"
                  >
                    {pagesExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    Team Workspace
                  </span>
                  <button
                    onClick={onCreatePage}
                    title="Add page"
                    style={{
                      padding: '2px',
                      color: 'var(--text-tertiary)',
                    }}
                    className="hover:text-[var(--text-primary)]"
                  >
                    <Plus size={13} strokeWidth={1.5} />
                  </button>
                </div>

                {pagesExpanded && (
                  <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {regularPages.map((page) => {
                      const isActive = activeScreen === 'page' && activePageId === page.id;
                      return (
                        <div
                          key={page.id}
                          style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isActive ? 'var(--surface)' : 'transparent',
                            borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                          }}
                          className="group hover:bg-[var(--border)]"
                        >
                          <button
                            onClick={() => {
                              onSelectScreen('page');
                              onSelectPage(page.id);
                            }}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 8px',
                              fontSize: 'var(--text-sm)',
                              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                              textAlign: 'left',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span style={{ fontSize: '14px', flexShrink: 0 }}>{page.icon}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {page.title}
                            </span>
                          </button>

                          {/* Hover action items: + and ... */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              paddingRight: '4px',
                            }}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <button
                              onClick={() => onCreatePage()}
                              title="Add sub-page"
                              style={{
                                padding: '3px',
                                color: 'var(--text-tertiary)',
                              }}
                              className="hover:text-[var(--text-primary)]"
                            >
                              <Plus size={13} strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => setActiveMenuPageId(activeMenuPageId === page.id ? null : page.id)}
                              title="Page options"
                              style={{
                                padding: '3px',
                                color: 'var(--text-tertiary)',
                              }}
                              className="hover:text-[var(--text-primary)]"
                            >
                              <MoreHorizontal size={13} strokeWidth={1.5} />
                            </button>
                          </div>

                          {/* Page Options Dropdown */}
                          {activeMenuPageId === page.id && (
                            <div
                              style={{
                                position: 'absolute',
                                right: '10px',
                                top: '100%',
                                width: '160px',
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-floating)',
                                padding: '4px',
                                zIndex: 110,
                              }}
                              className="animate-popover"
                            >
                              <button
                                onClick={() => {
                                  onToggleFavorite(page.id);
                                  setActiveMenuPageId(null);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--text-secondary)',
                                }}
                                className="hover:bg-[var(--sunken)]"
                              >
                                <Pin size={13} strokeWidth={1.5} />
                                {page.isFavorite ? 'Remove favorite' : 'Add to favorites'}
                              </button>
                              <button
                                onClick={() => {
                                  onDeletePage(page.id);
                                  setActiveMenuPageId(null);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--status-danger)',
                                }}
                                className="hover:bg-[var(--sunken)]"
                              >
                                <Trash2 size={13} strokeWidth={1.5} />
                                Move to Trash
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Area: Trash, Settings, Theme */}
        <div
          style={{
            padding: isCollapsed ? '10px 6px' : '10px 10px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <button
            onClick={() => onSelectScreen('trash')}
            title="Trash"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '8px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              color: activeScreen === 'trash' ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: activeScreen === 'trash' ? 'var(--surface)' : 'transparent',
              borderLeft: activeScreen === 'trash' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
            className="hover:bg-[var(--border)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={16} strokeWidth={1.5} color="var(--text-secondary)" />
              {!isCollapsed && <span>Trash</span>}
            </div>
            {!isCollapsed && trashPages.length > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{trashPages.length}</span>
            )}
          </button>

          <button
            onClick={() => onSelectScreen('settings')}
            title="Workspace Settings"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              color: activeScreen === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: activeScreen === 'settings' ? 'var(--surface)' : 'transparent',
              borderLeft: activeScreen === 'settings' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
            className="hover:bg-[var(--border)]"
          >
            <Settings size={16} strokeWidth={1.5} color="var(--text-secondary)" />
            {!isCollapsed && <span>Settings & members</span>}
          </button>

          <div
            style={{
              marginTop: '4px',
              paddingTop: '6px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              paddingLeft: isCollapsed ? 0 : '8px',
              paddingRight: isCollapsed ? 0 : '8px',
            }}
          >
            {!isCollapsed && (
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
            )}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
              }}
              className="hover:bg-[var(--border)]"
            >
              {theme === 'dark' ? (
                <Sun size={15} strokeWidth={1.5} color="var(--accent)" />
              ) : (
                <Moon size={15} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
