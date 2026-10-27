'use client';

import React, { useState } from 'react';
import {
  Table,
  Kanban,
  List as ListIcon,
  LayoutGrid,
  Calendar as CalendarIcon,
  Filter,
  ArrowUpDown,
  Plus,
  MoreHorizontal,
  Clock,
  User,
  CheckCircle2,
  Calendar,
  Tag,
  Search,
  X,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { TaskRecord, DatabaseViewMode } from './types';

interface DatabaseViewProps {
  tasks: TaskRecord[];
  onUpdateTasks: (tasks: TaskRecord[]) => void;
  onRefreshNotion?: () => void;
  isSyncing?: boolean;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  tasks,
  onUpdateTasks,
  onRefreshNotion,
  isSyncing = false,
}) => {
  const [viewMode, setViewMode] = useState<DatabaseViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'pulseMinutes' | 'dueDate'>('dueDate');
  const [peekTask, setPeekTask] = useState<TaskRecord | null>(null);
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskClient, setNewTaskClient] = useState('Siemens');
  const [newTaskType, setNewTaskType] = useState('High Fidelity');
  const [newTaskMinutes, setNewTaskMinutes] = useState(15);
  const [newTaskStatus, setNewTaskStatus] = useState<'Backlog' | 'In Progress' | 'In Review' | 'Done'>('In Progress');

  // Filter tasks
  let filtered = tasks.filter((t) => {
    const matchQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = selectedStatusFilter === 'All' || t.status === selectedStatusFilter;
    return matchQuery && matchStatus;
  });

  // Sort tasks
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'pulseMinutes') return b.pulseMinutes - a.pulseMinutes;
    if (sortBy === 'priority') {
      const order = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      return (order[b.priority] || 0) - (order[a.priority] || 0);
    }
    return a.dueDate.localeCompare(b.dueDate);
  });

  const handleCreateTask = async () => {
    const title = newTaskTitle.trim() || `${newTaskType} — ${newTaskClient}`;
    const newTask: TaskRecord = {
      id: `task-${Date.now()}`,
      title,
      status: newTaskStatus,
      priority: 'High',
      assignee: {
        name: 'Dieter K.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
      dueDate: new Date().toISOString().slice(0, 10),
      pulseMinutes: newTaskMinutes,
      category: newTaskClient,
      client: [newTaskClient],
      taskType: [newTaskType],
      tags: [newTaskClient, newTaskType],
      notionSynced: true,
      notes: `Logged directly into Notion Daily Task Manager (Minutes: ${newTaskMinutes}).`,
    };

    onUpdateTasks([newTask, ...tasks]);
    setIsCreatingModal(false);
    setNewTaskTitle('');

    // Write to Notion API
    try {
      await fetch('/api/notion/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          pulseMinutes: newTaskMinutes,
          client: [newTaskClient],
          taskType: [newTaskType],
          status: newTaskStatus,
          priority: 'High',
        }),
      });
      if (onRefreshNotion) onRefreshNotion();
    } catch (e) {
      console.error('Failed to write task to Notion:', e);
    }
  };

  const handleUpdateTaskField = async (taskId: string, field: keyof TaskRecord, value: any) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, [field]: value } : t));
    onUpdateTasks(updated);
    if (peekTask && peekTask.id === taskId) {
      setPeekTask({ ...peekTask, [field]: value });
    }

    // Sync field change to Notion API if id is a Notion UUID
    if (!taskId.startsWith('task-')) {
      try {
        await fetch('/api/notion/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: taskId,
            [field]: value,
          }),
        });
      } catch (e) {
        console.error('Failed to sync update to Notion:', e);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return { color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' };
      case 'High':
        return { color: 'var(--accent)', bg: 'var(--accent-subtle)' };
      case 'Medium':
        return { color: 'var(--status-warning)', bg: 'var(--status-warning-bg)' };
      default:
        return { color: 'var(--text-tertiary)', bg: 'var(--sunken)' };
    }
  };

  const columns = ['Backlog', 'In Progress', 'In Review', 'Done'] as const;

  return (
    <div style={{ padding: '24px 32px 80px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Title & Live Notion Link Badge */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--status-success-bg)',
              color: 'var(--status-success)',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-success)',
              }}
            />
            NOTION LINKED · DATA SOURCE 884cfc0c-ee75-82ea-bfe3-87095464a681
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            ({tasks.length} entries in Daily Task Manager)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <h1
            style={{
              fontSize: 'var(--text-title)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            Daily Task Manager
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onRefreshNotion && (
              <button
                onClick={onRefreshNotion}
                disabled={isSyncing}
                title="Sync live records from Notion"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Notion'}</span>
              </button>
            )}

            <a
              href="https://www.notion.so"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              <span>Open in Notion</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* View Tabs & Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '20px',
        }}
      >
        {/* View Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'table', label: 'Table', icon: <Table size={14} /> },
            { id: 'board', label: 'Board', icon: <Kanban size={14} /> },
            { id: 'list', label: 'List', icon: <ListIcon size={14} /> },
            { id: 'gallery', label: 'Gallery', icon: <LayoutGrid size={14} /> },
            { id: 'calendar', label: 'Calendar', icon: <CalendarIcon size={14} /> },
          ].map((tab) => {
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as DatabaseViewMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--sunken)' : 'transparent',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter, Sort, Search, New */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              fontSize: '12px',
            }}
          >
            <Search size={13} color="var(--text-tertiary)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Notion tasks..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                width: '130px',
                backgroundColor: 'transparent',
              }}
            />
          </div>

          {/* Filter Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: selectedStatusFilter !== 'All' ? 'var(--accent-subtle)' : 'var(--surface)',
                color: selectedStatusFilter !== 'All' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '12px',
              }}
            >
              <Filter size={13} />
              <span>Status: {selectedStatusFilter}</span>
            </button>
            {filterMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  width: '150px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-floating)',
                  padding: '4px',
                  zIndex: 100,
                }}
                className="animate-popover"
              >
                {['All', 'Backlog', 'In Progress', 'In Review', 'Done'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedStatusFilter(st);
                      setFilterMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      color: selectedStatusFilter === st ? 'var(--accent)' : 'var(--text-primary)',
                      textAlign: 'left',
                    }}
                    className="hover:bg-[var(--sunken)]"
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
              }}
            >
              <ArrowUpDown size={13} />
              <span className="hidden sm:inline">Sort: {sortBy}</span>
            </button>
            {sortMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  width: '160px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-floating)',
                  padding: '4px',
                  zIndex: 100,
                }}
                className="animate-popover"
              >
                {[
                  { id: 'dueDate', label: 'Date Created' },
                  { id: 'pulseMinutes', label: 'Minutes Duration' },
                  { id: 'priority', label: 'Priority' },
                  { id: 'title', label: 'Task Title' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortBy(s.id as any);
                      setSortMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      color: sortBy === s.id ? 'var(--accent)' : 'var(--text-primary)',
                      textAlign: 'left',
                    }}
                    className="hover:bg-[var(--sunken)]"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Task to Notion */}
          <button
            onClick={() => setIsCreatingModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <Plus size={14} strokeWidth={2} />
            <span>Add Notion Task</span>
          </button>
        </div>
      </div>

      {/* 1. TABLE VIEW */}
      {viewMode === 'table' && (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            overflowX: 'auto',
            backgroundColor: 'var(--surface)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--sunken)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '260px' }}>
                  Time Taken (Title)
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', width: '130px' }}>
                  Status
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', width: '130px' }}>
                  Client
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', width: '140px' }}>
                  Task Type
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', width: '90px' }}>
                  Minutes
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', width: '110px' }}>
                  Date Created
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', width: '80px' }}>
                  Notion
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setPeekTask(task)}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  className="hover:bg-[var(--sunken)]"
                >
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{task.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor:
                          task.status === 'Done'
                            ? 'var(--status-success-bg)'
                            : task.status === 'In Progress'
                            ? 'var(--accent-subtle)'
                            : 'var(--sunken)',
                        color:
                          task.status === 'Done'
                            ? 'var(--status-success)'
                            : task.status === 'In Progress'
                            ? 'var(--accent)'
                            : 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {task.client && task.client.length > 0 ? task.client.join(', ') : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {task.taskType && task.taskType.length > 0 ? task.taskType.join(', ') : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--accent)',
                      }}
                    >
                      {task.pulseMinutes}m
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {task.dueDate}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {task.url && (
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--text-tertiary)' }}
                        className="hover:text-[var(--accent)]"
                        title="Open page in Notion"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. BOARD (KANBAN) VIEW */}
      {viewMode === 'board' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {columns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col);
            return (
              <div
                key={col}
                style={{
                  backgroundColor: 'var(--sunken)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  minHeight: '400px',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{col}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                        backgroundColor: 'var(--surface)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setNewTaskStatus(col);
                      setIsCreatingModal(true);
                    }}
                    title="Add task to column"
                    style={{ color: 'var(--text-tertiary)', padding: '2px' }}
                    className="hover:text-[var(--text-primary)]"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setPeekTask(task)}
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-hairline)',
                      }}
                      className="hover:border-[var(--accent)]"
                    >
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 5px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--sunken)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {task.client?.[0] || 'TaskPulse'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                            {task.pulseMinutes}m
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. LIST VIEW */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map((task) => (
            <div
              key={task.id}
              onClick={() => setPeekTask(task)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
              className="hover:bg-[var(--sunken)]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: task.status === 'Done' ? 'var(--status-success)' : 'var(--accent)',
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>{task.client?.[0] || 'General'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                  {task.pulseMinutes}m
                </span>
                <span>{task.dueDate}</span>
                {task.url && (
                  <a
                    href={task.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. GALLERY VIEW */}
      {viewMode === 'gallery' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {filtered.map((task) => (
            <div
              key={task.id}
              onClick={() => setPeekTask(task)}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                cursor: 'pointer',
              }}
              className="hover:border-[var(--accent)] hover:shadow-[var(--shadow-floating)]"
            >
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {task.title}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                {(task.tags || []).map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--sunken)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{task.status}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                  {task.pulseMinutes} mins
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}
        >
          <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Notion Daily Task Manager · Scheduled & Logged Pulse Timeline
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
              textAlign: 'center',
            }}
          >
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', padding: '6px 0' }}>
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = (i % 31) + 1;
              const dayTasks = filtered.filter((t) => t.dueDate.includes(String(dayNum).padStart(2, '0')));
              return (
                <div
                  key={i}
                  style={{
                    minHeight: '80px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '4px',
                    backgroundColor: i === 26 ? 'var(--accent-subtle)' : 'transparent',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{dayNum}</div>
                  {dayTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setPeekTask(t)}
                      style={{
                        fontSize: '10px',
                        padding: '2px 4px',
                        borderRadius: '2px',
                        backgroundColor: 'var(--sunken)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE NEW TASK IN NOTION MODAL */}
      {isCreatingModal && (
        <div
          onClick={() => setIsCreatingModal(false)}
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
              maxWidth: '460px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-floating)',
            }}
            className="animate-popover"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Create Notion Daily Task</h3>
              <button onClick={() => setIsCreatingModal(false)} style={{ color: 'var(--text-tertiary)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Task Title (Time Taken)
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. High Fidelity — Siemens (or leave blank to auto-title)"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--sunken)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Client (Live from Notion)
                </label>
                <select
                  value={newTaskClient}
                  onChange={(e) => setNewTaskClient(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--sunken)',
                    fontSize: '13px',
                  }}
                >
                  {['Siemens', 'CoreOpsAI', 'Redington Group', 'JerHigh', 'SafeAir', 'Internal', 'GoaAirport', 'Whizrobot Pitch', 'Honeywell'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Task Type
                </label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--sunken)',
                    fontSize: '13px',
                  }}
                >
                  {['High Fidelity', 'Client Meeting', 'Prototype Walkthrough', 'Design System', 'UI tweak', 'Ideation', 'UX Research', 'Asset handover'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Minutes Duration
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[15, 30, 45, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => setNewTaskMinutes(m)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border)',
                        backgroundColor: newTaskMinutes === m ? 'var(--accent)' : 'var(--sunken)',
                        color: newTaskMinutes === m ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => setIsCreatingModal(false)}
                  style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    fontWeight: 500,
                  }}
                >
                  Create & Sync with Notion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROW PEEK (Side Panel Modal) */}
      {peekTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1000,
          }}
          onClick={() => setPeekTask(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              height: '100%',
              backgroundColor: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--shadow-floating)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
            className="animate-popover"
          >
            {/* Peek Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--status-success)', fontWeight: 600, textTransform: 'uppercase' }}>
                  ● Notion Record
                </span>
                {peekTask.url && (
                  <a
                    href={peekTask.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <span>Open in Notion</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <button
                onClick={() => setPeekTask(null)}
                style={{ padding: '4px', color: 'var(--text-secondary)' }}
                className="hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Peek Content */}
            <div style={{ padding: '24px', flex: 1 }}>
              <input
                type="text"
                value={peekTask.title}
                onChange={(e) => handleUpdateTaskField(peekTask.id, 'title', e.target.value)}
                style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  marginBottom: '20px',
                }}
              />

              {/* Peek Properties */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '120px', color: 'var(--text-tertiary)' }}>Status</span>
                  <select
                    value={peekTask.status}
                    onChange={(e) => handleUpdateTaskField(peekTask.id, 'status', e.target.value)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--sunken)',
                      fontSize: '12px',
                    }}
                  >
                    <option value="Backlog">Backlog / Not started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '120px', color: 'var(--text-tertiary)' }}>Client (Notion)</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {peekTask.client && peekTask.client.length > 0 ? peekTask.client.join(', ') : '—'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '120px', color: 'var(--text-tertiary)' }}>Task Type</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {peekTask.taskType && peekTask.taskType.length > 0 ? peekTask.taskType.join(', ') : '—'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '120px', color: 'var(--text-tertiary)' }}>Minutes Duration</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                    {peekTask.pulseMinutes} mins
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '120px', color: 'var(--text-tertiary)' }}>Date Created</span>
                  <span>{peekTask.dueDate}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Notes & Details
                </div>
                <textarea
                  rows={6}
                  value={peekTask.notes || ''}
                  onChange={(e) => handleUpdateTaskField(peekTask.id, 'notes', e.target.value)}
                  placeholder="Add notes, specifications, or Notion field mappings..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--sunken)',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
