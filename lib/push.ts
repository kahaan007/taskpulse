import webpush from "web-push";
import { kvGet, kvSet } from "./store";

export interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

let ready = false;
function init(): boolean {
  if (ready) return true;
  const pub = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", pub, priv);
  ready = true;
  return true;
}

export const pushConfigured = () => init();

export async function getSubs(): Promise<PushSub[]> {
  return (await kvGet<PushSub[]>("push:subs")) || [];
}

export async function addSub(sub: PushSub) {
  const subs = await getSubs();
  if (!subs.some((s) => s.endpoint === sub.endpoint)) {
    subs.push(sub);
    await kvSet("push:subs", subs);
  }
}

export async function removeSub(endpoint: string) {
  const subs = (await getSubs()).filter((s) => s.endpoint !== endpoint);
  await kvSet("push:subs", subs);
}

export interface PushPayload {
  title: string;
  body: string;
  slotId?: string;
  tag?: string;
  url?: string;
}

export async function sendToAll(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!init()) return { sent: 0, failed: 0 };
  const subs = await getSubs();
  let sent = 0;
  let failed = 0;
  const dead: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(s, JSON.stringify(payload), { TTL: 600, urgency: "high" });
        sent++;
      } catch (e) {
        failed++;
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) dead.push(s.endpoint);
      }
    }),
  );
  if (dead.length) await kvSet("push:subs", subs.filter((s) => !dead.includes(s.endpoint)));
  return { sent, failed };
}
