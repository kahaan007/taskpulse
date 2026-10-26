import { kvGet, kvSet } from "./store";
import type { Settings } from "./types";

export const TZ = process.env.TZ_NAME || "Asia/Kolkata";

export function defaultSettings(): Settings {
  return {
    start: process.env.WORK_START || "09:30",
    end: process.env.WORK_END || "18:30",
    interval: Number(process.env.SLOT_MINUTES || 15),
    weekdays: [1, 2, 3, 4, 5],
    holidays: (process.env.HOLIDAYS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    quiet: false,
  };
}

export async function getSettings(): Promise<Settings> {
  const saved = await kvGet<Partial<Settings>>("settings");
  return { ...defaultSettings(), ...(saved || {}) };
}

export async function saveSettings(input: Partial<Settings>): Promise<Settings> {
  const cur = await getSettings();
  const next: Settings = { ...cur };
  const hm = /^\d{2}:\d{2}$/;
  if (input.start && hm.test(input.start)) next.start = input.start;
  if (input.end && hm.test(input.end)) next.end = input.end;
  if (input.interval && [5, 10, 15, 20, 30, 60].includes(input.interval)) next.interval = input.interval;
  if (Array.isArray(input.weekdays)) next.weekdays = input.weekdays.filter((d) => d >= 0 && d <= 6);
  if (Array.isArray(input.holidays)) next.holidays = input.holidays.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (typeof input.quiet === "boolean") next.quiet = input.quiet;
  await kvSet("settings", next);
  return next;
}
