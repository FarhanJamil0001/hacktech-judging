export type ScheduleConfig = {
  startTime: string;          // "HH:MM"
  endTime: string;            // "HH:MM"
  slotMinutes: number;
  pitchMinutes: number;
  eligibleStatuses: string[];
  numTables: number | null;   // null = auto
  /** When set (>=1), never assign more than this many projects per table, even if the time window could fit more. */
  maxProjectsPerTable?: number | null;
  randomSeed: string;         // string so we can pass any user-provided seed
};

export type Project = {
  number: number;
  title: string;
  devpostUrl: string;
  description: string;
  videoUrl: string;
  tryItUrls: string[];
  builtWith: string[];
  university: string;
  optInPrizes: string[];      // full strings, including reward
  prizeNames: string[];       // stripped to just the prize name
  table: number;
  slotStart: string;          // "HH:MM"
  slotEnd: string;            // "HH:MM"
};

export type Schedule = {
  generatedAt: string | null;
  config: ScheduleConfig | null;
  prizeCatalog: string[];     // sorted, deduped prize names
  projects: Project[];
  meta?: {
    eligibleCount: number;
    totalMinutes: number;
    /** Slots that fit in the time window before any per-table cap. */
    slotsFromWindow?: number;
    slotsPerTable: number;
    minTables: number;
    numTables: number;
  };
};

export type DevpostRow = {
  "Project Title"?: string;
  "Submission Url"?: string;
  "Project Status"?: string;
  "About The Project"?: string;
  '"Try it out" Links'?: string;
  "Video Demo Link"?: string;
  "Opt-In Prizes"?: string;
  "Built With"?: string;
  "Team Colleges/Universities"?: string;
  [key: string]: string | undefined;
};
