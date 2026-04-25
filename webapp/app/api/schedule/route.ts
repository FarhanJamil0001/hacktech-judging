import { NextResponse } from "next/server";
import { readSchedule } from "@/lib/data";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  const schedule = await readSchedule();
  return NextResponse.json(schedule);
}
