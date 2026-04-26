import Link from "next/link";
import { notFound } from "next/navigation";
import { projectsForTable, readSchedule, tableIds } from "@/lib/data";
import { BECHTEL_MAPS_URL, VENUE_NAME } from "@/lib/judging";

export const dynamic = "force-dynamic";

export default async function TablePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();
  const schedule = await readSchedule();
  const tables = tableIds(schedule);
  if (!tables.includes(id)) notFound();
  const slots = projectsForTable(schedule, id);

  return (
    <article className="pt-10">
      <Link
        href="/"
        className="font-display text-sm text-htech-text-muted hover:text-htech-orange no-print"
      >
        ← All projects
      </Link>

      <header className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-htech-text-strong">
          Table <span className="text-htech-orange">{id}</span>
        </h1>
        <nav className="flex flex-wrap items-center gap-2 font-display text-sm no-print">
          {tables.map((t) => (
            <Link
              key={t}
              href={`/tables/${t}`}
              className={`rounded px-3 py-1 ${
                t === id
                  ? "bg-htech-orange text-htech-bg"
                  : "border border-htech-orange-border/60 text-htech-text hover:border-htech-orange hover:text-htech-orange"
              }`}
            >
              Table {t}
            </Link>
          ))}
        </nav>
      </header>

      {schedule.config ? (
        <p className="mt-2 text-sm text-htech-text-muted">
          {slots.length} project{slots.length === 1 ? "" : "s"} · {schedule.config.slotMinutes} min slots
          ({schedule.config.pitchMinutes} min pitch + {schedule.config.slotMinutes - schedule.config.pitchMinutes} min buffer)
        </p>
      ) : null}

      <p className="mt-3 text-sm text-htech-text">
        Expo time-slot judging at the{" "}
        <a
          href={BECHTEL_MAPS_URL}
          target="_blank"
          rel="noreferrer"
          className="text-htech-orange hover:underline"
        >
          {VENUE_NAME}
        </a>{" "}
        (see map).
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-htech-orange-border/40 bg-htech-bg-2">
        <table className="w-full text-left">
          <thead className="bg-htech-bg-3 font-display text-xs uppercase tracking-wider text-htech-text-muted">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Project #</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Devpost</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((p) => (
              <tr
                key={p.number}
                className="border-t border-htech-orange-border/20 hover:bg-htech-bg-3"
              >
                <td className="px-4 py-3 font-display text-htech-orange-light">
                  {p.slotStart}–{p.slotEnd}
                </td>
                <td className="px-4 py-3 font-display text-htech-orange">#{p.number}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${p.number}`}
                    className="text-htech-text-strong hover:text-htech-orange"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  {p.devpostUrl ? (
                    <a
                      href={p.devpostUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-htech-orange hover:underline"
                    >
                      open ↗
                    </a>
                  ) : (
                    <span className="text-htech-text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
