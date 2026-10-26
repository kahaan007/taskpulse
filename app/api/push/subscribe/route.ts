import { isAuthed, unauthorized } from "@/lib/auth";
import { addSub, pushConfigured, removeSub, sendToAll, type PushSub } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  return Response.json({
    configured: pushConfigured(),
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || null,
  });
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  const sub = (await req.json().catch(() => null)) as PushSub | null;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return Response.json({ error: "invalid subscription" }, { status: 400 });
  }
  await addSub(sub);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (endpoint) await removeSub(endpoint);
  return Response.json({ ok: true });
}

/** Send a test notification. */
export async function PUT(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  const r = await sendToAll({ title: "TaskPulse test", body: "Notifications are working.", tag: "test", url: "/" });
  return Response.json(r);
}
