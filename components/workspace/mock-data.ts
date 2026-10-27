import { WorkspacePage, TaskRecord, WorkspaceMember, CommentItem } from './types';

export const initialPages: WorkspacePage[] = [
  {
    id: 'page-braun-spec',
    title: 'Braun Audio 1 Physical Instrument Spec',
    icon: '📻',
    cover: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=1600&q=80',
    parentId: null,
    isFavorite: true,
    isTrash: false,
    createdAt: '2026-10-24T09:30:00Z',
    updatedAt: 'Just now',
    author: {
      name: 'Dieter K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    properties: {
      status: 'In Progress',
      priority: 'High',
      category: 'Hardware UI',
      pulseMinutes: 90,
      dueDate: 'Nov 14, 2026',
      tags: ['Acoustics', 'CNC Aluminum', 'Rotary Encoder', 'Braun'],
    },
    blocks: [
      {
        id: 'b-1',
        type: 'callout',
        calloutIcon: '💡',
        content: '“Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects, and the products are not burdened with non-essentials.” — Dieter Rams',
      },
      {
        id: 'b-2',
        type: 'heading1',
        content: 'Design Intent and Physical Tactility',
      },
      {
        id: 'b-3',
        type: 'paragraph',
        content: 'The Braun Audio 1 represents a modern manifestation of utilitarian industrial design. Every interaction should produce an immediate, unambiguous sensory confirmation. Controls must rest quietly until invoked by the user, providing zero cognitive fatigue.',
      },
      {
        id: 'b-4',
        type: 'heading2',
        content: 'Core Engineering Requirements',
      },
      {
        id: 'b-5',
        type: 'todo',
        content: 'Calibrate haptic stepping motor to 1.8° detent resistance',
        checked: true,
      },
      {
        id: 'b-6',
        type: 'todo',
        content: 'Anodize matte casing to match Braun #EFEEEA warm neutral sunken alloy',
        checked: true,
      },
      {
        id: 'b-7',
        type: 'todo',
        content: 'Implement 15-minute silent slot pulse sync over WebSocket bus',
        checked: false,
      },
      {
        id: 'b-8',
        type: 'todo',
        content: 'Measure WCAG 2.2 contrast compliance on monochrome OLED display panel',
        checked: false,
      },
      {
        id: 'b-9',
        type: 'heading2',
        content: 'Rotary Frequency Filtering DSP',
      },
      {
        id: 'b-10',
        type: 'code',
        language: 'typescript',
        content: `// Braun Digital Bi-quad Filter Kernel
export function calculateBiquadCoefficient(frequency: number, sampleRate: number): Float32Array {
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const alpha = Math.sin(omega) / (2 * 0.7071); // Q-factor 1/sqrt(2)
  const cosW = Math.cos(omega);
  
  const b0 = (1 - cosW) / 2;
  const b1 = 1 - cosW;
  const b2 = (1 - cosW) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cosW;
  const a2 = 1 - alpha;
  
  return new Float32Array([b0/a0, b1/a0, b2/a0, a1/a0, a2/a0]);
}`,
      },
      {
        id: 'b-11',
        type: 'quote',
        content: 'Order is not the absence of complexity; it is the presence of disciplined structure and absolute intent.',
      },
      {
        id: 'b-12',
        type: 'toggle',
        isOpen: true,
        content: 'Acoustic Chamber Tolerances & Material Stack',
      },
      {
        id: 'b-13',
        type: 'table',
        content: 'Component Specifications',
        tableData: [
          ['Component', 'Material / Finish', 'Tolerance (mm)', 'Target Mass'],
          ['Front Baffle', 'Extruded 6063 Aluminum', '± 0.05 mm', '340g'],
          ['Rotary Dial', 'Solid CNC Brass with Nickel', '± 0.02 mm', '82g'],
          ['Display Lens', 'Gorilla Glass 5 with AR', '± 0.03 mm', '45g'],
          ['Chassis Base', 'Damped Magnesium-Zinc', '± 0.10 mm', '610g'],
        ],
      },
      {
        id: 'b-14',
        type: 'divider',
        content: '',
      },
      {
        id: 'b-15',
        type: 'embed',
        content: 'TaskPulse Daily Interval Logger Widget',
      },
    ],
  },
  {
    id: 'page-design-principles',
    title: 'Ten Principles for Calm Software',
    icon: '📐',
    parentId: null,
    isFavorite: true,
    isTrash: false,
    createdAt: '2026-10-20T11:00:00Z',
    updatedAt: '2 days ago',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
    properties: {
      status: 'Done',
      priority: 'Medium',
      category: 'Design System',
      pulseMinutes: 45,
      dueDate: 'Nov 01, 2026',
      tags: ['Manifesto', 'Design System', 'Philosophy'],
    },
    blocks: [
      {
        id: 'dp-1',
        type: 'callout',
        calloutIcon: '🏛️',
        content: 'A system should be designed with the quiet precision of an architect’s drafting table: unhurried, rigorous, and enduring.',
      },
      {
        id: 'dp-2',
        type: 'heading1',
        content: 'Software as an Honest Tool',
      },
      {
        id: 'dp-3',
        type: 'paragraph',
        content: 'Software should not manipulate attention or employ artificial scarcity. We build tools that empower contemplation and deep craftsmanship.',
      },
      {
        id: 'dp-4',
        type: 'bullet',
        content: '1. Is innovative without novelty for novelty’s sake.',
      },
      {
        id: 'dp-5',
        type: 'bullet',
        content: '2. Makes a product useful while preserving mental clarity.',
      },
      {
        id: 'dp-6',
        type: 'bullet',
        content: '3. Is aesthetic through proportional balance and typographic discipline.',
      },
      {
        id: 'dp-7',
        type: 'bullet',
        content: '4. Is unobtrusive: neutral canvases that step aside for user thought.',
      },
    ],
  },
  {
    id: 'page-q4-roadmap',
    title: 'Q4 Product and Platform Architecture',
    icon: '⚡',
    parentId: null,
    isFavorite: false,
    isTrash: false,
    createdAt: '2026-10-18T14:15:00Z',
    updatedAt: 'Yesterday',
    author: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    properties: {
      status: 'In Progress',
      priority: 'Urgent',
      category: 'Architecture',
      pulseMinutes: 120,
      dueDate: 'Dec 15, 2026',
      tags: ['Infra', 'Offline First', 'IndexedDB'],
    },
    blocks: [
      {
        id: 'rm-1',
        type: 'heading1',
        content: 'Offline Sync Engine & Conflict Resolution',
      },
      {
        id: 'rm-2',
        type: 'paragraph',
        content: 'Building zero-latency local caching using IndexedDB with idempotent UUID transactions sent to the Notion Daily Task Manager API.',
      },
      {
        id: 'rm-3',
        type: 'todo',
        content: 'Benchmark IndexedDB read-throughput under 10,000 blocks',
        checked: true,
      },
      {
        id: 'rm-4',
        type: 'todo',
        content: 'Verify VAPID push payload encryption on iOS 18 Safari PWA',
        checked: false,
      },
    ],
  },
  {
    id: 'page-siemens-spec',
    title: 'High Fidelity — Siemens',
    icon: '⚡',
    parentId: null,
    isFavorite: true,
    isTrash: false,
    createdAt: '2026-10-27T01:00:00.000+05:30',
    updatedAt: 'Synced from Notion',
    author: {
      name: 'Dieter K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    properties: {
      status: 'In Progress',
      priority: 'Medium',
      category: 'Siemens',
      pulseMinutes: 15,
      dueDate: 'Oct 27, 2026',
      tags: ['Siemens', 'High Fidelity', 'Website Revamp'],
    },
    blocks: [
      {
        id: 'si-1',
        type: 'callout',
        calloutIcon: '⚡',
        content: 'Active Notion Daily Task Manager Record (Data Source: 884cfc0c-ee75-82ea-bfe3-87095464a681). Client: Siemens · Goal: Website Revamp.',
      },
      {
        id: 'si-2',
        type: 'heading1',
        content: 'Siemens Industrial Automation Interface',
      },
      {
        id: 'si-3',
        type: 'paragraph',
        content: 'Translating Dieter Rams aesthetic into high-density Siemens telemetry displays. All metrics maintain high contrast and instant detent response.',
      },
      {
        id: 'si-4',
        type: 'todo',
        content: 'Audit Siemens telemetry cards for WCAG 2.2 contrast compliance',
        checked: true,
      },
      {
        id: 'si-5',
        type: 'todo',
        content: 'Map 15-minute slot pulse interval to Siemens Website Revamp goal',
        checked: true,
      },
      {
        id: 'si-6',
        type: 'embed',
        content: 'TaskPulse Daily Interval Logger Widget',
      },
    ],
  },
  {
    id: 'page-design-tokens',
    title: 'Braun Design Tokens & Semantic Variables',
    icon: '🎨',
    parentId: null,
    isFavorite: false,
    isTrash: false,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '3 days ago',
    author: {
      name: 'Dieter K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    properties: {
      status: 'Done',
      priority: 'Low',
      category: 'Design System',
      pulseMinutes: 30,
      dueDate: 'Oct 30, 2026',
      tags: ['Tokens', 'CSS Variables', 'Accessibility'],
    },
    blocks: [
      {
        id: 'dt-1',
        type: 'heading1',
        content: 'Color and Contrast Rationale',
      },
      {
        id: 'dt-2',
        type: 'paragraph',
        content: 'We use warm off-white #F7F6F3 for light mode and low-glare #141413 for dark mode. Only one signal accent (#E8590C) is permitted across the entire interface.',
      },
    ],
  },
];

export const initialTasks: TaskRecord[] = [
  {
    id: 'task-101',
    title: 'Refactor Rotary Slider Detent Feedback Curve',
    status: 'In Progress',
    priority: 'Urgent',
    assignee: {
      name: 'Dieter K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    dueDate: 'Oct 29, 2026',
    pulseMinutes: 45,
    category: 'Hardware UI',
    tags: ['Firmware', 'Detent', 'Haptics'],
    cover: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=600&q=80',
    notes: 'The angular momentum damping feels slightly too loose at 30rpm. Need to adjust friction factor to 0.42.',
  },
  {
    id: 'task-102',
    title: 'Notion Daily Task Manager Schema Migration',
    status: 'In Progress',
    priority: 'High',
    assignee: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    dueDate: 'Nov 02, 2026',
    pulseMinutes: 60,
    category: 'Architecture',
    tags: ['Notion API', 'Database', 'Sync'],
    cover: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    notes: 'Adding relation column for Design Spec linkage and automatic assignee resolution from user id.',
  },
  {
    id: 'task-103',
    title: 'Newsreader Typography Modular Scale Verification',
    status: 'Done',
    priority: 'Medium',
    assignee: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
    dueDate: 'Oct 26, 2026',
    pulseMinutes: 30,
    category: 'Design System',
    tags: ['Typography', 'Editorial', 'Scale'],
    cover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    notes: 'Modular scale strictly verified: 12 / 13 / 14 / 16 / 20 / 28 / 40. Optical vertical metrics aligned perfectly.',
  },
  {
    id: 'task-104',
    title: 'Command Palette Fuzzy Match & Keyboard Traversal',
    status: 'Done',
    priority: 'High',
    assignee: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    dueDate: 'Oct 27, 2026',
    pulseMinutes: 45,
    category: 'Design System',
    tags: ['Cmd+K', 'Accessibility', 'Keyboard'],
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    notes: 'Accessible combobox with ARIA active descendant and instant keystroke filtering implemented.',
  },
  {
    id: 'task-105',
    title: 'Mobile Bottom Sheet Slash Menu & Gesture Handle',
    status: 'In Review',
    priority: 'Medium',
    assignee: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
    dueDate: 'Oct 30, 2026',
    pulseMinutes: 30,
    category: 'Mobile',
    tags: ['Sheet', 'Touch', 'Mobile'],
    cover: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    notes: 'Velocity-based drag-to-dismiss sheet tested on iPhone 15 Pro and Pixel 9. Touch targets exceed 44px.',
  },
  {
    id: 'task-106',
    title: 'Anodized 6063 Aluminum CNC Tolerance Review',
    status: 'Backlog',
    priority: 'Low',
    assignee: {
      name: 'Dieter K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    dueDate: 'Nov 18, 2026',
    pulseMinutes: 15,
    category: 'Hardware UI',
    tags: ['Materials', 'Fabrication', 'Braun'],
    cover: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    notes: 'Sample parts from Berlin machine shop arriving Monday for optical micrometer inspection.',
  },
  {
    id: 'task-107',
    title: 'Focus Mode Fullscreen Caret & Word Counter',
    status: 'Done',
    priority: 'High',
    assignee: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    dueDate: 'Oct 25, 2026',
    pulseMinutes: 60,
    category: 'Design System',
    tags: ['Cmd+Shift+F', 'Focus', 'Zen'],
    cover: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80',
    notes: 'Cmd+Shift+F smoothly fades all sidebars and chrome, positioning the canvas in calm typewriter equilibrium.',
  },
  {
    id: 'task-108',
    title: 'Offline Queue Retry with Idempotent Slot UUIDs',
    status: 'Backlog',
    priority: 'Medium',
    assignee: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
    dueDate: 'Nov 10, 2026',
    pulseMinutes: 30,
    category: 'Architecture',
    tags: ['IndexedDB', 'Reliability', 'Offline'],
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    notes: 'Ensures no task pulse logs are duplicated if network disconnects during subway commutes.',
  },
];

export const workspaceMembers: WorkspaceMember[] = [
  {
    id: 'mem-1',
    name: 'Dieter K.',
    email: 'dieter@taskpulse.studio',
    role: 'Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    lastActive: 'Active now',
  },
  {
    id: 'mem-2',
    name: 'Elena Rostova',
    email: 'elena@taskpulse.studio',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    lastActive: '12m ago',
  },
  {
    id: 'mem-3',
    name: 'Marcus Chen',
    email: 'marcus@taskpulse.studio',
    role: 'Member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    lastActive: '1h ago',
  },
  {
    id: 'mem-4',
    name: 'Sarah Jenkins',
    email: 'sarah@taskpulse.studio',
    role: 'Member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    lastActive: '3h ago',
  },
];

export const initialComments: CommentItem[] = [
  {
    id: 'c-1',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
    content: 'The rotary dial mass of 82g provides an exceptional tactile sensation. Tested the physical 3D print sample today.',
    timestamp: '2 hours ago',
    resolved: false,
  },
  {
    id: 'c-2',
    author: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    content: 'Notion Daily Task Manager sync tested with 15-minute slot pulse. Pages are landing in database with exact minutes duration.',
    timestamp: 'Yesterday at 4:15 PM',
    resolved: true,
  },
];
