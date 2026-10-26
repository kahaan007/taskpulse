export interface Opt {
  name: string;
  color: string;
}

export interface FieldOptions {
  client: Opt[];
  goal: Opt[];
  taskType: Opt[];
  status: Opt[];
  priority: Opt[];
  effort: Opt[];
}

export interface Settings {
  start: string; // "09:30"
  end: string; // "18:30"
  interval: number; // minutes
  weekdays: number[]; // 0=Sun .. 6=Sat
  holidays: string[]; // YYYY-MM-DD
  quiet: boolean;
}

export interface Slot {
  id: string; // e.g. 2026-10-27T10:00
  date: string;
  startMin: number;
  endMin: number;
  label: string; // "10:00 – 10:15"
  startISO: string;
  endISO: string;
}

export type SlotState = "logged" | "covered" | "break" | "skip";

export interface LogInput {
  entryId: string; // client-generated idempotency key
  slotId: string;
  description?: string;
  minutes: number;
  client: string[];
  goal: string[];
  taskType: string[];
  status: string;
  priority?: string;
  effort?: string;
  deadline?: string;
  link?: string;
  repeatLast?: boolean;
}

export interface Entry {
  id: string;
  url?: string;
  title: string;
  minutes: number;
  client: string[];
  goal: string[];
  taskType: string[];
  status?: string;
  start: string; // ISO
}

export interface SlotView extends Slot {
  state?: SlotState;
  ended: boolean;
  current: boolean;
}

export interface Combo {
  client: string[];
  goal: string[];
  taskType: string[];
  count: number;
}

export interface Recents {
  last?: Omit<LogInput, "entryId" | "slotId" | "repeatLast">;
  combos: Combo[];
}

export interface TodayResponse {
  date: string;
  nowISO: string;
  tz: string;
  demo: boolean;
  settings: Settings;
  active: boolean; // is today a working day
  slots: SlotView[];
  entries: Entry[];
  totalMinutes: number;
  streak: number;
  recents: Recents;
  canUndo: boolean;
}
