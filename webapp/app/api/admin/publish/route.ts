import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { publishScheduleToGitHub } from "@/lib/github";
import { writeScheduleLocal } from "@/lib/data";
import type { Schedule } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { schedule?: Schedule } | null;
  if (!body?.schedule) {
    return NextResponse.json({ error: "Missing schedule" }, { status: 400 });
  }

  // Try writing locally too — useful in dev. In prod (Vercel) the FS is
  // read-only outside /tmp; we ignore the failure.
  try {
    await writeScheduleLocal(body.schedule);
  } catch (err) {
    console.warn("Local write failed (expected on serverless):", err);
  }

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return NextResponse.json(
      { error: "GitHub publish not configured (missing GITHUB_TOKEN or GITHUB_REPO)." },
      { status: 500 }
    );
  }

  try {
    const result = await publishScheduleToGitHub(body.schedule);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
