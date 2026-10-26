import { isAuthed, unauthorized } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  return Response.json(await getSettings());
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  const body = await req.json().catch(() => ({}));
  return Response.json(await saveSettings(body));
}
