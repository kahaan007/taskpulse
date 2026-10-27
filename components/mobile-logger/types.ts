export interface Client {
  id: string;
  name: string;
  code: string;
  industry: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  active: boolean;
}

export interface TaskType {
  id: string;
  label: string;
  iconName?: string;
  category?: string;
  color?: string;
}

export interface TaskLogEntry {
  id: string;
  clientId: string;
  projectId: string;
  clientName: string;
  projectName: string;
  taskTypeId: string;
  taskTypeLabel: string;
  taskTypeIcon: string;
  durationMin: number;
  description: string;
  loggedAt: string; // ISO or display timestamp
  url?: string;
}

export interface FormDraft {
  clientId: string;
  projectId: string;
  taskTypeId: string;
  durationMin: number;
  description: string;
}

export interface QuickPreset {
  id: string;
  emoji: string;
  label: string;
  clientId: string;
  projectId: string;
  taskTypeId: string;
  durationMin: number;
  description: string;
}

export type ActiveSegment = 'submit' | 'log';
