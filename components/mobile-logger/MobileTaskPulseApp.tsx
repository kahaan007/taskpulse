'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles,
  Palette,
  Eye,
  Users,
  Search,
  Code,
  Briefcase,
  Cpu,
  Video,
  Image,
  Layout,
  Layers,
  Compass,
  Wifi,
  Battery,
  Signal,
  Smartphone,
  Monitor,
  Zap,
} from 'lucide-react';
import { Client, Project, TaskType, TaskLogEntry, ActiveSegment, QuickPreset } from './types';
import { SEED_CLIENTS, SEED_PROJECTS, TASK_TYPES, INITIAL_TODAY_LOGS, QUICK_PRESETS } from './data';
import { ProgressRing } from './ProgressRing';
import { SegmentedControl } from './SegmentedControl';
import { SelectSheet, SelectSheetItem } from './SelectSheet';
import { TimePickerChips } from './TimePickerChips';
import { SubmitBar } from './SubmitBar';
import { TodayLogView } from './TodayLogView';

interface MobileTaskPulseAppProps {
  onSwitchToWorkspace?: () => void;
}

export const MobileTaskPulseApp: React.FC<MobileTaskPulseAppProps> = ({ onSwitchToWorkspace }) => {
  // Navigation segment state (persisted across sessions)
  const [activeSegment, setActiveSegment] = useState<ActiveSegment>('submit');

  // Form states
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<string>('tt-high-fi');
  const [durationMin, setDurationMin] = useState<number>(15);
  const [description, setDescription] = useState<string>('');

  // Dropdown bottom sheets
  const [clientSheetOpen, setClientSheetOpen] = useState(false);
  const [projectSheetOpen, setProjectSheetOpen] = useState(false);
  const [taskTypeSheetOpen, setTaskTypeSheetOpen] = useState(false);

  // Recents tracking (last 3 used)
  const [recentClientIds, setRecentClientIds] = useState<string[]>(['c-siemens', 'c-coreops', 'c-safeair']);
  const [recentTaskTypeIds, setRecentTaskTypeIds] = useState<string[]>(['tt-high-fi', 'tt-client-meeting', 'tt-design-system']);

  // Logged tasks list (initialized with initial today's entries)
  const [logs, setLogs] = useState<TaskLogEntry[]>(INITIAL_TODAY_LOGS);

  // Animation & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessMorph, setIsSuccessMorph] = useState(false);
  const [countBouncing, setCountBouncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; undoAction?: () => void } | null>(null);
  const [shakingField, setShakingField] = useState<string | null>(null);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  // Mobile-First Presentation Modes
  const [deviceMode, setDeviceMode] = useState<'bezel' | 'fluid'>('bezel');
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('9:41');

  useEffect(() => {
    const check = () => setIsMobileScreen(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyPreset = (preset: QuickPreset) => {
    setSelectedClientId(preset.clientId);
    setSelectedProjectId(preset.projectId);
    setSelectedTaskTypeId(preset.taskTypeId);
    setDurationMin(preset.durationMin);
    setDescription(preset.description);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
    setToastMessage({
      text: `Preset applied: ${preset.label}`,
    });
  };

  // Refs for auto-scroll and focus
  const clientFieldRef = useRef<HTMLDivElement>(null);
  const projectFieldRef = useRef<HTMLDivElement>(null);
  const taskTypeFieldRef = useRef<HTMLDivElement>(null);
  const durationFieldRef = useRef<HTMLDivElement>(null);
  const descFieldRef = useRef<HTMLTextAreaElement>(null);

  // 1. DRAFT PERSISTENCE (LocalStorage)
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('taskpulse_mobile_draft');
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.clientId) setSelectedClientId(d.clientId);
        if (d.projectId) setSelectedProjectId(d.projectId);
        if (d.taskTypeId) setSelectedTaskTypeId(d.taskTypeId);
        if (d.durationMin) setDurationMin(d.durationMin);
        if (d.description) setDescription(d.description);
      }
      const savedSeg = localStorage.getItem('taskpulse_active_seg');
      if (savedSeg === 'log' || savedSeg === 'submit') {
        setActiveSegment(savedSeg as ActiveSegment);
      }
    } catch (_) {}
    setHasLoadedDraft(true);
  }, []);

  // Save draft on edit
  useEffect(() => {
    if (!hasLoadedDraft) return;
    try {
      const draft = {
        clientId: selectedClientId,
        projectId: selectedProjectId,
        taskTypeId: selectedTaskTypeId,
        durationMin,
        description,
      };
      localStorage.setItem('taskpulse_mobile_draft', JSON.stringify(draft));
      localStorage.setItem('taskpulse_active_seg', activeSegment);
    } catch (_) {}
  }, [selectedClientId, selectedProjectId, selectedTaskTypeId, durationMin, description, activeSegment, hasLoadedDraft]);

  // Toast timer
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 5000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Derived Objects
  const selectedClient = useMemo(
    () => SEED_CLIENTS.find((c) => c.id === selectedClientId),
    [selectedClientId]
  );

  const availableProjects = useMemo(() => {
    if (!selectedClientId) return [];
    return SEED_PROJECTS.filter((p) => p.clientId === selectedClientId && p.active);
  }, [selectedClientId]);

  const selectedProject = useMemo(
    () => availableProjects.find((p) => p.id === selectedProjectId),
    [availableProjects, selectedProjectId]
  );

  const selectedTaskType = useMemo(
    () => TASK_TYPES.find((t) => t.id === selectedTaskTypeId),
    [selectedTaskTypeId]
  );

  // Auto-select project if only one exists for this client
  useEffect(() => {
    if (availableProjects.length === 1 && selectedProjectId !== availableProjects[0].id) {
      setSelectedProjectId(availableProjects[0].id);
    }
  }, [availableProjects, selectedProjectId]);

  // Validation Checks
  const isClientValid = Boolean(selectedClientId);
  const isProjectValid = Boolean(selectedProjectId);
  const isTaskTypeValid = Boolean(selectedTaskTypeId);
  const isDurationValid = durationMin >= 15;
  const isDescValid = description.trim().length >= 10;

  const completedCount = [isClientValid, isProjectValid, isTaskTypeValid, isDurationValid, isDescValid].filter(Boolean).length;
  const isFormValid = completedCount === 5;

  // Dynamic missing field message for SubmitBar
  const missingFieldMessage = useMemo(() => {
    if (!isClientValid) return 'Select a client';
    if (!isProjectValid) return 'Select a project';
    if (!isTaskTypeValid) return 'Select task type';
    if (!isDurationValid) return 'Select duration';
    if (!isDescValid) return 'Add description (min 10 chars)';
    return null;
  }, [isClientValid, isProjectValid, isTaskTypeValid, isDurationValid, isDescValid]);

  // Gentle shake and scroll to first incomplete field
  const handleShakeFirstIncomplete = () => {
    let target = '';
    if (!isClientValid) {
      target = 'client';
      clientFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!isProjectValid) {
      target = 'project';
      projectFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!isTaskTypeValid) {
      target = 'taskType';
      taskTypeFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!isDurationValid) {
      target = 'duration';
      durationFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!isDescValid) {
      target = 'description';
      descFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      descFieldRef.current?.focus();
    }

    setShakingField(target);
    setTimeout(() => setShakingField(null), 300);
  };

  // 2. SUBMIT MOMENT (Under 15 seconds)
  const handleSubmitTask = async () => {
    if (!isFormValid || !selectedClient || !selectedProject) return;

    setIsSubmitting(true);
    const chosenType = TASK_TYPES.find((t) => t.id === selectedTaskTypeId) || TASK_TYPES[0];

    const newEntry: TaskLogEntry = {
      id: `log-${Date.now()}`,
      clientId: selectedClient.id,
      projectId: selectedProject.id,
      clientName: selectedClient.name,
      projectName: selectedProject.name,
      taskTypeId: chosenType.id,
      taskTypeLabel: chosenType.label,
      taskTypeIcon: chosenType.iconName || 'Palette',
      durationMin,
      description: description.trim(),
      loggedAt: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };

    // Optimistically update list
    setLogs([newEntry, ...logs]);

    // Update Recents list
    setRecentClientIds((prev) => [selectedClient.id, ...prev.filter((id) => id !== selectedClient.id)].slice(0, 3));
    setRecentTaskTypeIds((prev) => [chosenType.id, ...prev.filter((id) => id !== chosenType.id)].slice(0, 3));

    // Success morph animation (300ms)
    setIsSubmitting(false);
    setIsSuccessMorph(true);
    setCountBouncing(true);

    // Write directly to the live Notion Daily Task Manager database!
    try {
      await fetch('/api/notion/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${chosenType.label} — ${selectedClient.name}`,
          client: [selectedClient.name],
          taskType: [chosenType.label],
          pulseMinutes: durationMin,
          status: 'In Progress',
        }),
      });
    } catch (e) {
      console.warn('Saved offline in IndexedDB:', e);
    }

    // Reset form after morph, leaving Client and Task type pre-selected as "Same as last"
    setTimeout(() => {
      setIsSuccessMorph(false);
      setCountBouncing(false);
      setDescription(''); // reset description

      // Show Undo Toast
      setToastMessage({
        text: `Logged ${durationMin}m to Notion (${selectedClient.name})`,
        undoAction: () => {
          setLogs((prev) => prev.filter((l) => l.id !== newEntry.id));
        },
      });

      // Clear description from localStorage
      try {
        localStorage.removeItem('taskpulse_mobile_draft');
      } catch (_) {}
    }, 450);
  };

  const getTaskIcon = (iconName?: string, size = 15) => {
    switch (iconName) {
      case 'Palette':
        return <Palette size={size} />;
      case 'Eye':
        return <Eye size={size} />;
      case 'Users':
        return <Users size={size} />;
      case 'Search':
        return <Search size={size} />;
      case 'Code':
        return <Code size={size} />;
      case 'Cpu':
        return <Cpu size={size} />;
      case 'Sparkles':
        return <Sparkles size={size} />;
      case 'Video':
        return <Video size={size} />;
      case 'Image':
        return <Image size={size} />;
      case 'Layout':
        return <Layout size={size} />;
      case 'Layers':
        return <Layers size={size} />;
      case 'Compass':
        return <Compass size={size} />;
      default:
        return <Briefcase size={size} />;
    }
  };

  // Formatted date string for top bar
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: !isMobileScreen && deviceMode === 'bezel' ? 'var(--sunken)' : 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: !isMobileScreen && deviceMode === 'bezel' ? '12px 16px 24px' : '0',
      }}
    >
      <style>{`
        @keyframes gentleShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
        }
        .shake-field {
          animation: gentleShake 220ms ease;
          border-color: var(--accent) !important;
        }
      `}</style>

      {/* Floating Toolbar on Desktop Viewports */}
      {!isMobileScreen && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px',
            userSelect: 'none',
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px',
              borderRadius: '100px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-floating)',
            }}
          >
            <button
              type="button"
              onClick={() => setDeviceMode('bezel')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: deviceMode === 'bezel' ? 'var(--text-primary)' : 'transparent',
                color: deviceMode === 'bezel' ? 'var(--bg)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Smartphone size={13} />
              <span>iPhone Bezel</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode('fluid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: deviceMode === 'fluid' ? 'var(--text-primary)' : 'transparent',
                color: deviceMode === 'fluid' ? 'var(--bg)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Monitor size={13} />
              <span>Fluid Mobile</span>
            </button>

            {onSwitchToWorkspace && (
              <button
                type="button"
                onClick={onSwitchToWorkspace}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                }}
              >
                <span>Full Workspace ↗</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Mobile App Chassis Container */}
      <div
        style={
          !isMobileScreen && deviceMode === 'bezel'
            ? {
                width: '390px',
                height: 'min(844px, calc(100vh - 80px))',
                borderRadius: '50px',
                border: '11px solid #1c1c1a',
                boxShadow: '0 32px 80px -20px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
                backgroundColor: 'var(--bg)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
              }
            : {
                width: '100%',
                maxWidth: '480px',
                margin: '0 auto',
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--bg)',
                boxShadow: '0 0 40px rgba(0, 0, 0, 0.03)',
                position: 'relative',
              }
        }
      >
        {/* 1. STICKY FIXED TOP DECK (Status Bar + App Header + Segmented Control) */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            flexShrink: 0,
            width: '100%',
          }}
        >
          {/* 1a. Native Mobile Status Bar */}
          <div
            style={{
              height: '46px',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--surface)',
              userSelect: 'none',
              flexShrink: 0,
              borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.03))',
            }}
          >
            {/* Time */}
            <div style={{ width: '64px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                {currentTimeStr}
              </span>
            </div>

            {/* Dynamic Island */}
            <div
              style={{
                height: '26px',
                padding: '0 10px',
                borderRadius: '20px',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '10px',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                transition: 'all 240ms ease',
                minWidth: isSubmitting ? '160px' : isSuccessMorph ? '130px' : '96px',
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent)', animation: 'pulse 1s infinite' }} />
                  <span style={{ color: '#E4E2DC' }}>Syncing Notion...</span>
                </>
              ) : isSuccessMorph ? (
                <>
                  <Check size={11} color="var(--accent)" strokeWidth={3} />
                  <span style={{ color: '#E4E2DC' }}>Notion Saved</span>
                </>
              ) : (
                <>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#2E7D32' }} />
                  <span style={{ color: '#8E8C85', letterSpacing: '0.04em' }}>NOTION LIVE</span>
                </>
              )}
            </div>

            {/* Icons: Signal, 5G, Battery */}
            <div style={{ width: '64px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', color: 'var(--text-primary)' }}>
              <Signal size={12} strokeWidth={2.4} />
              <Wifi size={12} strokeWidth={2.4} />
              <Battery size={15} strokeWidth={2} />
            </div>
          </div>

          {/* 1b. App Header */}
          <header
            style={{
              height: '46px',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--surface)',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                }}
              />
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                TaskPulse
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                · {formattedDate}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onSwitchToWorkspace && (
                <button
                  onClick={onSwitchToWorkspace}
                  title="View full workspace documentation"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    padding: '3px 7px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--sunken)',
                    cursor: 'pointer',
                  }}
                >
                  Docs ↗
                </button>
              )}

              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Dieter K."
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </header>

          {/* 1c. Segmented Control (Sticky Fixed) */}
          <SegmentedControl
            activeSegment={activeSegment}
            onChangeSegment={setActiveSegment}
            todayCount={logs.length}
            countBouncing={countBouncing}
          />
        </div>

        {/* 4. SCROLLABLE CONTENT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* ===================== SEGMENT 1: SUBMIT TASK ===================== */}
          {activeSegment === 'submit' && (
            <div style={{ padding: '16px 16px 110px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Progress Ring Header Nudge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Active 15-Minute Slot
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    Notion Daily Task Manager Sync
                  </div>
                </div>
                <ProgressRing completed={completedCount} total={5} />
              </div>

              {/* ⚡ ONE-TAP SPEED PRESETS (Mobile-first ergonomics under 15 seconds) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
                    ⚡ 1-Tap Speed Presets
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>
                    Fast Fill
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {QUICK_PRESETS.map((p) => {
                    const isSelected =
                      selectedClientId === p.clientId &&
                      selectedTaskTypeId === p.taskTypeId &&
                      durationMin === p.durationMin;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        style={{
                          flexShrink: 0,
                          padding: '7px 11px',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                          backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--surface)',
                          color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: isSelected ? 600 : 500,
                          cursor: 'pointer',
                        }}
                        className="touch-target active:scale-[0.97]"
                      >
                        <span>{p.emoji}</span>
                        <span>{p.label}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? 'var(--accent)' : 'var(--sunken)',
                            color: isSelected ? '#FFFFFF' : 'var(--text-tertiary)',
                          }}
                        >
                          {p.durationMin}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FIELD 1: CLIENT (Searchable dropdown bottom sheet) */}
              <div ref={clientFieldRef}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
                    Client
                  </span>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                </div>

                <button
                  type="button"
                  onClick={() => setClientSheetOpen(true)}
                  style={{
                    width: '100%',
                    minHeight: '52px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isClientValid ? '1px solid var(--border)' : '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                  className={`touch-target ${shakingField === 'client' ? 'shake-field' : ''}`}
                >
                  {selectedClient ? (
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {selectedClient.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                        {selectedClient.code} · {selectedClient.industry}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '16px', color: 'var(--text-tertiary)' }}>
                      Select a client...
                    </span>
                  )}
                  <ChevronDown size={16} color="var(--text-tertiary)" />
                </button>
              </div>

              {/* FIELD 2: PROJECT (Dependent on Client) */}
              <div ref={projectFieldRef}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
                    Project
                  </span>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                </div>

                <button
                  type="button"
                  disabled={!selectedClientId}
                  onClick={() => selectedClientId && setProjectSheetOpen(true)}
                  style={{
                    width: '100%',
                    minHeight: '52px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isProjectValid ? '1px solid var(--border)' : '1px solid var(--border)',
                    backgroundColor: !selectedClientId ? 'var(--sunken)' : 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    opacity: !selectedClientId ? 0.6 : 1,
                  }}
                  className={`touch-target ${shakingField === 'project' ? 'shake-field' : ''}`}
                >
                  {!selectedClientId ? (
                    <span style={{ fontSize: '16px', color: 'var(--text-tertiary)' }}>
                      Select a client first
                    </span>
                  ) : selectedProject ? (
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedProject.name}
                    </span>
                  ) : (
                    <span style={{ fontSize: '16px', color: 'var(--text-tertiary)' }}>
                      Select project ({availableProjects.length} active)...
                    </span>
                  )}
                  <ChevronDown size={16} color="var(--text-tertiary)" />
                </button>
              </div>

              {/* FIELD 3: TASK TYPE (Searchable dropdown bottom sheet with all 36 items) */}
              <div ref={taskTypeFieldRef}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
                    Task Type
                  </span>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                </div>

                <button
                  type="button"
                  onClick={() => setTaskTypeSheetOpen(true)}
                  style={{
                    width: '100%',
                    minHeight: '52px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                  className={`touch-target ${shakingField === 'taskType' ? 'shake-field' : ''}`}
                >
                  {selectedTaskType ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--accent-subtle)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {getTaskIcon(selectedTaskType.iconName, 16)}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {selectedTaskType.label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                          {selectedTaskType.category || 'Notion Work Item'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '16px', color: 'var(--text-tertiary)' }}>
                      Select task type ({TASK_TYPES.length} available)...
                    </span>
                  )}
                  <ChevronDown size={16} color="var(--text-tertiary)" />
                </button>
              </div>

              {/* FIELD 4: TIME SPENT (Quick Chips + Stepper) */}
              <div ref={durationFieldRef} className={shakingField === 'duration' ? 'shake-field' : ''}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
                    Time Spent
                  </span>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                </div>

                <TimePickerChips valueMin={durationMin} onChangeMin={setDurationMin} />
              </div>

              {/* FIELD 5: WHAT DID YOU DO? (Textarea min 10 chars) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
                      What did you do?
                    </span>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                  </div>

                  {/* Live Counter (Only appears when under minimum 10) */}
                  {description.trim().length < 10 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: description.length > 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                        fontWeight: 600,
                      }}
                    >
                      {description.trim().length}/10 min
                    </span>
                  )}
                </div>

                <textarea
                  ref={descFieldRef}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail your work (e.g. Conducted telemetry WCAG review and calibrated detent damping factor)..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    fontSize: '16px', // 16px strictly prevents iOS zoom
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                    outline: 'none',
                    resize: 'none',
                  }}
                  className={shakingField === 'description' ? 'shake-field' : ''}
                />
              </div>
            </div>
          )}

          {/* ===================== SEGMENT 2: TODAY'S LOG ===================== */}
          {activeSegment === 'log' && (
            <TodayLogView
              logs={logs}
              onDeleteLog={(id) => {
                const deleted = logs.find((l) => l.id === id);
                setLogs((prev) => prev.filter((l) => l.id !== id));
                if (deleted) {
                  setToastMessage({
                    text: `Removed "${deleted.projectName}"`,
                    undoAction: () => setLogs((prev) => [deleted, ...prev]),
                  });
                }
              }}
              onEditLog={(updated) => {
                setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
                setToastMessage({ text: 'Updated entry in Notion' });
              }}
              onSwitchToSubmit={() => setActiveSegment('submit')}
            />
          )}
        </div>

        {/* 4. PINNED SUBMIT BAR (Only on Submit segment) */}
        {activeSegment === 'submit' && (
          <SubmitBar
            isValid={isFormValid}
            missingFieldLabel={missingFieldMessage}
            onDisabledTap={handleShakeFirstIncomplete}
            onSubmit={handleSubmitTask}
            isSubmitting={isSubmitting}
            isSuccessMorph={isSuccessMorph}
          />
        )}

        {/* 5. NATIVE iOS HOME INDICATOR BAR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '8px 0 6px',
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '134px',
              height: '5px',
              borderRadius: '100px',
              backgroundColor: 'var(--text-primary)',
              opacity: 0.25,
            }}
          />
        </div>

        {/* 5. CLIENT SELECTION SHEET */}
        <SelectSheet
          isOpen={clientSheetOpen}
          onClose={() => setClientSheetOpen(false)}
          title="Select Client"
          items={SEED_CLIENTS.map((c) => ({
            id: c.id,
            name: c.name,
            subtitle: c.industry,
            badge: c.code,
          }))}
          selectedId={selectedClientId}
          recentIds={recentClientIds}
          onSelect={(item) => {
            setSelectedClientId(item.id);
            setSelectedProjectId(''); // Reset dependent project
          }}
        />

        {/* 6. PROJECT SELECTION SHEET (Dependent on Client) */}
        <SelectSheet
          isOpen={projectSheetOpen}
          onClose={() => setProjectSheetOpen(false)}
          title={selectedClient ? `${selectedClient.name} Projects` : 'Select Project'}
          items={availableProjects.map((p) => ({
            id: p.id,
            name: p.name,
            subtitle: 'Active Project',
          }))}
          selectedId={selectedProjectId}
          onSelect={(item) => setSelectedProjectId(item.id)}
        />

        {/* 7. TASK TYPE SELECTION SHEET (All 36 Notion Task Types) */}
        <SelectSheet
          isOpen={taskTypeSheetOpen}
          onClose={() => setTaskTypeSheetOpen(false)}
          title="Select Task Type"
          items={TASK_TYPES.map((t) => ({
            id: t.id,
            name: t.label,
            subtitle: t.category,
            badge: t.color && t.color !== 'default' ? t.color : undefined,
            icon: getTaskIcon(t.iconName, 15),
          }))}
          selectedId={selectedTaskTypeId}
          recentIds={recentTaskTypeIds}
          onSelect={(item) => setSelectedTaskTypeId(item.id)}
        />

        {/* 8. TOAST NOTIFICATION WITH UNDO (5s) */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: activeSegment === 'submit' ? '84px' : 'calc(24px + env(safe-area-inset-bottom, 0px))',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 32px)',
              maxWidth: '448px',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-floating)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              zIndex: 1000,
            }}
            className="animate-popover"
          >
            <span>{toastMessage.text}</span>
            {toastMessage.undoAction && (
              <button
                type="button"
                onClick={() => {
                  toastMessage.undoAction?.();
                  setToastMessage(null);
                }}
                style={{
                  color: 'var(--accent)',
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '2px 6px',
                }}
              >
                Undo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
