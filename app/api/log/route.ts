import { isAuthed, unauthorized } from "@/lib/auth";
import { logEntry, markSlot, undoLast } from "@/lib/day";
import type { LogInput } from "@/lib/types";

export const dynamic = "force-dynamic";

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export async function POST(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  const b = (await req.json().catch(() => null)) as Partial<LogInput> | null;
  if (!b || typeof b.entryId !== "string" || typeof b.slotId !== "string") {
    return Response.json({ error: "entryId and slotId required" }, { status: 400 });
  }
  const input: LogInput = {
    entryId: b.entryId,
    slotId: b.slotId,
    description: typeof b.description === "string" ? b.description : undefined,
    minutes: Number(b.minutes) > 0 ? Number(b.minutes) : 15,
    client: arr(b.client),
    goal: arr(b.goal),
    taskType: arr(b.taskType),
    status: typeof b.status === "string" && b.status ? b.status : "In progress",
    priority: b.priority || undefined,
    effort: b.effort || undefined,
    deadline: b.deadline || undefined,
    link: b.link || undefined,
    repeatLast: Boolean(b.repeatLast),
  };
  try {
    const r = await logEntry(input);
    return Response.json({ ok: true, ...r });
  } catch (e) {
    const err = e as Error & { status?: number };
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 400;
    return Response.json({ error: err.message }, { status });
  }
}

/** Undo the most recent entry (archives the Notion page). */
export async function DELETE(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  try {
    const ok = await undoLast();
    return Response.json({ ok });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

/** Mark a slot as Break/Idle or Skip without writing to Notion. */
export async function PUT(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  const b = (await req.json().catch(() => null)) as { slotId?: string; state?: string } | null;
  if (!b?.slotId || (b.state !== "break" && b.state !== "skip")) {
    return Response.json({ error: "slotId and state (break|skip) required" }, { status: 400 });
  }
  await markSlot(b.slotId, b.state);
  return Response.json({ ok: true });
}
