import seedrandom from "seedrandom";
import type { DevpostRow, Project, Schedule, ScheduleConfig } from "./types";
import { buildPrizeCatalog, prizeNamesFromOptIn, splitOptInPrizes } from "./prizes";

function parseHHMM(s: string): { h: number; m: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) throw new Error(`Invalid time "${s}", expected HH:MM`);
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) {
    throw new Error(`Time "${s}" out of range`);
  }
  return { h, m: min };
}

function toMinutes(s: string): number {
  const { h, m } = parseHHMM(s);
  return h * 60 + m;
}

function fmtMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function splitCsvList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export class ScheduleError extends Error {}

export function generateSchedule(
  rows: DevpostRow[],
  config: ScheduleConfig
): Schedule {
  const startMin = toMinutes(config.startTime);
  const endMin = toMinutes(config.endTime);
  const totalMinutes = endMin - startMin;

  if (totalMinutes <= 0) {
    throw new ScheduleError(
      `End time (${config.endTime}) must be after start time (${config.startTime}).`
    );
  }
  if (config.slotMinutes <= 0) {
    throw new ScheduleError(`slotMinutes must be > 0`);
  }

  const slotsPerTable = Math.floor(totalMinutes / config.slotMinutes);
  if (slotsPerTable === 0) {
    throw new ScheduleError(
      `Window too short — ${totalMinutes} min cannot fit one ${config.slotMinutes}-min slot.`
    );
  }

  const eligibleSet = new Set(config.eligibleStatuses);
  const eligible = rows.filter((r) =>
    eligibleSet.has((r["Project Status"] || "").trim())
  );

  if (eligible.length === 0) {
    throw new ScheduleError(
      `No projects match eligible statuses: ${config.eligibleStatuses.join(", ") || "(none)"}`
    );
  }

  // Seeded shuffle
  const rng = seedrandom(config.randomSeed || "");
  const shuffled = [...eligible];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const n = shuffled.length;
  const minTables = Math.ceil(n / slotsPerTable);
  let numTables: number;
  if (config.numTables === null || config.numTables === undefined) {
    numTables = minTables;
  } else {
    if (config.numTables < 1) {
      throw new ScheduleError(`numTables must be >= 1`);
    }
    if (config.numTables * slotsPerTable < n) {
      throw new ScheduleError(
        `numTables=${config.numTables} too small. ${n} projects × ${config.slotMinutes} min need at least ${minTables} tables in this ${totalMinutes}-min window.`
      );
    }
    numTables = config.numTables;
  }

  const projects: Project[] = shuffled.map((r, i) => {
    const number = i + 1;
    const table = (i % numTables) + 1;
    const slotIndex = Math.floor(i / numTables);
    const slotStartMin = startMin + slotIndex * config.slotMinutes;
    const slotEndMin = slotStartMin + config.slotMinutes;
    const optInRaw = r["Opt-In Prizes"] || "";

    return {
      number,
      title: (r["Project Title"] || "").trim() || "(Untitled)",
      devpostUrl: (r["Submission Url"] || "").trim(),
      description: (r["About The Project"] || "").trim(),
      videoUrl: (r["Video Demo Link"] || "").trim(),
      tryItUrls: splitCsvList(r['"Try it out" Links']),
      builtWith: splitCsvList(r["Built With"]),
      university: (r["Team Colleges/Universities"] || "").trim(),
      optInPrizes: splitOptInPrizes(optInRaw),
      prizeNames: prizeNamesFromOptIn(optInRaw),
      table,
      slotStart: fmtMinutes(slotStartMin),
      slotEnd: fmtMinutes(slotEndMin),
    };
  });

  // Validate
  const seenNumbers = new Set<number>();
  const seenCells = new Set<string>();
  for (const p of projects) {
    if (seenNumbers.has(p.number)) {
      throw new ScheduleError(`Duplicate project number ${p.number}`);
    }
    seenNumbers.add(p.number);
    const cell = `${p.table}|${p.slotStart}`;
    if (seenCells.has(cell)) {
      throw new ScheduleError(
        `Two projects assigned to table ${p.table} at ${p.slotStart}`
      );
    }
    seenCells.add(cell);
  }

  const prizeCatalog = buildPrizeCatalog(projects.map((p) => p.prizeNames));

  return {
    generatedAt: new Date().toISOString(),
    config,
    prizeCatalog,
    projects,
    meta: {
      eligibleCount: n,
      totalMinutes,
      slotsPerTable,
      minTables,
      numTables,
    },
  };
}
