import { BECHTEL_MAPS_URL, VENUE_NAME } from "@/lib/judging";

type Props = {
  table: number;
  slotStart: string;
  slotEnd: string;
  pitchMinutes?: number;
  className?: string;
};

export function ScheduleSlot({ table, slotStart, slotEnd, pitchMinutes, className }: Props) {
  return (
    <div
      className={`inline-flex flex-col gap-1 rounded-lg border border-htech-orange-border bg-htech-bg-2 px-4 py-3 ${className ?? ""}`}
    >
      <div className="flex items-baseline gap-3">
        <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
          Where
        </span>
        <a
          href={BECHTEL_MAPS_URL}
          target="_blank"
          rel="noreferrer"
          className="font-display text-sm font-semibold text-htech-orange hover:underline"
        >
          {VENUE_NAME}
        </a>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
          Table
        </span>
        <span className="font-display text-2xl font-bold text-htech-orange">
          {table}
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
          Slot
        </span>
        <span className="font-display text-lg text-htech-text-strong">
          {slotStart}<span className="text-htech-text-muted">–</span>{slotEnd}
        </span>
      </div>
      {pitchMinutes ? (
        <div className="text-xs text-htech-text-muted">
          {pitchMinutes} min pitch · arrive a minute early
        </div>
      ) : null}
    </div>
  );
}
