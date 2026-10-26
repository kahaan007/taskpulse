import { COOKIE, checkPasscode, isAuthed, makeSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return Response.json({ authed: isAuthed(req) });
}

export async function POST(req: Request) {
  const { passcode } = (await req.json().catch(() => ({}))) as { passcode?: string };
  if (!passcode || !checkPasscode(passcode)) {
    return Response.json({ error: "Wrong passcode" }, { status: 401 });
  }
  const s = makeSession();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(JSON.stringify({ authed: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${COOKIE}=${s.value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${s.maxAge}${secure}`,
    },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ authed: false }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}
