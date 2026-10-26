import { isCron, unauthorized } from "@/lib/auth";
import { clearSnooze, dueSlots, dueSnoozes, getSlotState, markPushed } from "@/lib/day";
import { sendToAll } from "@/lib/push";
import { getSettings } from "@/lib/settings";
import type { Slot } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Call this every 1-5 minutes (Vercel Cron, cron-job.org, GitHub Actions...).
 * It is idempotent: each slot is pushed once, plus any snoozed reminders that have come due.
 * Outside Mon-Fri / the work window / holidays / quiet mode it does nothing.
 */
export async function GET(req: Request) {
  if (!isCron(req)) return unauthorized();
  const now = new Date();
  const settings = await getSettings();
  if (settings.quiet) return Response.json({ skipped: "quiet" });

  const sent: string[] = [];
  const notify = async (s: Slot, reminder: boolean) => {
    if (await getSlotState(s.id)) return; // already logged / break / covered / skipped
    await sendToAll({
      title: reminder ? `Reminder: log ${s.label}` : `Log ${s.label}`,
      body: "What did you work on? Tap to log in a few taps.",
      slotId: s.id,
      tag: `slot-${s.id}`,
      url: `/?slot=${encodeURIComponent(s.id)}`,
    });
    sent.push(s.id + (reminder ? " (snooze)" : ""));
  };

  for (const s of await dueSlots(now, settings)) {
    if (await markPushed(s.id)) await notify(s, false);
  }
  for (const s of await dueSnoozes(now, settings)) {
    await clearSnooze(s.id);
    await notify(s, true);
  }
  return Response.json({ ok: true, now: now.toISOString(), sent });
}
