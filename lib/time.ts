import type { Settings, Slot } from "./types";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function tzParts(d: Date, tz: string) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(d)) p[part.type] = part.value;
  const h = Number(p.hour);
  const m = Number(p.minute);
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    h,
    m,
    minutes: h * 60 + m,
    dow: DOW.indexOf(p.weekday),
  };
}

function tzOffsetMin(d: Date, tz: string): number {
  const p = tzParts(d, tz);
  const [y, mo, da] = p.date.split("-").map(Number);
  const asUTC = Date.UTC(y, mo - 1, da, p.h, p.m);
  const truncated = Math.floor(d.getTime() / 60000) * 60000;
  return Math.round((asUTC - truncated) / 60000);
}

export function zonedToInstant(date: string, minutes: number, tz: string): Date {
  const [y, mo, da] = date.split("-").map(Number);
  const base = Date.UTC(y, mo - 1, da, 0, minutes);
  let guess = base;
  for (let i = 0; i < 2; i++) {
    guess = base - tzOffsetMin(new Date(guess), tz) * 60000;
  }
  return new Date(guess);
}

export function isoWithOffset(date: string, minutes: number, tz: string): string {
  const inst = zonedToInstant(date, minutes, tz);
  const off = tzOffsetMin(inst, tz);
  const sign = off < 0 ? "-" : "+";
  const a = Math.abs(off);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hh = pad(Math.floor(minutes / 60));
  const mm = pad(minutes % 60);
  return `${date}T${hh}:${mm}:00${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}

export function parseHM(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function fmtHM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function buildSlots(date: string, s: Settings, tz: string): Slot[] {
  const start = parseHM(s.start);
  const end = parseHM(s.end);
  const out: Slot[] = [];
  for (let t = start; t + s.interval <= end; t += s.interval) {
    out.push({
      id: `${date}T${fmtHM(t)}`,
      date,
      startMin: t,
      endMin: t + s.interval,
      label: `${fmtHM(t)} – ${fmtHM(t + s.interval)}`,
      startISO: isoWithOffset(date, t, tz),
      endISO: isoWithOffset(date, t + s.interval, tz),
    });
  }
  return out;
}

export function isWorkingDay(date: string, dow: number, s: Settings): boolean {
  return s.weekdays.includes(dow) && !s.holidays.includes(date);
}
