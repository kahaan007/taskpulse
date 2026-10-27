'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Code2,
  Quote as QuoteIcon,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Type,
  SplitSquareVertical,
  Clock,
  Sparkles,
  Bold,
  Italic,
  Strikethrough,
  Link2,
  Highlighter,
  Table as TableIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { BlockItem, BlockType } from './types';

interface BlockEditorProps {
  blocks: BlockItem[];
  onChangeBlocks: (blocks: BlockItem[]) => void;
  isSerif?: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  onChangeBlocks,
  isSerif = false,
}) => {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [activeMenuBlockId, setActiveMenuBlockId] = useState<string | null>(null);
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    blockId: string | null;
    query: string;
    selectedIndex: number;
    coords: { x: number; y: number };
  }>({
    isOpen: false,
    blockId: null,
    query: '',
    selectedIndex: 0,
    coords: { x: 0, y: 0 },
  });

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [pulseSeconds, setPulseSeconds] = useState(840); // 14:00 remaining
  const [pulseActive, setPulseActive] = useState(true);

  // Pulse timer countdown simulation
  useEffect(() => {
    if (!pulseActive) return;
    const interval = setInterval(() => {
      setPulseSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(interval);
  }, [pulseActive]);

  const slashMenuItems: {
    type: BlockType;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    { type: 'paragraph', label: 'Text', desc: 'Plain text with sentence case', icon: <Type size={15} /> },
    { type: 'heading1', label: 'Heading 1', desc: 'Large section heading', icon: <Heading1 size={15} /> },
    { type: 'heading2', label: 'Heading 2', desc: 'Medium subsection title', icon: <Heading2 size={15} /> },
    { type: 'heading3', label: 'Heading 3', desc: 'Small subsection title', icon: <Heading3 size={15} /> },
    { type: 'todo', label: 'To-do list', desc: 'Track tasks with custom checkbox', icon: <CheckSquare size={15} /> },
    { type: 'bullet', label: 'Bulleted list', desc: 'Create a simple bulleted list', icon: <List size={15} /> },
    { type: 'number', label: 'Numbered list', desc: 'Create a list with numbering', icon: <ListOrdered size={15} /> },
    { type: 'toggle', label: 'Toggle list', desc: 'Toggles can show or hide content', icon: <ChevronRight size={15} /> },
    { type: 'quote', label: 'Quote', desc: 'Capture a quote with left border', icon: <QuoteIcon size={15} /> },
    { type: 'callout', label: 'Callout', desc: 'Make writing stand out with an icon', icon: <Sparkles size={15} /> },
    { type: 'code', label: 'Code', desc: 'Capture a code snippet with mono font', icon: <Code2 size={15} /> },
    { type: 'table', label: 'Table', desc: 'Add inline specification table', icon: <TableIcon size={15} /> },
    { type: 'divider', label: 'Divider', desc: 'Visually divide blocks with a line', icon: <SplitSquareVertical size={15} /> },
    { type: 'embed', label: 'TaskPulse Nudge', desc: 'Embed 15-min interval pulse logger', icon: <Clock size={15} /> },
  ];

  const filteredSlashItems = slashMenuItems.filter(
    (item) =>
      item.label.toLowerCase().includes(slashMenu.query.toLowerCase()) ||
      item.desc.toLowerCase().includes(slashMenu.query.toLowerCase())
  );

  const handleUpdateBlockContent = (id: string, newContent: string) => {
    // Markdown shortcut detection:
    if (newContent.startsWith('# ')) {
      convertBlockType(id, 'heading1', newContent.slice(2));
      return;
    }
    if (newContent.startsWith('## ')) {
      convertBlockType(id, 'heading2', newContent.slice(3));
      return;
    }
    if (newContent.startsWith('### ')) {
      convertBlockType(id, 'heading3', newContent.slice(4));
      return;
    }
    if (newContent.startsWith('- ') || newContent.startsWith('* ')) {
      convertBlockType(id, 'bullet', newContent.slice(2));
      return;
    }
    if (newContent.startsWith('1. ')) {
      convertBlockType(id, 'number', newContent.slice(3));
      return;
    }
    if (newContent.startsWith('[] ') || newContent.startsWith('[ ] ')) {
      convertBlockType(id, 'todo', newContent.replace(/^\[\s*\]\s*/, ''));
      return;
    }
    if (newContent.startsWith('> ')) {
      convertBlockType(id, 'quote', newContent.slice(2));
      return;
    }
    if (newContent === '---') {
      convertBlockType(id, 'divider', '');
      return;
    }

    // Slash menu trigger
    if (newContent.endsWith('/')) {
      setSlashMenu({
        isOpen: true,
        blockId: id,
        query: '',
        selectedIndex: 0,
        coords: { x: 40, y: 30 },
      });
    } else if (slashMenu.isOpen && slashMenu.blockId === id) {
      const match = newContent.match(/\/([a-zA-Z0-9]*)$/);
      if (match) {
        setSlashMenu((prev) => ({ ...prev, query: match[1], selectedIndex: 0 }));
      } else {
        setSlashMenu((prev) => ({ ...prev, isOpen: false }));
      }
    }

    const updated = blocks.map((b) => (b.id === id ? { ...b, content: newContent } : b));
    onChangeBlocks(updated);
  };

  const convertBlockType = (id: string, newType: BlockType, content?: string) => {
    const updated = blocks.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          type: newType,
          content: content !== undefined ? content : b.content,
          checked: newType === 'todo' ? false : undefined,
          isOpen: newType === 'toggle' ? true : undefined,
          language: newType === 'code' ? 'typescript' : undefined,
          tableData:
            newType === 'table'
              ? [
                  ['Property', 'Spec', 'Tolerance'],
                  ['Material', '6063 Aluminum', '± 0.05 mm'],
                  ['Finish', 'Bead-blasted Anodized', '120 Grit'],
                ]
              : undefined,
        };
      }
      return b;
    });
    onChangeBlocks(updated);
    setSlashMenu((prev) => ({ ...prev, isOpen: false }));
    setActiveMenuBlockId(null);
  };

  const handleToggleTodo = (id: string) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, checked: !b.checked } : b));
    onChangeBlocks(updated);
  };

  const handleToggleAccordion = (id: string) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, isOpen: !b.isOpen } : b));
    onChangeBlocks(updated);
  };

  const handleAddBlockBelow = (targetId: string) => {
    const newBlock: BlockItem = {
      id: `b-${Date.now()}`,
      type: 'paragraph',
      content: '',
    };
    const index = blocks.findIndex((b) => b.id === targetId);
    if (index === -1) {
      onChangeBlocks([...blocks, newBlock]);
    } else {
      const copy = [...blocks];
      copy.splice(index + 1, 0, newBlock);
      onChangeBlocks(copy);
    }
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const updated = blocks.filter((b) => b.id !== id);
    onChangeBlocks(updated);
    setActiveMenuBlockId(null);
  };

  const handleDuplicateBlock = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const duplicate: BlockItem = {
      ...block,
      id: `b-${Date.now()}`,
    };
    const index = blocks.findIndex((b) => b.id === id);
    const copy = [...blocks];
    copy.splice(index + 1, 0, duplicate);
    onChangeBlocks(copy);
    setActiveMenuBlockId(null);
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const formatPulseTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        maxWidth: 'var(--max-reading-width)',
        margin: '0 auto',
        padding: '0 24px 80px',
        fontFamily: isSerif ? 'var(--font-serif)' : 'var(--font-sans)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {blocks.map((block, idx) => {
          const isHovered = hoveredBlockId === block.id;

          return (
            <div
              key={block.id}
              onMouseEnter={() => setHoveredBlockId(block.id)}
              onMouseLeave={() => setHoveredBlockId(null)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                padding: '2px 0',
                borderRadius: 'var(--radius-xs)',
              }}
              className="group"
            >
              {/* Unobtrusive Dieter Rams Controls: Drag handle and Add (+) button on hover */}
              <div
                style={{
                  position: 'absolute',
                  left: '-44px',
                  top: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  opacity: isHovered || activeMenuBlockId === block.id ? 1 : 0,
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                <button
                  onClick={() => handleAddBlockBelow(block.id)}
                  title="Add block below"
                  style={{
                    padding: '3px',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-tertiary)',
                  }}
                  className="hover:text-[var(--text-primary)] hover:bg-[var(--sunken)]"
                >
                  <Plus size={13} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() =>
                    setActiveMenuBlockId(activeMenuBlockId === block.id ? null : block.id)
                  }
                  title="Drag to move or click for block menu"
                  style={{
                    padding: '3px',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-tertiary)',
                    cursor: 'grab',
                  }}
                  className="hover:text-[var(--text-primary)] hover:bg-[var(--sunken)]"
                >
                  <GripVertical size={13} strokeWidth={1.5} />
                </button>

                {/* Block Context Menu Popover */}
                {activeMenuBlockId === block.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '4px',
                      width: '200px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-floating)',
                      padding: '4px',
                      zIndex: 120,
                    }}
                    className="animate-popover"
                  >
                    <div style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Turn Into
                    </div>
                    {(['paragraph', 'heading1', 'heading2', 'todo', 'quote', 'code'] as BlockType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => convertBlockType(block.id, t)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '5px 8px',
                          fontSize: '12px',
                          borderRadius: 'var(--radius-sm)',
                          color: block.type === t ? 'var(--accent)' : 'var(--text-secondary)',
                          textTransform: 'capitalize',
                        }}
                        className="hover:bg-[var(--sunken)]"
                      >
                        {t}
                      </button>
                    ))}
                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
                    <button
                      onClick={() => handleDuplicateBlock(block.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '5px 8px',
                        fontSize: '12px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                      }}
                      className="hover:bg-[var(--sunken)]"
                    >
                      <Copy size={13} />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '5px 8px',
                        fontSize: '12px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--status-danger)',
                      }}
                      className="hover:bg-[var(--sunken)]"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Block Content Renderers */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Paragraph */}
                {block.type === 'paragraph' && (
                  <textarea
                    rows={1}
                    value={block.content}
                    onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddBlockBelow(block.id);
                      }
                      if (e.key === 'Backspace' && block.content === '') {
                        e.preventDefault();
                        handleDeleteBlock(block.id);
                      }
                    }}
                    placeholder="Type '/' for commands or markdown shortcuts..."
                    style={{
                      width: '100%',
                      resize: 'none',
                      fontSize: '15px',
                      lineHeight: 1.65,
                      color: 'var(--text-primary)',
                      outline: 'none',
                      border: 'none',
                      backgroundColor: 'transparent',
                      padding: '2px 0',
                    }}
                  />
                )}

                {/* Heading 1 */}
                {block.type === 'heading1' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBlockBelow(block.id);
                      }
                    }}
                    placeholder="Heading 1"
                    style={{
                      width: '100%',
                      fontSize: 'var(--text-xl)',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      border: 'none',
                      backgroundColor: 'transparent',
                      marginTop: '16px',
                      marginBottom: '4px',
                    }}
                  />
                )}

                {/* Heading 2 */}
                {block.type === 'heading2' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBlockBelow(block.id);
                      }
                    }}
                    placeholder="Heading 2"
                    style={{
                      width: '100%',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      border: 'none',
                      backgroundColor: 'transparent',
                      marginTop: '14px',
                      marginBottom: '2px',
                    }}
                  />
                )}

                {/* Heading 3 */}
                {block.type === 'heading3' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBlockBelow(block.id);
                      }
                    }}
                    placeholder="Heading 3"
                    style={{
                      width: '100%',
                      fontSize: 'var(--text-md)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      outline: 'none',
                      border: 'none',
                      backgroundColor: 'transparent',
                      marginTop: '10px',
                    }}
                  />
                )}

                {/* To-Do Item with animated checkbox stroke-draw */}
                {block.type === 'todo' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '3px 0' }}>
                    <button
                      onClick={() => handleToggleTodo(block.id)}
                      role="checkbox"
                      aria-checked={block.checked}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: 'var(--radius-xs)',
                        border: block.checked ? '1px solid var(--accent)' : '1px solid var(--border-strong)',
                        backgroundColor: block.checked ? 'var(--accent)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
                      }}
                    >
                      {block.checked && (
                        <Check size={12} strokeWidth={2.5} color="#ffffff" className="animate-check" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const newBlock: BlockItem = {
                            id: `b-${Date.now()}`,
                            type: 'todo',
                            content: '',
                            checked: false,
                          };
                          const index = blocks.findIndex((b) => b.id === block.id);
                          const copy = [...blocks];
                          copy.splice(index + 1, 0, newBlock);
                          onChangeBlocks(copy);
                        }
                      }}
                      style={{
                        width: '100%',
                        fontSize: '15px',
                        color: block.checked ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        textDecoration: block.checked ? 'line-through' : 'none',
                        outline: 'none',
                        border: 'none',
                        backgroundColor: 'transparent',
                      }}
                    />
                  </div>
                )}

                {/* Bulleted List */}
                {block.type === 'bullet' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 0' }}>
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--text-secondary)',
                        flexShrink: 0,
                        marginLeft: '4px',
                      }}
                    />
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '15px',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        border: 'none',
                        backgroundColor: 'transparent',
                      }}
                    />
                  </div>
                )}

                {/* Numbered List */}
                {block.type === 'number' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        flexShrink: 0,
                        width: '18px',
                      }}
                    >
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '15px',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        border: 'none',
                        backgroundColor: 'transparent',
                      }}
                    />
                  </div>
                )}

                {/* Toggle Accordion */}
                {block.type === 'toggle' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleAccordion(block.id)}
                        style={{
                          transform: block.isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform var(--transition-fast)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <ChevronRight size={15} />
                      </button>
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                        style={{
                          width: '100%',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          outline: 'none',
                          border: 'none',
                          backgroundColor: 'transparent',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Quote Block */}
                {block.type === 'quote' && (
                  <div
                    style={{
                      borderLeft: '3px solid var(--accent)',
                      padding: '4px 14px',
                      margin: '8px 0',
                      fontStyle: 'italic',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--sunken)',
                      borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                    }}
                  >
                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      style={{
                        width: '100%',
                        resize: 'none',
                        fontSize: '15px',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        border: 'none',
                        backgroundColor: 'transparent',
                      }}
                    />
                  </div>
                )}

                {/* Callout Block */}
                {block.type === 'callout' && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px 14px',
                      margin: '10px 0',
                      backgroundColor: 'var(--sunken)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{block.calloutIcon || '💡'}</span>
                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      style={{
                        width: '100%',
                        resize: 'none',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--text-primary)',
                        outline: 'none',
                        border: 'none',
                        backgroundColor: 'transparent',
                      }}
                    />
                  </div>
                )}

                {/* Code Block with line numbers, copy button, and mono styling */}
                {block.type === 'code' && (
                  <div
                    style={{
                      margin: '12px 0',
                      backgroundColor: 'var(--sunken)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 12px',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {block.language || 'typescript'}
                      </span>
                      <button
                        onClick={() => handleCopyCode(block.id, block.content)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: copiedCodeId === block.id ? 'var(--status-success)' : 'var(--text-secondary)',
                          fontSize: '11px',
                        }}
                      >
                        {copiedCodeId === block.id ? (
                          <>
                            <Check size={12} strokeWidth={2} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} strokeWidth={1.5} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={Math.max(3, block.content.split('\n').length)}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      spellCheck={false}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                  </div>
                )}

                {/* Table Block */}
                {block.type === 'table' && block.tableData && (
                  <div
                    style={{
                      margin: '14px 0',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      overflowX: 'auto',
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <tbody>
                        {block.tableData.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            style={{
                              backgroundColor: rIdx === 0 ? 'var(--sunken)' : 'transparent',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                style={{
                                  padding: '8px 12px',
                                  borderRight: '1px solid var(--border)',
                                  fontWeight: rIdx === 0 ? 600 : 400,
                                  color: rIdx === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
                                }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Divider Block */}
                {block.type === 'divider' && (
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />
                  </div>
                )}

                {/* Embed: Live TaskPulse 15-Minute Slot Widget */}
                {block.type === 'embed' && (
                  <div
                    style={{
                      margin: '16px 0',
                      padding: '16px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-floating)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent)',
                            boxShadow: '0 0 0 3px var(--accent-subtle)',
                          }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          TaskPulse · Active 15-Minute Slot
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--accent)',
                          backgroundColor: 'var(--accent-subtle)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs)',
                        }}
                      >
                        {formatPulseTime(pulseSeconds)} remaining
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Prompting for <strong>11:30 AM — 11:45 AM</strong> block. Tap chips to log directly into your Notion Daily Task Manager.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {['Firmware Tuning', 'Acoustic Test', 'Design Review', 'Client Sync', 'Break'].map((chip) => (
                        <button
                          key={chip}
                          onClick={() => alert(`Logged "${chip}" (15m) to Notion Daily Task Manager!`)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--sunken)',
                            fontSize: '12px',
                            color: 'var(--text-primary)',
                          }}
                          className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      <span>Autosaves to Notion · Assignee: Dieter K.</span>
                      <button
                        onClick={() => setPulseActive(!pulseActive)}
                        style={{ color: 'var(--accent)', fontWeight: 500 }}
                      >
                        {pulseActive ? 'Pause rhythm' : 'Resume rhythm'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slash Menu Dialog */}
      {slashMenu.isOpen && (
        <div
          style={{
            position: 'fixed',
            left: `${slashMenu.coords.x}px`,
            bottom: '80px',
            width: '280px',
            maxHeight: '340px',
            overflowY: 'auto',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-floating)',
            padding: '6px',
            zIndex: 999,
          }}
          className="animate-popover"
        >
          <div style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Basic Blocks ({filteredSlashItems.length})
          </div>
          {filteredSlashItems.map((item, idx) => (
            <button
              key={item.type}
              onClick={() => {
                if (slashMenu.blockId) {
                  convertBlockType(slashMenu.blockId, item.type);
                }
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                textAlign: 'left',
                backgroundColor: idx === slashMenu.selectedIndex ? 'var(--sunken)' : 'transparent',
              }}
              className="hover:bg-[var(--sunken)]"
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--surface)',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
