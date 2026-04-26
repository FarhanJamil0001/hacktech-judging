/**
 * Generate projects-hacktech-fake-60.csv (Devpost export shape) in the repo root
 * and refresh webapp/data/schedule.json from it.
 * Run: npm run generate-fake
 */

import { promises as fs } from "fs";
import path from "path";
import Papa from "papaparse";
import { writeScheduleLocal } from "../lib/data";
import { parseDevpostCsv } from "../lib/csv";
import { generateSchedule } from "../lib/schedule";
import type { DevpostRow, ScheduleConfig } from "../lib/types";

/** Column order must match a real Devpost `projects-*.csv` header (Papa field names). */
const CSV_FIELDS = [
  "Project Title",
  "Submission Url",
  "Project Status",
  "Judging Status",
  "Highest Step Completed",
  "Project Created At",
  "About The Project",
  '"Try it out" Links',
  "Video Demo Link",
  "Image Gallery URLs",
  "Attached File S3 Key",
  "Opt-In Prizes",
  "Built With",
  "Notes",
  "Team Colleges/Universities",
  "Additional Team Member Count",
  "List The Domain Name Your Team Has Registered With .Tech During This Hackathon",
  "Agreement",
  "Prize Category Agreement",
  "Which Of The Following Ai Tools Did You Use This Weekend?",
  "Did You Implement A Generative Ai Model Or Api In Your Hack This Weekend?",
  "If You Are Submitting To The Best Use Of Gemma 4 Prize Category, Please Provide Your Project Number.",
] as const;

const ADJ = [
  "Neon",
  "Lunar",
  "Quantum",
  "Swift",
  "Silent",
  "Civic",
  "Fuzzy",
  "Hyper",
  "Amber",
  "Nimbus",
  "Prism",
  "Vector",
  "Chrono",
  "Sonic",
  "Ionic",
] as const;

const NOUN = [
  "Ledger",
  "Atlas",
  "Harbor",
  "Relay",
  "Orbit",
  "Beacon",
  "Cortex",
  "Nexus",
  "Pilot",
  "Vessel",
  "Bridge",
  "Scout",
  "Pulse",
  "Thread",
  "Compass",
] as const;

const FOCUS = [
  "sustainability",
  "on-campus life",
  "accessibility",
  "public transit",
  "health literacy",
  "open science",
  "creative coding",
  "local communities",
] as const;

const STACKS = [
  "next.js, typescript, vercel, tailwind",
  "react, node.js, supabase, tailwind",
  "python, fastapi, react, postgresql",
  "flutter, firebase, mapbox",
  "vue, nuxt, planetscale, clerk",
  "svelte, deno, turso, drizzle",
] as const;

const SCHOOLS = [
  "Caltech",
  "MIT",
  "UC Berkeley",
  "UCLA",
  "Stanford",
  "Georgia Tech",
  "UT Austin",
  "Waterloo",
  "Carnegie Mellon",
] as const;

/**
 * Full HackTech / MLH / sponsor opt-in list (Devpost "Opt-In Prizes" is comma + space separated).
 * Prize strings may contain " - " as name/reward separator; do not split on that.
 */
const SPONSOR_PRIZES: readonly string[] = [
  "Best Use of AI - Mac Mini with Apple M4 chip",
  "Cybersecurity/Safety - NuPhy Air 75 v3 Keyboard",
  "Best Creativity - Logitech MX MASTER 4 Mice",
  'Best "Not so sexy" - WHOOP 5.0 One Health and Fitness Tracker',
  "YC x HackTech - YC Interview",
  "Ironsite x HackTech - Cash Prize",
  "IFM x Hacktech - Best Use of K2 Think V2",
  "Sideshift x HackTech - Cash Prize + Interview",
  "Palohouse x HackTech - 10-day stay @ Palo Alto Hackerhouse + $20k SAFE investment",
  "Listen Labs x HackTech: Simulate Humanity",
  "[MLH] Best Use of Gemma 4 - Google Swag Kits",
  "[MLH] Best Use of ElevenLabs - Wireless Earbuds",
  "[MLH] Best Use of Solana - Ledger Nano S Plus",
  "[MLH] Best Use of Auth0 AI Agents - Wireless Headphones",
  "[MLH] Best Use of Backboard - Tile Essentials Pack",
  "[MLH] Best Use of Vultr - Portable Screens",
  "[MLH] Best .Tech Domain Name - Desktop Microphone",
  "Loveable x HackTech - Best use of Lovable",
];

/** Three distinct opt-ins per project, cycling so all sponsors appear across the 60 teams. */
function optInPrizesForProject(i: number): string {
  const n = SPONSOR_PRIZES.length;
  const k = (i - 1) % n;
  return [0, 6, 12]
    .map((d) => SPONSOR_PRIZES[(k + d) % n])
    .join(", ");
}

const TRY_OUT = '"Try it out" Links' as const;
const GEMMA = CSV_FIELDS[21];

function devpostRow(i: number): DevpostRow {
  const title = `${ADJ[i % ADJ.length]} ${NOUN[(i * 3) % NOUN.length]}`;
  const focus = FOCUS[i % FOCUS.length];
  return {
    "Project Title": title,
    "Submission Url": `https://hacktech-by-caltech-2026.devpost.com/submissions/1099${String(i).padStart(3, "0")}-fake`,
    "Project Status": "Submitted (Gallery/Visible)",
    "About The Project": `## Inspiration\nWe wanted to improve ${focus} for students.\n\n## What it does\nA demo for table scheduling — project #${i}.\n\n## How we built it\nHacked together in a weekend with lots of coffee.`,
    "Video Demo Link": i % 3 === 0 ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : "",
    [TRY_OUT]: i % 2 === 0 ? `https://example.com/demo-${i}` : "",
    "Built With": STACKS[i % STACKS.length],
    "Team Colleges/Universities": SCHOOLS[i % SCHOOLS.length],
    "Opt-In Prizes": optInPrizesForProject(i),
  };
}

function fullExportRow(i: number): Record<string, string> {
  const r = devpostRow(i);
  const h = String(10 + (i % 5)).padStart(2, "0");
  const m = String((i * 7) % 60).padStart(2, "0");
  return {
    "Project Title": r["Project Title"] ?? "",
    "Submission Url": r["Submission Url"] ?? "",
    "Project Status": r["Project Status"] ?? "",
    "Judging Status": "Pending",
    "Highest Step Completed": "Submit",
    "Project Created At": `04/25/2026 ${h}:${m}:00`,
    "About The Project": r["About The Project"] ?? "",
    [TRY_OUT]: r[TRY_OUT] ?? "",
    "Video Demo Link": r["Video Demo Link"] ?? "",
    "Image Gallery URLs": "",
    "Attached File S3 Key": "",
    "Opt-In Prizes": r["Opt-In Prizes"] ?? "",
    "Built With": r["Built With"] ?? "",
    "Notes": "",
    "Team Colleges/Universities": r["Team Colleges/Universities"] ?? "",
    "Additional Team Member Count": String(i % 4),
    "List The Domain Name Your Team Has Registered With .Tech During This Hackathon": "",
    "Agreement": "",
    "Prize Category Agreement": "",
    "Which Of The Following Ai Tools Did You Use This Weekend?": "",
    "Did You Implement A Generative Ai Model Or Api In Your Hack This Weekend?": "",
    [GEMMA]: "",
  };
}

const COUNT = 60;

async function main() {
  const outDir = path.resolve(process.cwd(), "..");
  const csvPath = path.join(outDir, "projects-hacktech-fake-60.csv");

  const objects = Array.from({ length: COUNT }, (_, idx) => fullExportRow(idx + 1));
  const csv = Papa.unparse(objects, { columns: [...CSV_FIELDS] });
  await fs.writeFile(csvPath, csv, "utf-8");
  console.log(`Wrote ${path.basename(csvPath)} at repo root`);

  const scheduleRows = Array.from({ length: COUNT }, (_, idx) => devpostRow(idx + 1));
  const config: ScheduleConfig = {
    startTime: "10:00",
    endTime: "13:00",
    slotMinutes: 10,
    pitchMinutes: 5,
    eligibleStatuses: ["Submitted (Gallery/Visible)"],
    numTables: null,
    randomSeed: "fake-60",
  };
  const schedule = generateSchedule(scheduleRows, config);
  await writeScheduleLocal(schedule);
  console.log(`Wrote data/schedule.json (${COUNT} projects, ${schedule.meta?.numTables} tables).`);

  // Sanity: round-trip the CSV the same way `seed` does
  const roundTrip = await fs.readFile(csvPath, "utf-8");
  const parsed = parseDevpostCsv(roundTrip);
  const eligible = parsed.filter(
    (row) => (row["Project Status"] || "").trim() === "Submitted (Gallery/Visible)"
  );
  console.log(`CSV round-trip: ${parsed.length} rows, ${eligible.length} eligible.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
