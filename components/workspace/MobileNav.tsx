'use client';

import React from 'react';
import { Home, Search, Plus, Database, Settings, Clock } from 'lucide-react';

interface MobileNavProps {
  activeScreen: string;
  onSelectScreen: (screen: string) => void;
  onOpenCommandPalette: () => void;
  onCreatePage: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeScreen,
  onSelectScreen,
  onOpenCommandPalette,
  onCreatePage,
}) => {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        boxShadow: 'var(--shadow-floating)',
      }}
      className="sm:hidden"
      aria-label="Mobile Bottom Navigation"
    >
      {/* 1. Home */}
      <button
        onClick={() => onSelectScreen('home')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          width: '54px',
          height: '48px',
          color: activeScreen === 'home' ? 'var(--accent)' : 'var(--text-tertiary)',
        }}
        className="touch-target"
      >
        <Home size={18} strokeWidth={1.5} />
        <span style={{ fontSize: '10px', fontWeight: activeScreen === 'home' ? 600 : 400 }}>Home</span>
      </button>

      {/* 2. Search (Quick Find) */}
      <button
        onClick={onOpenCommandPalette}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          width: '54px',
          height: '48px',
          color: 'var(--text-tertiary)',
        }}
        className="touch-target"
      >
        <Search size={18} strokeWidth={1.5} />
        <span style={{ fontSize: '10px' }}>Search</span>
      </button>

      {/* 3. New Page Floating Action Button (Center thumb anchor) */}
      <button
        onClick={onCreatePage}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(232, 89, 12, 0.4)',
          transform: 'translateY(-4px)',
        }}
        className="touch-target"
        title="Create new page"
      >
        <Plus size={20} strokeWidth={2} />
      </button>

      {/* 4. Tasks & Projects Database */}
      <button
        onClick={() => onSelectScreen('database')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          width: '54px',
          height: '48px',
          color: activeScreen === 'database' ? 'var(--accent)' : 'var(--text-tertiary)',
        }}
        className="touch-target"
      >
        <Database size={18} strokeWidth={1.5} />
        <span style={{ fontSize: '10px', fontWeight: activeScreen === 'database' ? 600 : 400 }}>Tasks</span>
      </button>

      {/* 5. Settings */}
      <button
        onClick={() => onSelectScreen('settings')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          width: '54px',
          height: '48px',
          color: activeScreen === 'settings' ? 'var(--accent)' : 'var(--text-tertiary)',
        }}
        className="touch-target"
      >
        <Settings size={18} strokeWidth={1.5} />
        <span style={{ fontSize: '10px', fontWeight: activeScreen === 'settings' ? 600 : 400 }}>Settings</span>
      </button>
    </nav>
  );
};
