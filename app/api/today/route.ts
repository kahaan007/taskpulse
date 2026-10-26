import { isAuthed, unauthorized } from "@/lib/auth";
import { getToday } from "@/lib/day";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  try {
    return Response.json(await getToday());
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
