import { Client, Project, TaskType, TaskLogEntry, QuickPreset } from './types';

export const SEED_CLIENTS: Client[] = [
  { id: 'c-siemens', name: 'Siemens', code: 'SIE', industry: 'Industrial Automation' },
  { id: 'c-coreops', name: 'CoreOpsAI', code: 'COP', industry: 'ML & Infrastructure' },
  { id: 'c-redington', name: 'Redington Group', code: 'RDN', industry: 'Supply Chain & Tech' },
  { id: 'c-jerhigh', name: 'JerHigh', code: 'JRH', industry: 'Consumer Goods' },
  { id: 'c-safeair', name: 'SafeAir', code: 'SFA', industry: 'Aviation Technology' },
  { id: 'c-internal', name: 'Internal Studio', code: 'INT', industry: 'TaskPulse Product' },
  { id: 'c-goa', name: 'GoaAirport', code: 'GOA', industry: 'Infrastructure & Travel' },
  { id: 'c-honeywell', name: 'Honeywell', code: 'HON', industry: 'Aerospace & Building' },
  { id: 'c-ndmc', name: 'NDMC', code: 'NDM', industry: 'Civic Infrastructure' },
  { id: 'c-udaiti', name: 'Udaiti', code: 'UDT', industry: 'Social Enterprise' },
  { id: 'c-ashok', name: 'Ashok Kumar Mittal', code: 'AKM', industry: 'Higher Education' },
  { id: 'c-azenthio', name: 'Azenthio', code: 'AZN', industry: 'Banking Software' },
  { id: 'c-easybuy', name: 'Easybuy', code: 'EBY', industry: 'Retail Fashion' },
  { id: 'c-jioframes', name: 'JioFrames', code: 'JIO', industry: 'Smart Wearables' },
  { id: 'c-shanfoods', name: 'ShanFoods', code: 'SHN', industry: 'FMCG & Packaging' },
  { id: 'c-sunsure', name: 'Sunsure Energy', code: 'SUN', industry: 'Renewable Power' },
  { id: 'c-safetree', name: 'Safetree Insurance', code: 'SFT', industry: 'InsurTech' },
  { id: 'c-hunter', name: 'Hunter Beer', code: 'HNT', industry: 'Beverages' },
  { id: 'c-goodearth', name: 'Good Earth Infra', code: 'GEI', industry: 'Sustainable Real Estate' },
  { id: 'c-hashtag', name: 'Hashtag Orange', code: 'HTO', industry: 'Brand Communications' },
  { id: 'c-livguard', name: 'Livguard', code: 'LVG', industry: 'Energy Storage' },
  { id: 'c-gmr', name: 'GMR Aero XP', code: 'GMR', industry: 'Aero Commercial' },
  { id: 'c-ramp360', name: 'Ramp 360', code: 'RMP', industry: 'FinTech Logistics' },
  { id: 'c-whizrobot', name: 'Whizrobot Pitch', code: 'WHZ', industry: 'Robotics & STEM' },
  { id: 'c-theplan', name: 'The Plan Beyond', code: 'TPB', industry: 'Strategic Advisory' },
  { id: 'c-pyramid', name: 'Pyramid Infrastructure', code: 'PYR', industry: 'Urban Transit' },
];

export const SEED_PROJECTS: Project[] = [
  // Siemens
  { id: 'p-sie-1', clientId: 'c-siemens', name: 'Automation Telemetry Revamp', active: true },
  { id: 'p-sie-2', clientId: 'c-siemens', name: 'Industrial HMI Display System', active: true },
  { id: 'p-sie-3', clientId: 'c-siemens', name: 'Design System WCAG Audit', active: true },

  // CoreOpsAI
  { id: 'p-cop-1', clientId: 'c-coreops', name: 'LLM Pipeline Observability Dashboard', active: true },
  { id: 'p-cop-2', clientId: 'c-coreops', name: 'Client Prototype Walkthrough', active: true },

  // Redington Group
  { id: 'p-rdn-1', clientId: 'c-redington', name: 'Partner B2B Portal Overhaul', active: true },
  { id: 'p-rdn-2', clientId: 'c-redington', name: 'Warehouse Logistics Flow', active: true },

  // JerHigh
  { id: 'p-jrh-1', clientId: 'c-jerhigh', name: 'E-commerce Brand Experience', active: true },
  { id: 'p-jrh-2', clientId: 'c-jerhigh', name: 'Product Packaging Visuals', active: true },

  // SafeAir
  { id: 'p-sfa-1', clientId: 'c-safeair', name: 'Cockpit Alert Flow Architecture', active: true },
  { id: 'p-sfa-2', clientId: 'c-safeair', name: 'Ground Crew Mobile Diagnostics', active: true },

  // Internal
  { id: 'p-int-1', clientId: 'c-internal', name: 'TaskPulse Notion Daily Sync', active: true },
  { id: 'p-int-2', clientId: 'c-internal', name: 'Braun Design Tokens v2', active: true },

  // GoaAirport
  { id: 'p-goa-1', clientId: 'c-goa', name: 'Passenger Wayfinding Mobile Web', active: true },
  { id: 'p-goa-2', clientId: 'c-goa', name: 'Flight Status Display Board', active: true },

  // Honeywell
  { id: 'p-hon-1', clientId: 'c-honeywell', name: 'HVAC Sensor Management Tablet UI', active: true },
  { id: 'p-hon-2', clientId: 'c-honeywell', name: 'Industrial Safety Telemetry', active: true },

  // NDMC
  { id: 'p-ndm-1', clientId: 'c-ndmc', name: 'Citizen Smart Services Portal', active: true },

  // Udaiti
  { id: 'p-udt-1', clientId: 'c-udaiti', name: 'Field Data Collector Mobile Web', active: true },

  // Ashok Kumar Mittal
  { id: 'p-akm-1', clientId: 'c-ashok', name: 'Campus Lifecycle Mobile Hub', active: true },

  // Azenthio
  { id: 'p-azn-1', clientId: 'c-azenthio', name: 'Core Banking Treasury Workflow', active: true },

  // Easybuy
  { id: 'p-eby-1', clientId: 'c-easybuy', name: 'In-Store POS Touch Experience', active: true },

  // JioFrames
  { id: 'p-jio-1', clientId: 'c-jioframes', name: 'Spatial Audio Companion App', active: true },

  // ShanFoods
  { id: 'p-shn-1', clientId: 'c-shanfoods', name: 'Global Recipe Portal Redesign', active: true },

  // Sunsure Energy
  { id: 'p-sun-1', clientId: 'c-sunsure', name: 'Solar Grid Yield Analytics', active: true },

  // Safetree Insurance
  { id: 'p-sft-1', clientId: 'c-safetree', name: 'Instant Claim Assessment UI', active: true },

  // Hunter Beer
  { id: 'p-hnt-1', clientId: 'c-hunter', name: 'Brand Campaign Micro-Site', active: true },

  // Good Earth Infra
  { id: 'p-gei-1', clientId: 'c-goodearth', name: 'Sustainable Community Map', active: true },

  // Hashtag Orange
  { id: 'p-hto-1', clientId: 'c-hashtag', name: 'Creative Pitch Deck Systems', active: true },

  // Livguard
  { id: 'p-lvg-1', clientId: 'c-livguard', name: 'Inverter Diagnostics Companion', active: true },

  // GMR Aero XP
  { id: 'p-gmr-1', clientId: 'c-gmr', name: 'Aerocity Tenant Portal', active: true },

  // Ramp 360
  { id: 'p-rmp-1', clientId: 'c-ramp360', name: 'Fleet Mileage Verification', active: true },

  // Whizrobot Pitch
  { id: 'p-whz-1', clientId: 'c-whizrobot', name: 'Interactive Robotics Showcase', active: true },

  // The Plan Beyond
  { id: 'p-tpb-1', clientId: 'c-theplan', name: 'Executive Strategy Matrix', active: true },

  // Pyramid Infrastructure
  { id: 'p-pyr-1', clientId: 'c-pyramid', name: 'Highway Toll Automation Review', active: true },
];

export const TASK_TYPES: TaskType[] = [
  { id: 'tt-ai-img', label: 'AI Image Generation', category: 'Generative AI', iconName: 'Sparkles', color: 'default' },
  { id: 'tt-ai-vid', label: 'AI Video Generation', category: 'Generative AI', iconName: 'Video', color: 'purple' },
  { id: 'tt-asset-handover', label: 'Asset handover', category: 'Delivery', iconName: 'Briefcase', color: 'red' },
  { id: 'tt-banner', label: 'Banner', category: 'Marketing & Visuals', iconName: 'Image', color: 'brown' },
  { id: 'tt-biz-research', label: 'Business Research', category: 'Strategy & Research', iconName: 'Search', color: 'orange' },
  { id: 'tt-client-meeting', label: 'Client Meeting', category: 'Meetings', iconName: 'Users', color: 'green' },
  { id: 'tt-color-palette', label: 'Colour Paltte', category: 'Design System', iconName: 'Palette', color: 'red' },
  { id: 'tt-comp-analysis', label: 'Competition Analysis', category: 'Strategy & Research', iconName: 'Search', color: 'default' },
  { id: 'tt-deck', label: 'Deck', category: 'Presentations', iconName: 'Layout', color: 'orange' },
  { id: 'tt-design-system', label: 'Design System', category: 'Design System', iconName: 'Layers', color: 'orange' },
  { id: 'tt-find-stock', label: 'Find stock image', category: 'Production & Assets', iconName: 'Image', color: 'purple' },
  { id: 'tt-high-fi', label: 'High Fidelity', category: 'UI/UX Design', iconName: 'Palette', color: 'yellow' },
  { id: 'tt-ideation', label: 'Ideation', category: 'Discovery', iconName: 'Sparkles', color: 'red' },
  { id: 'tt-img-resize', label: 'Image Resize', category: 'Production & Assets', iconName: 'Image', color: 'orange' },
  { id: 'tt-int-research', label: 'Internal Research', category: 'Strategy & Research', iconName: 'Search', color: 'brown' },
  { id: 'tt-kickoff', label: 'Kick Off Meeting', category: 'Meetings', iconName: 'Users', color: 'green' },
  { id: 'tt-logo-resize', label: 'Logo resize', category: 'Production & Assets', iconName: 'Image', color: 'blue' },
  { id: 'tt-low-fi', label: 'Low Fidelity', category: 'UI/UX Design', iconName: 'Layers', color: 'default' },
  { id: 'tt-med-fi', label: 'Medium Fidelity Wireframe', category: 'UI/UX Design', iconName: 'Layout', color: 'blue' },
  { id: 'tt-new-comp', label: 'New Component', category: 'Design System', iconName: 'Layers', color: 'red' },
  { id: 'tt-new-design', label: 'New Design', category: 'UI/UX Design', iconName: 'Palette', color: 'pink' },
  { id: 'tt-onsite-visit', label: 'On SIte Visit', category: 'Fieldwork', iconName: 'Briefcase', color: 'gray' },
  { id: 'tt-pitch-design', label: 'Pitch Design', category: 'Presentations', iconName: 'Layout', color: 'green' },
  { id: 'tt-prototype', label: 'Prototype', category: 'Prototyping', iconName: 'Cpu', color: 'orange' },
  { id: 'tt-proto-walkthrough', label: 'Prototype Walkthrough', category: 'Prototyping', iconName: 'Eye', color: 'default' },
  { id: 'tt-sitemap', label: 'Sitemap', category: 'Architecture', iconName: 'Compass', color: 'green' },
  { id: 'tt-sitemap-review', label: 'Sitemap Review', category: 'Architecture', iconName: 'Eye', color: 'gray' },
  { id: 'tt-typography', label: 'Typography Selection', category: 'Design System', iconName: 'Palette', color: 'default' },
  { id: 'tt-ui-tweak', label: 'UI tweak', category: 'UI/UX Design', iconName: 'Palette', color: 'green' },
  { id: 'tt-uplift-design', label: 'Uplift Design', category: 'UI/UX Design', iconName: 'Palette', color: 'red' },
  { id: 'tt-flow-creation', label: 'User Flow Creation', category: 'UX Architecture', iconName: 'Compass', color: 'gray' },
  { id: 'tt-flow-exploration', label: 'User Flow Exploration', category: 'UX Architecture', iconName: 'Compass', color: 'orange' },
  { id: 'tt-ux-research', label: 'UX Research', category: 'Strategy & Research', iconName: 'Search', color: 'brown' },
  { id: 'tt-video-editing', label: 'Video Editing', category: 'Motion & Video', iconName: 'Video', color: 'purple' },
  { id: 'tt-visual-direction', label: 'Visual Direction', category: 'Art & Brand', iconName: 'Eye', color: 'blue' },
  { id: 'tt-workshop', label: 'Workshop', category: 'Meetings', iconName: 'Users', color: 'red' },
];

export const INITIAL_TODAY_LOGS: TaskLogEntry[] = [
  {
    id: 'log-1',
    clientId: 'c-siemens',
    projectId: 'p-sie-1',
    clientName: 'Siemens',
    projectName: 'Automation Telemetry Revamp',
    taskTypeId: 'tt-high-fi',
    taskTypeLabel: 'High Fidelity',
    taskTypeIcon: 'Palette',
    durationMin: 60,
    description: 'Calibrated rotary stepping dials and verified contrast on dark telemetry panels.',
    loggedAt: '10:30 AM',
    url: 'https://app.notion.com/p/High-Fidelity-Siemens-405cfc0cee7581208417f5aa768c0aeb',
  },
  {
    id: 'log-2',
    clientId: 'c-coreops',
    projectId: 'p-cop-2',
    clientName: 'CoreOpsAI',
    projectName: 'Client Prototype Walkthrough',
    taskTypeId: 'tt-client-meeting',
    taskTypeLabel: 'Client Meeting',
    taskTypeIcon: 'Users',
    durationMin: 45,
    description: 'Walkthrough of latency monitoring charts with principal engineer and VP product.',
    loggedAt: '09:45 AM',
  },
  {
    id: 'log-3',
    clientId: 'c-safeair',
    projectId: 'p-sfa-1',
    clientName: 'SafeAir',
    projectName: 'Cockpit Alert Flow Architecture',
    taskTypeId: 'tt-ux-research',
    taskTypeLabel: 'UX Research',
    taskTypeIcon: 'Search',
    durationMin: 30,
    description: 'Benchmarked human-factor audible alarm delay under simulated turbulence.',
    loggedAt: '09:00 AM',
  },
  {
    id: 'log-4',
    clientId: 'c-internal',
    projectId: 'p-int-1',
    clientName: 'Internal Studio',
    projectName: 'TaskPulse Notion Daily Sync',
    taskTypeId: 'tt-design-system',
    taskTypeLabel: 'Design System',
    taskTypeIcon: 'Layers',
    durationMin: 90,
    description: 'Implemented 15-minute slot pulse sync to Notion Daily Task Manager API.',
    loggedAt: '08:00 AM',
  },
];

export const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'qp-repeat',
    emoji: '⚡',
    label: 'Repeat Last',
    clientId: 'c-siemens',
    projectId: 'p-sie-1',
    taskTypeId: 'tt-high-fi',
    durationMin: 60,
    description: 'Calibrated rotary stepping dials and verified contrast on dark telemetry panels.',
  },
  {
    id: 'qp-design-system',
    emoji: '🎨',
    label: 'Design System',
    clientId: 'c-siemens',
    projectId: 'p-sie-3',
    taskTypeId: 'tt-design-system',
    durationMin: 30,
    description: 'Updated WCAG AA contrast tokens and spacing components in Figma and code.',
  },
  {
    id: 'qp-meeting',
    emoji: '👥',
    label: 'Client Standup',
    clientId: 'c-coreops',
    projectId: 'p-cop-2',
    taskTypeId: 'tt-client-meeting',
    durationMin: 30,
    description: 'Daily standup review with engineering leads and product team walkthrough.',
  },
  {
    id: 'qp-research',
    emoji: '🔬',
    label: 'UX Research',
    clientId: 'c-safeair',
    projectId: 'p-sfa-1',
    taskTypeId: 'tt-ux-research',
    durationMin: 45,
    description: 'Audited cockpit emergency alert response times and synthesized usability notes.',
  },
  {
    id: 'qp-tweak',
    emoji: '🚀',
    label: 'UI Tweak',
    clientId: 'c-internal',
    projectId: 'p-int-1',
    taskTypeId: 'tt-ui-tweak',
    durationMin: 15,
    description: 'Quick micro-interaction polish and optical alignment tweaks on mobile cards.',
  },
];
