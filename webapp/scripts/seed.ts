/**
 * One-off seeder: read the Devpost CSV in the parent dir and write
 * data/schedule.json. Run with `npm run seed`.
 *
 * Override defaults by setting env vars:
 *   SEED_CSV   path to CSV (default: ../projects-hacktech-*.csv via glob)
 *   SEED_START "HH:MM"  default 10:00
 *   SEED_END   "HH:MM"  default 13:00
 *   SEED_SLOT  minutes  default 10
 *   SEED_PITCH minutes  default 5
 *   SEED_SEED  string   default 42
 *   SEED_TABLES integer (omit for auto)
 *   SEED_MAX_PER_TABLE  max projects per table (omit = time window only)
 */

import { promises as fs } from "fs";
import path from "path";
import { parseDevpostCsv } from "../lib/csv";
import { generateSchedule } from "../lib/schedule";
import { writeScheduleLocal } from "../lib/data";
import type { ScheduleConfig } from "../lib/types";

async function findDefaultCsv(): Promise<string> {
  if (process.env.SEED_CSV) return process.env.SEED_CSV;
  const parent = path.resolve(process.cwd(), "..");
  const entries = await fs.readdir(parent);
  const csv = entries
    .filter((f) => f.startsWith("projects-hacktech") && f.endsWith(".csv"))
    .sort()
    .pop();
  if (!csv) {
    throw new Error(
      `No projects-hacktech*.csv found in ${parent}. Set SEED_CSV to override.`
    );
  }
  return path.join(parent, csv);
}

async function main() {
  const csvPath = await findDefaultCsv();
  console.log(`Reading CSV: ${csvPath}`);
  const csvText = await fs.readFile(csvPath, "utf-8");
  const rows = parseDevpostCsv(csvText);
  console.log(`Parsed ${rows.length} rows.`);

  const config: ScheduleConfig = {
    startTime: process.env.SEED_START || "10:00",
    endTime: process.env.SEED_END || "13:00",
    slotMinutes: Number(process.env.SEED_SLOT || 10),
    pitchMinutes: Number(process.env.SEED_PITCH || 5),
    eligibleStatuses: ["Submitted (Gallery/Visible)"],
    numTables: process.env.SEED_TABLES ? Number(process.env.SEED_TABLES) : null,
    maxProjectsPerTable: (() => {
      const raw = process.env.SEED_MAX_PER_TABLE;
      if (raw == null || raw === "") return null;
      const n = Number(raw);
      return Number.isFinite(n) && n >= 1 ? n : null;
    })(),
    randomSeed: process.env.SEED_SEED || "42",
  };

  const schedule = generateSchedule(rows, config);
  await writeScheduleLocal(schedule);

  console.log("Wrote data/schedule.json");
  console.log(`  Eligible projects: ${schedule.meta?.eligibleCount}`);
  console.log(`  Tables:            ${schedule.meta?.numTables} (min ${schedule.meta?.minTables})`);
  console.log(`  Slots/table:       ${schedule.meta?.slotsPerTable}`);
  console.log(`  Prize chips:       ${schedule.prizeCatalog.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
