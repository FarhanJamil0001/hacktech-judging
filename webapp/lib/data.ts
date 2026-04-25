import { promises as fs } from "fs";
import path from "path";
import type { Schedule } from "./types";

const SCHEDULE_PATH = path.join(process.cwd(), "data", "schedule.json");

export async function readSchedule(): Promise<Schedule> {
  try {
    const raw = await fs.readFile(SCHEDULE_PATH, "utf-8");
    return JSON.parse(raw) as Schedule;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return emptySchedule();
    }
    throw err;
  }
}

export async function writeScheduleLocal(schedule: Schedule): Promise<void> {
  await fs.writeFile(SCHEDULE_PATH, JSON.stringify(schedule, null, 2) + "\n", "utf-8");
}

export function emptySchedule(): Schedule {
  return {
    generatedAt: null,
    config: null,
    prizeCatalog: [],
    projects: [],
  };
}

export function findProject(schedule: Schedule, number: number) {
  return schedule.projects.find((p) => p.number === number) ?? null;
}

export function projectsForTable(schedule: Schedule, table: number) {
  return schedule.projects
    .filter((p) => p.table === table)
    .sort((a, b) => a.slotStart.localeCompare(b.slotStart));
}

export function tableIds(schedule: Schedule): number[] {
  const set = new Set<number>();
  for (const p of schedule.projects) set.add(p.table);
  return [...set].sort((a, b) => a - b);
}
