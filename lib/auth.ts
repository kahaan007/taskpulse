import { createHmac, timingSafeEqual } from "crypto";

export const COOKIE = "tp_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  return process.env.SESSION_SECRET || process.env.APP_PASSCODE || "dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEq(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPasscode(input: string): boolean {
  const pass = process.env.APP_PASSCODE?.trim();
  if (!pass) return process.env.NODE_ENV !== "production";
  return safeEq(input.trim(), pass);
}

export function makeSession(): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return { value: `${exp}.${sign(String(exp))}`, maxAge: MAX_AGE };
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function isAuthed(req: Request): boolean {
  if (!process.env.APP_PASSCODE && process.env.NODE_ENV !== "production") return true;
  const v = parseCookies(req.headers.get("cookie"))[COOKIE];
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  return safeEq(sig, sign(exp));
}

export function isCron(req: Request): boolean {
  const s = process.env.CRON_SECRET;
  if (!s) return process.env.NODE_ENV !== "production";
  return safeEq(req.headers.get("authorization") || "", `Bearer ${s}`);
}

export function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
