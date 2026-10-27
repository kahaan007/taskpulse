export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'todo'
  | 'bullet'
  | 'number'
  | 'toggle'
  | 'quote'
  | 'callout'
  | 'code'
  | 'divider'
  | 'image'
  | 'table'
  | 'embed';

export interface BlockItem {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // for todo
  isOpen?: boolean; // for toggle
  language?: string; // for code
  caption?: string; // for image
  imageUrl?: string;
  tableData?: string[][]; // for table: rows of cell strings
  calloutIcon?: string;
}

export interface WorkspacePage {
  id: string;
  title: string;
  icon: string;
  cover?: string;
  parentId?: string | null;
  isFavorite?: boolean;
  isTrash?: boolean;
  updatedAt: string;
  createdAt: string;
  author: {
    name: string;
    avatar: string;
  };
  properties: {
    status?: 'Backlog' | 'In Progress' | 'In Review' | 'Done';
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
    category?: string;
    pulseMinutes?: number;
    dueDate?: string;
    tags?: string[];
  };
  blocks: BlockItem[];
}

export type DatabaseViewMode = 'table' | 'board' | 'list' | 'gallery' | 'calendar';

export interface TaskRecord {
  id: string;
  title: string;
  status: 'Backlog' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  pulseMinutes: number; // Duration in Notion Daily Task Pulse ("Minutes")
  category: string; // e.g. Client or Task Type from Notion
  tags: string[];
  cover?: string;
  notes?: string;
  url?: string; // Real Notion page URL
  client?: string[]; // Notion "Client " multi-select
  taskType?: string[]; // Notion "Task type" multi-select
  goal?: string[]; // Notion "Broad Goal" multi-select
  notionSynced?: boolean;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Guest';
  avatar: string;
  lastActive: string;
}

export interface CommentItem {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  resolved?: boolean;
}

export type RightPanelTab = 'comments' | 'info' | 'ai' | 'pulse';
export type ScreenState = 'normal' | 'loading' | 'empty' | 'error';
export type MainViewType = 'home' | 'page' | 'database' | 'settings' | 'trash';
