import { isAuthed, unauthorized } from "@/lib/auth";
import { getFieldOptions } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAuthed(req)) return unauthorized();
  return Response.json(await getFieldOptions());
}
