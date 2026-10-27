'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Check, X } from 'lucide-react';

export interface SelectSheetItem {
  id: string;
  name: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface SelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: SelectSheetItem[];
  selectedId?: string;
  onSelect: (item: SelectSheetItem) => void;
  recentIds?: string[];
}

export const SelectSheet: React.FC<SelectSheetProps> = ({
  isOpen,
  onClose,
  title,
  items,
  selectedId,
  onSelect,
  recentIds = [],
}) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input if items > 8
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      if (items.length > 8) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, items.length]);

  // Filter items
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [items, search]);

  // Recents (last 3 used)
  const recentItems = useMemo(() => {
    if (search.trim()) return [];
    return recentIds
      .map((id) => items.find((it) => it.id === id))
      .filter((it): it is SelectSheetItem => Boolean(it))
      .slice(0, 3);
  }, [recentIds, items, search]);

  // Grouped by Alphabet (A-Z)
  const groupedAZ = useMemo(() => {
    const groups: Record<string, SelectSheetItem[]> = {};
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    for (const item of sorted) {
      const letter = item.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(item);
    }
    return groups;
  }, [filtered]);

  if (!isOpen) return null;

  const handleSelectItem = (item: SelectSheetItem) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch (_) {}
    }
    onSelect(item);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '82dvh',
          backgroundColor: 'var(--surface)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          borderTop: '1px solid var(--border)',
          boxShadow: 'var(--shadow-floating)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'sheetSlideUp 220ms cubic-bezier(0.2, 0, 0, 1) forwards',
        }}
      >
        <style>{`
          @keyframes sheetSlideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Native Grabber */}
        <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: 'var(--border-strong)',
            }}
          />
        </div>

        {/* Header & Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px 12px',
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ padding: '4px', color: 'var(--text-tertiary)' }}
            className="hover:text-[var(--text-primary)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Bar (Auto-focused if >8 items) */}
        {items.length > 6 && (
          <div style={{ padding: '0 16px 12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--sunken)',
                border: '1px solid var(--border)',
              }}
            >
              <Search size={14} color="var(--text-tertiary)" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '16px', // 16px prevents iOS zoom
                  color: 'var(--text-primary)',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ color: 'var(--text-tertiary)' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Items List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Recents Group */}
          {recentItems.length > 0 && !search && (
            <div style={{ marginBottom: '8px' }}>
              <div
                style={{
                  padding: '6px 20px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontWeight: 600,
                  backgroundColor: 'var(--accent-subtle)',
                }}
              >
                Recent
              </div>
              {recentItems.map((item) => (
                <ItemRow
                  key={`rec-${item.id}`}
                  item={item}
                  isSelected={item.id === selectedId}
                  onSelect={() => handleSelectItem(item)}
                />
              ))}
            </div>
          )}

          {/* Alphabetical Groups */}
          {Object.keys(groupedAZ).length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              No matches found.
            </div>
          ) : (
            Object.keys(groupedAZ).map((letter) => (
              <div key={letter}>
                <div
                  style={{
                    position: 'sticky',
                    top: 0,
                    padding: '4px 20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-tertiary)',
                    backgroundColor: 'var(--sunken)',
                    borderBottom: '1px solid var(--border)',
                    letterSpacing: '0.04em',
                    zIndex: 2,
                  }}
                >
                  {letter}
                </div>
                {groupedAZ[letter].map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedId}
                    onSelect={() => handleSelectItem(item)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ItemRow: React.FC<{
  item: SelectSheetItem;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ item, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
        textAlign: 'left',
      }}
      className="touch-target hover:bg-[var(--sunken)]"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, paddingRight: '12px' }}>
        {item.icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: isSelected ? 'var(--accent)' : 'var(--sunken)',
              color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {item.icon}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </div>
          {item.subtitle && (
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {item.badge ? `${item.badge} · ` : ''}
              {item.subtitle}
            </div>
          )}
        </div>
      </div>

      {isSelected && (
        <div style={{ color: 'var(--accent)', flexShrink: 0 }}>
          <Check size={16} strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
};
