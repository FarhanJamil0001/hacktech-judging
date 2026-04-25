import { NextResponse } from "next/server";
import { checkPassword, setAdminCookie, clearAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD not configured on the server." },
      { status: 500 }
    );
  }
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const ok = checkPassword(body.password || "");
  if (!ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  setAdminCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  clearAdminCookie();
  return NextResponse.json({ ok: true });
}
