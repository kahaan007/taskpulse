import { kvDel, kvGet, kvSet, kvSetNX } from "./store";
import { archivePage, createEntry, notionConfigured, queryRange } from "./notion";
import { buildSlots, isWorkingDay, tzParts, zonedToInstant } from "./time";
import { TZ, getSettings } from "./settings";
import type { Combo, Entry, LogInput, Recents, Settings, Slot, SlotState, SlotView, TodayResponse } from "./types";

type LogFields = Omit<LogInput, "entryId" | "slotId" | "repeatLast">;

interface LastCreated {
  pageId: string;
  slotId: string;
  covered: string[];
  entryId: string;
  minutes: number;
}

const slotKey = (id: string) => `slot:${id}`;

export async function getSlotState(id: string): Promise<SlotState | null> {
  return kvGet<SlotState>(slotKey(id));
}

export async function setSlotState(id: string, state: SlotState | null) {
  if (state) await kvSet(slotKey(id), state, 60 * 60 * 24 * 14);
  else await kvDel(slotKey(id));
}

/* ---------- recents (repeat last + quick combos) ---------- */

async function pushRecent(fields: LogFields) {
  const list = (await kvGet<LogFields[]>("recents")) || [];
  list.unshift(fields);
  await kvSet("recents", list.slice(0, 60));
}

export async function getRecents(): Promise<Recents> {
  const list = (await kvGet<LogFields[]>("recents")) || [];
  const map = new Map<string, Combo>();
  for (const r of list) {
    const key = `${[...r.client].sort().join("|")}::${[...r.taskType].sort().join("|")}`;
    const hit = map.get(key);
    if (hit) hit.count++;
    else map.set(key, { client: r.client, goal: r.goal, taskType: r.taskType, count: 1 });
  }
  const combos = [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  return { last: list[0], combos };
}

/* ---------- demo storage when Notion isn't configured ---------- */

async function demoEntries(date: string): Promise<Entry[]> {
  return (await kvGet<Entry[]>(`demo:${date}`)) || [];
}

/* ---------- today view ---------- */

function entryStartMs(e: Entry) {
  return e.start ? new Date(e.start).getTime() : NaN;
}

export async function getToday(now = new Date()): Promise<TodayResponse> {
  const settings = await getSettings();
  const p = tzParts(now, TZ);
  const active = isWorkingDay(p.date, p.dow, settings);
  const slots = buildSlots(p.date, settings, TZ);

  let entries: Entry[] = [];
  try {
    if (notionConfigured) {
      const from = zonedToInstant(p.date, 0, TZ).toISOString();
      const to = new Date(zonedToInstant(p.date, 0, TZ).getTime() + 24 * 3600 * 1000).toISOString();
      entries = await queryRange(from, to);
    } else {
      entries = await demoEntries(p.date);
    }
  } catch {
    entries = [];
  }

  const byStart = new Set(entries.map(entryStartMs));
  const views: SlotView[] = await Promise.all(
    slots.map(async (s: Slot) => {
      const saved = await getSlotState(s.id);
      const logged = byStart.has(new Date(s.startISO).getTime());
      const state: SlotState | undefined = saved || (logged ? "logged" : undefined);
      return {
        ...s,
        state,
        ended: p.minutes >= s.endMin,
        current: p.minutes >= s.startMin && p.minutes < s.endMin,
      };
    }),
  );

  // streak: consecutive accounted-for slots, counting back from the latest ended slot
  let streak = 0;
  const endedSlots = views.filter((v) => v.ended);
  for (let i = endedSlots.length - 1; i >= 0; i--) {
    const st = endedSlots[i].state;
    if (st === "logged" || st === "covered" || st === "break") streak++;
    else break;
  }

  const last = await kvGet<LastCreated>("last-created");
  return {
    date: p.date,
    nowISO: now.toISOString(),
    tz: TZ,
    demo: !notionConfigured,
    settings,
    active,
    slots: views,
    entries,
    totalMinutes: entries.reduce((a, e) => a + (e.minutes || 0), 0),
    streak,
    recents: await getRecents(),
    canUndo: Boolean(last && last.slotId.startsWith(p.date)),
  };
}

/* ---------- logging ---------- */

function autoTitle(f: LogFields): string {
  const d = f.description?.trim();
  if (d) return d;
  const t = f.taskType.join(", ");
  const c = f.client.join(", ");
  return [t, c].filter(Boolean).join(" — ") || "Task";
}

export async function logEntry(input: LogInput): Promise<{ id: string; url?: string; duplicate: boolean; covered: string[] }> {
  const idemKey = `idem:${input.entryId}`;
  const prior = await kvGet<{ id: string; url?: string; covered: string[] }>(idemKey);
  if (prior) return { ...prior, duplicate: true };

  // reserve to defeat parallel retries
  const reserved = await kvSetNX(`${idemKey}:lock`, 1, 60);
  if (!reserved) {
    const again = await kvGet<{ id: string; url?: string; covered: string[] }>(idemKey);
    if (again) return { ...again, duplicate: true };
    throw new Error("Duplicate submission in flight");
  }

  const settings = await getSettings();
  const date = input.slotId.slice(0, 10);
  const slot = buildSlots(date, settings, TZ).find((s) => s.id === input.slotId);
  if (!slot) throw new Error("Unknown slot");

  let fields: LogFields;
  if (input.repeatLast) {
    const r = await getRecents();
    if (!r.last) throw new Error("Nothing to repeat yet");
    fields = { ...r.last, minutes: input.minutes || r.last.minutes || settings.interval };
  } else {
    const { entryId: _e, slotId: _s, repeatLast: _r, ...rest } = input; // eslint-disable-line @typescript-eslint/no-unused-vars
    fields = rest;
  }
  if (!fields.client.length || !fields.taskType.length) throw new Error("Client and Task type are required");

  const title = autoTitle(fields);
  let res: { id: string; url?: string };
  if (notionConfigured) {
    res = await createEntry(fields, slot.startISO, title);
  } else {
    const id = `demo-${input.entryId}`;
    const entry: Entry = {
      id,
      title,
      minutes: fields.minutes,
      client: fields.client,
      goal: fields.goal,
      taskType: fields.taskType,
      status: fields.status,
      start: slot.startISO,
    };
    const list = await demoEntries(date);
    list.push(entry);
    await kvSet(`demo:${date}`, list, 60 * 60 * 24 * 3);
    res = { id };
  }

  await setSlotState(slot.id, "logged");

  // extra minutes cover the preceding unlogged slots (backwards) so they aren't re-prompted
  const extra = Math.max(0, Math.floor(fields.minutes / settings.interval) - 1);
  const covered: string[] = [];
  if (extra > 0) {
    const all = buildSlots(date, settings, TZ);
    let idx = all.findIndex((s) => s.id === slot.id) - 1;
    while (idx >= 0 && covered.length < extra) {
      const st = await getSlotState(all[idx].id);
      if (st) break;
      await setSlotState(all[idx].id, "covered");
      covered.push(all[idx].id);
      idx--;
    }
  }

  await pushRecent(fields);
  await kvSet("last-created", { pageId: res.id, slotId: slot.id, covered, entryId: input.entryId, minutes: fields.minutes } satisfies LastCreated, 60 * 60 * 24);
  await kvSet(idemKey, { ...res, covered }, 60 * 60 * 24);
  return { ...res, duplicate: false, covered };
}

export async function undoLast(): Promise<boolean> {
  const last = await kvGet<LastCreated>("last-created");
  if (!last) return false;
  if (notionConfigured) await archivePage(last.pageId);
  else {
    const date = last.slotId.slice(0, 10);
    const list = (await demoEntries(date)).filter((e) => e.id !== last.pageId);
    await kvSet(`demo:${date}`, list, 60 * 60 * 24 * 3);
  }
  await setSlotState(last.slotId, null);
  for (const id of last.covered) await setSlotState(id, null);
  await kvDel("last-created");
  await kvDel(`idem:${last.entryId}`);
  return true;
}

export async function markSlot(slotId: string, state: "break" | "skip") {
  await setSlotState(slotId, state);
}

/* ---------- reminder tick (called by cron) ---------- */

export async function dueSlots(now: Date, settings: Settings): Promise<Slot[]> {
  const p = tzParts(now, TZ);
  if (!isWorkingDay(p.date, p.dow, settings)) return [];
  return buildSlots(p.date, settings, TZ).filter((s) => p.minutes >= s.endMin && p.minutes < s.endMin + settings.interval);
}

export async function snoozeSlot(slotId: string, minutes: number) {
  await kvSet(`snooze:${slotId}`, Date.now() + minutes * 60000, 60 * 60);
}

export async function dueSnoozes(now: Date, settings: Settings): Promise<Slot[]> {
  const p = tzParts(now, TZ);
  if (!isWorkingDay(p.date, p.dow, settings)) return [];
  const out: Slot[] = [];
  for (const s of buildSlots(p.date, settings, TZ)) {
    const until = await kvGet<number>(`snooze:${s.id}`);
    if (until && until <= now.getTime()) out.push(s);
  }
  return out;
}

export async function clearSnooze(slotId: string) {
  await kvDel(`snooze:${slotId}`);
}

export async function markPushed(slotId: string): Promise<boolean> {
  return kvSetNX(`pushed:${slotId}`, 1, 60 * 60 * 6);
}
