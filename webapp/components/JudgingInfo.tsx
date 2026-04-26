import { BECHTEL_MAPS_URL, VENUE_NAME } from "@/lib/judging";

type Props = {
  /** e.g. config endTime — shown in sponsor copy */
  judgingEndTime?: string | null;
};

export function JudgingInfo({ judgingEndTime }: Props) {
  const endPhrase = judgingEndTime
    ? ` before judging ends (${judgingEndTime}).`
    : " any time before judging ends.";

  return (
    <aside className="rounded-xl border border-htech-orange-border/50 bg-htech-bg-2 p-5 text-sm text-htech-text">
      <h2 className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
        Judging location & prize check-ins
      </h2>
      <p className="mt-3 text-htech-text">
        <span className="font-display font-semibold text-htech-text-strong">
          Expo / time-slot judging
        </span>{" "}
        (your assigned table and slot) is at the{" "}
        <a
          href={BECHTEL_MAPS_URL}
          target="_blank"
          rel="noreferrer"
          className="text-htech-orange hover:underline"
        >
          {VENUE_NAME} (Google Maps)
        </a>
        .
      </p>
      <p className="mt-3 text-htech-text">
        <span className="font-display font-semibold text-htech-text-strong">Sponsor prizes</span>{" "}
        (everything <em>not</em> labeled <span className="whitespace-nowrap">[MLH]</span>): visit the
        appropriate{" "}
        <span className="font-display text-htech-orange-light">sponsor tables</span> in person
        {endPhrase}
      </p>
      <p className="mt-3 text-htech-text">
        <span className="font-display font-semibold text-htech-text-strong">MLH tracks</span>{" "}
        (categories that start with <span className="whitespace-nowrap">[MLH]</span>
        ): judging for those happens{" "}
        <span className="font-display text-htech-text-strong">online</span>, not at sponsor tables in
        the room.
      </p>
    </aside>
  );
}
