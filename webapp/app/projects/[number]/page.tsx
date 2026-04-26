import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { findProject, readSchedule } from "@/lib/data";
import { isMlhPrizeText } from "@/lib/judging";
import { ScheduleSlot } from "@/components/ScheduleSlot";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: { number: string };
}) {
  const number = Number(params.number);
  if (!Number.isFinite(number)) notFound();
  const schedule = await readSchedule();
  const project = findProject(schedule, number);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl pt-10">
      <Link
        href="/"
        className="font-display text-sm text-htech-text-muted hover:text-htech-orange"
      >
        ← All projects
      </Link>

      <header className="mt-4">
        <p className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
          Project number
        </p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6">
          <span className="font-display text-5xl font-bold text-htech-orange">
            #{project.number}
          </span>
          <h1 className="font-display text-3xl font-bold text-htech-text-strong sm:text-4xl">
            {project.title}
          </h1>
        </div>
      </header>

      <div className="mt-6">
        <ScheduleSlot
          table={project.table}
          slotStart={project.slotStart}
          slotEnd={project.slotEnd}
          pitchMinutes={schedule.config?.pitchMinutes}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.devpostUrl ? (
          <a
            href={project.devpostUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-htech-orange px-3 py-1.5 font-display text-sm text-htech-bg hover:bg-htech-orange-light"
          >
            Devpost ↗
          </a>
        ) : null}
        {project.videoUrl ? (
          <a
            href={project.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-htech-orange-border px-3 py-1.5 font-display text-sm text-htech-orange hover:bg-htech-bg-3"
          >
            Video demo ↗
          </a>
        ) : null}
        {project.tryItUrls.map((u) => (
          <a
            key={u}
            href={u}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-htech-orange-border/60 px-3 py-1.5 font-display text-sm text-htech-text hover:border-htech-orange hover:text-htech-orange"
          >
            {prettyUrl(u)} ↗
          </a>
        ))}
      </div>

      {project.builtWith.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
            Built with
          </span>
          {project.builtWith.map((t) => (
            <span
              key={t}
              className="rounded border border-htech-orange-border/40 bg-htech-bg-3 px-2 py-0.5 text-xs text-htech-text"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {project.optInPrizes.length ? (
        <OptInSections prizes={project.optInPrizes} endTime={schedule.config?.endTime} />
      ) : null}

      {project.description ? (
        <section className="prose prose-invert mt-8 max-w-none">
          <h2 className="font-display text-sm uppercase tracking-wider text-htech-text-muted">
            About the project
          </h2>
          <div className="mt-2 whitespace-pre-wrap font-body text-htech-text">
            <ReactMarkdown>{project.description}</ReactMarkdown>
          </div>
        </section>
      ) : null}
    </article>
  );
}

function OptInSections({
  prizes,
  endTime,
}: {
  prizes: string[];
  endTime?: string | null;
}) {
  const mlh = prizes.filter((p) => isMlhPrizeText(p));
  const sponsor = prizes.filter((p) => !isMlhPrizeText(p));
  const end = endTime ? ` before judging ends` : " any time before judging ends";

  return (
    <div className="mt-6 space-y-6">
      {sponsor.length > 0 ? (
        <div>
          <h2 className="font-display text-sm uppercase tracking-wider text-htech-text-muted">
            Sponsor prizes
          </h2>
          <p className="mt-1 text-sm text-htech-text">
            Go to the <strong className="text-htech-text-strong">sponsor tables</strong> in
            person{end} to be judged for these.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-htech-text">
            {sponsor.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {mlh.length > 0 ? (
        <div>
          <h2 className="font-display text-sm uppercase tracking-wider text-htech-text-muted">
            MLH tracks
          </h2>
          <p className="mt-1 text-sm text-htech-text">
            Judging for <span className="whitespace-nowrap">[MLH]</span> categories happens{" "}
            <strong className="text-htech-text-strong">online</strong> (not at tables in the room).
          </p>
          <ul className="mt-2 space-y-1 text-sm text-htech-text">
            {mlh.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function prettyUrl(u: string): string {
  try {
    const url = new URL(u);
    return url.host.replace(/^www\./, "");
  } catch {
    return u;
  }
}
