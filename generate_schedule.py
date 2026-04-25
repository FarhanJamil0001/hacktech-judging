"""Generate a HackTech judging schedule from a Devpost CSV export.

Edit the CONFIG block below, then run:  python3 generate_schedule.py
"""

import csv
import math
import os
import random
import sys
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
CSV_PATH = "projects-hacktech-by-caltech-2026-6b03a7df-0f1c-4b6e-8901-37f8ce455fa1-2026-04-25-19_07_58.csv"
OUTPUT_DIR = "schedule_output"

START_TIME = "10:00"          # 24h "HH:MM"
END_TIME = "13:00"            # 24h "HH:MM"

SLOT_MINUTES = 10             # full slot length (pitch + buffer)
PITCH_MINUTES = 5             # informational; printed in summary

ELIGIBLE_STATUSES = ["Submitted (Gallery/Visible)"]

NUM_TABLES = None             # None = auto-compute minimum; int = override
RANDOM_SEED = 42              # int for reproducible shuffle, None for true random


# ---------------------------------------------------------------------------
def parse_hhmm(s):
    return datetime.strptime(s.strip(), "%H:%M")


def fmt_hhmm(dt):
    return dt.strftime("%H:%M")


def load_eligible_projects(csv_path, eligible_statuses):
    with open(csv_path, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if "Project Status" not in reader.fieldnames:
            sys.exit(f"ERROR: 'Project Status' column not found in {csv_path}")
        projects = []
        for row in reader:
            status = (row.get("Project Status") or "").strip()
            if status in eligible_statuses:
                projects.append({
                    "title": (row.get("Project Title") or "").strip() or "(Untitled)",
                    "url": (row.get("Submission Url") or "").strip(),
                    "status": status,
                })
    return projects


def assign_schedule(projects, num_tables, slots_per_table, start_dt, slot_minutes):
    """Round-robin projects across tables; project i -> (table=i%T+1, slot=i//T)."""
    rows = []
    for i, p in enumerate(projects):
        table = (i % num_tables) + 1
        slot_index = i // num_tables
        slot_start = start_dt + timedelta(minutes=slot_index * slot_minutes)
        slot_end = slot_start + timedelta(minutes=slot_minutes)
        rows.append({
            "project_number": i + 1,
            "title": p["title"],
            "url": p["url"],
            "table": table,
            "slot_index": slot_index,
            "slot_start": slot_start,
            "slot_end": slot_end,
        })
    return rows


def validate(rows, n_projects):
    seen_numbers = set()
    seen_cells = set()
    for r in rows:
        if r["project_number"] in seen_numbers:
            sys.exit(f"ERROR: duplicate project number {r['project_number']}")
        seen_numbers.add(r["project_number"])
        cell = (r["table"], r["slot_index"])
        if cell in seen_cells:
            sys.exit(f"ERROR: two projects assigned to table {cell[0]} slot {cell[1]}")
        seen_cells.add(cell)
    if seen_numbers != set(range(1, n_projects + 1)):
        sys.exit("ERROR: project numbers not 1..N exactly once")


def write_csv(path, header, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)


def write_participants(out_dir, rows):
    out = sorted(rows, key=lambda r: r["project_number"])
    write_csv(
        os.path.join(out_dir, "participants.csv"),
        ["Project Number", "Project Title", "Table", "Pitch Time", "Slot Window"],
        [
            [
                r["project_number"],
                r["title"],
                r["table"],
                fmt_hhmm(r["slot_start"]),
                f"{fmt_hhmm(r['slot_start'])}–{fmt_hhmm(r['slot_end'])}",
            ]
            for r in out
        ],
    )


def write_master(out_dir, rows):
    out = sorted(rows, key=lambda r: (r["slot_start"], r["table"]))
    write_csv(
        os.path.join(out_dir, "master_schedule.csv"),
        ["Slot Start", "Slot End", "Table", "Project Number", "Project Title", "Devpost URL"],
        [
            [
                fmt_hhmm(r["slot_start"]),
                fmt_hhmm(r["slot_end"]),
                r["table"],
                r["project_number"],
                r["title"],
                r["url"],
            ]
            for r in out
        ],
    )


def write_per_table(out_dir, rows, num_tables):
    for t in range(1, num_tables + 1):
        table_rows = sorted(
            (r for r in rows if r["table"] == t), key=lambda r: r["slot_start"]
        )
        write_csv(
            os.path.join(out_dir, f"table_{t}_schedule.csv"),
            ["Slot Start", "Slot End", "Project Number", "Project Title", "Devpost URL"],
            [
                [
                    fmt_hhmm(r["slot_start"]),
                    fmt_hhmm(r["slot_end"]),
                    r["project_number"],
                    r["title"],
                    r["url"],
                ]
                for r in table_rows
            ],
        )


def main():
    start_dt = parse_hhmm(START_TIME)
    end_dt = parse_hhmm(END_TIME)
    total_minutes = int((end_dt - start_dt).total_seconds() // 60)
    if total_minutes <= 0:
        sys.exit(f"ERROR: END_TIME ({END_TIME}) must be after START_TIME ({START_TIME})")

    slots_per_table = total_minutes // SLOT_MINUTES
    if slots_per_table == 0:
        sys.exit(
            f"ERROR: window too short — {total_minutes} min cannot fit one {SLOT_MINUTES}-min slot"
        )

    projects = load_eligible_projects(CSV_PATH, ELIGIBLE_STATUSES)
    n = len(projects)
    if n == 0:
        sys.exit(
            f"ERROR: no projects matched ELIGIBLE_STATUSES={ELIGIBLE_STATUSES} in {CSV_PATH}"
        )

    rng = random.Random(RANDOM_SEED)
    rng.shuffle(projects)

    min_tables = math.ceil(n / slots_per_table)
    if NUM_TABLES is None:
        num_tables = min_tables
        tables_label = f"{num_tables}  (auto, min required: {min_tables})"
    else:
        num_tables = NUM_TABLES
        if num_tables * slots_per_table < n:
            sys.exit(
                f"ERROR: NUM_TABLES={num_tables} too small. "
                f"{n} projects × {SLOT_MINUTES} min need at least {min_tables} tables "
                f"in this {total_minutes}-min window."
            )
        tables_label = f"{num_tables}  (override; min required: {min_tables})"

    rows = assign_schedule(projects, num_tables, slots_per_table, start_dt, SLOT_MINUTES)
    validate(rows, n)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    write_participants(OUTPUT_DIR, rows)
    write_master(OUTPUT_DIR, rows)
    write_per_table(OUTPUT_DIR, rows, num_tables)

    print("HackTech Judging Schedule")
    print("-" * 40)
    print(f"Eligible projects:    {n}")
    print(f"Time window:          {START_TIME} – {END_TIME} ({total_minutes} min)")
    print(f"Slot length:          {SLOT_MINUTES} min  ({PITCH_MINUTES} min pitch + {SLOT_MINUTES - PITCH_MINUTES} min buffer)")
    print(f"Slots per table:      {slots_per_table}")
    print(f"Tables:               {tables_label}")
    print(f"Output written to:    {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
