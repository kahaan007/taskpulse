/**
 * Tiny JSON key-value store.
 * - Production: Upstash Redis / Vercel KV via REST (KV_REST_API_URL + KV_REST_API_TOKEN)
 * - Dev fallback: in-memory map persisted to .data/store.json when the filesystem is writable
 */
import { promises as fs } from "fs";
import path from "path";

const URL_ = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;

async function redis(cmd: (string | number)[]): Promise<unknown> {
  const res = await fetch(URL_!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  const j = (await res.json()) as { result: unknown };
  return j.result;
}

const FILE = path.join(process.cwd(), ".data", "store.json");
let mem: Record<string, { v: string; exp?: number }> | null = null;

async function load() {
  if (mem) return mem;
  try {
    mem = JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    mem = {};
  }
  return mem!;
}

async function persist() {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(mem));
  } catch {
    /* read-only FS: memory only */
  }
}

export const usingKV = Boolean(URL_ && TOKEN);

export async function kvGet<T>(key: string): Promise<T | null> {
  if (usingKV) {
    const r = await redis(["GET", key]);
    if (r == null) return null;
    try {
      return JSON.parse(r as string) as T;
    } catch {
      return null;
    }
  }
  const m = await load();
  const e = m[key];
  if (!e) return null;
  if (e.exp && e.exp < Date.now()) {
    delete m[key];
    return null;
  }
  return JSON.parse(e.v) as T;
}

export async function kvSet(key: string, value: unknown, ttlSec?: number): Promise<void> {
  const s = JSON.stringify(value);
  if (usingKV) {
    await redis(ttlSec ? ["SET", key, s, "EX", ttlSec] : ["SET", key, s]);
    return;
  }
  const m = await load();
  m[key] = { v: s, exp: ttlSec ? Date.now() + ttlSec * 1000 : undefined };
  await persist();
}

/** Set only if absent. Returns true if it was set. */
export async function kvSetNX(key: string, value: unknown, ttlSec: number): Promise<boolean> {
  const s = JSON.stringify(value);
  if (usingKV) {
    const r = await redis(["SET", key, s, "EX", ttlSec, "NX"]);
    return r === "OK";
  }
  const existing = await kvGet(key);
  if (existing !== null) return false;
  await kvSet(key, value, ttlSec);
  return true;
}

export async function kvDel(key: string): Promise<void> {
  if (usingKV) {
    await redis(["DEL", key]);
    return;
  }
  const m = await load();
  delete m[key];
  await persist();
}
