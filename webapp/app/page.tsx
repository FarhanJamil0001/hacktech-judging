import Link from "next/link";
import { readSchedule } from "@/lib/data";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { JudgingInfo } from "@/components/JudgingInfo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const schedule = await readSchedule();
  const hasData = schedule.projects.length > 0;

  return (
    <div>
      <header className="pt-12 pb-6">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          <span className="bg-htech-gradient bg-clip-text text-transparent">
            HackTech
          </span>{" "}
          <span className="text-htech-text-strong">Judging Expo</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-htech-text">
          Your <strong className="text-htech-text-strong">project number</strong> is the # shown
          on this site. Use it to find your{" "}
          <strong className="text-htech-text-strong">expo time slot and table</strong> at the
          Bechtel Center—search or filter by prize below.
        </p>
        {schedule.config ? (
          <p className="mt-2 text-sm text-htech-text-muted">
            Window: {schedule.config.startTime}–{schedule.config.endTime} ·{" "}
            {schedule.config.slotMinutes} min slots ({schedule.config.pitchMinutes} min pitch
            + {schedule.config.slotMinutes - schedule.config.pitchMinutes} min buffer) ·{" "}
            {schedule.meta?.numTables ?? "?"} tables
          </p>
        ) : null}
      </header>

      {hasData ? (
        <>
          <div className="mt-6">
            <JudgingInfo judgingEndTime={schedule.config?.endTime} />
          </div>
          <SearchAndFilter
            projects={schedule.projects}
            prizeCatalog={schedule.prizeCatalog}
          />
        </>
      ) : (
        <div className="mt-10 rounded-xl border border-htech-orange-border/40 bg-htech-bg-2 p-10 text-center">
          <p className="font-display text-xl text-htech-text-strong">
            No schedule has been published yet.
          </p>
          <p className="mt-2 text-htech-text-muted">
            Organizers can publish a schedule from the Admin page.
          </p>
          <Link
            href="/admin"
            className="mt-5 inline-block rounded bg-htech-orange px-5 py-2 font-display text-sm text-htech-bg hover:bg-htech-orange-light"
          >
            Go to Admin
          </Link>
        </div>
      )}
    </div>
  );
}
