import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { parseDevpostCsv } from "@/lib/csv";
import { generateSchedule, ScheduleError } from "@/lib/schedule";
import type { ScheduleConfig } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("csv");
  const configRaw = form.get("config");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing CSV file" }, { status: 400 });
  }
  if (typeof configRaw !== "string") {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  let config: ScheduleConfig;
  try {
    config = JSON.parse(configRaw);
  } catch {
    return NextResponse.json({ error: "Bad config JSON" }, { status: 400 });
  }

  const csvText = await file.text();
  let rows;
  try {
    rows = parseDevpostCsv(csvText);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }

  try {
    const schedule = generateSchedule(rows, config);
    return NextResponse.json({ schedule });
  } catch (err) {
    if (err instanceof ScheduleError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
