"use client";

import type { FieldOptions, LogInput, Settings, TodayResponse } from "./types";

/* ---------------- api ---------------- */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function j<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin", ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error || res.statusText);
  return data as T;
}

export const api = {
  authed: () => j<{ authed: boolean }>("/api/auth"),
  login: (passcode: string) => j<{ authed: boolean }>("/api/auth", { method: "POST", body: JSON.stringify({ passcode }) }),
  logout: () => j<{ authed: boolean }>("/api/auth", { method: "DELETE" }),
  schema: () => j<FieldOptions>("/api/schema"),
  today: () => j<TodayResponse>("/api/today"),
  log: (input: LogInput) => j<{ ok: boolean; id: string; duplicate: boolean }>("/api/log", { method: "POST", body: JSON.stringify(input) }),
  undo: () => j<{ ok: boolean }>("/api/log", { method: "DELETE" }),
  mark: (slotId: string, state: "break" | "skip") => j<{ ok: boolean }>("/api/log", { method: "PUT", body: JSON.stringify({ slotId, state }) }),
  snooze: (slotId: string, minutes: number) => j<{ ok: boolean }>("/api/snooze", { method: "POST", body: JSON.stringify({ slotId, minutes }) }),
  saveSettings: (s: Partial<Settings>) => j<Settings>("/api/settings", { method: "POST", body: JSON.stringify(s) }),
  pushInfo: () => j<{ configured: boolean; publicKey: string | null }>("/api/push/subscribe"),
  pushSubscribe: (sub: PushSubscriptionJSON) => j<{ ok: boolean }>("/api/push/subscribe", { method: "POST", body: JSON.stringify(sub) }),
  pushTest: () => j<{ sent: number; failed: number }>("/api/push/subscribe", { method: "PUT" }),
};

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/* ---------------- offline queue (IndexedDB) ---------------- */

const DB = "taskpulse";
const STORE = "queue";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "entryId" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export const queue = {
  add: (item: LogInput) => tx("readwrite", (s) => s.put(item)).catch(() => undefined),
  all: () => tx<LogInput[]>("readonly", (s) => s.getAll() as IDBRequest<LogInput[]>).catch(() => [] as LogInput[]),
  remove: (entryId: string) => tx("readwrite", (s) => s.delete(entryId)).catch(() => undefined),
};

/** Retry-able = network failure or server-side trouble. 4xx validation errors are not retried. */
export function isRetryable(e: unknown): boolean {
  if (e instanceof ApiError) return e.status >= 500 || e.status === 429;
  return true; // fetch threw: offline / DNS / etc.
}

/** Flush queued entries. Returns how many were synced. */
export async function flushQueue(): Promise<number> {
  const items = await queue.all();
  let n = 0;
  for (const item of items) {
    try {
      await api.log(item);
      await queue.remove(item.entryId);
      n++;
    } catch (e) {
      if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 429) {
        await queue.remove(item.entryId); // permanently invalid, drop it
      } else break;
    }
  }
  return n;
}

/* ---------------- push ---------------- */

function b64ToU8(b64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function enablePush(): Promise<"ok" | "denied" | "unsupported" | "not-configured"> {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
  const info = await api.pushInfo();
  if (!info.configured || !info.publicKey) return "not-configured";
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return "denied";
  const reg = (await registerSW()) || (await navigator.serviceWorker.ready);
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(info.publicKey) });
  await api.pushSubscribe(sub.toJSON());
  return "ok";
}
