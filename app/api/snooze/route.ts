import { isAuthed, unauthorized } from "@/lib/auth";
import { snoozeSlot } from "@/lib/day";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  const b = (await req.json().catch(() => null)) as { slotId?: string; minutes?: number } | null;
  if (!b?.slotId) return Response.json({ error: "slotId required" }, { status: 400 });
  const minutes = Math.min(Math.max(Number(b.minutes) || 5, 1), 30);
  await snoozeSlot(b.slotId, minutes);
  return Response.json({ ok: true, minutes });
}
