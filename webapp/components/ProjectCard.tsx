import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.number}`}
      className="group flex flex-col gap-3 rounded-xl border border-htech-orange-border/30 bg-htech-bg-2 p-5 shadow-htech transition hover:border-htech-orange hover:shadow-htech-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-bold text-htech-orange">
            #{project.number}
          </span>
          <span className="font-display text-xl text-htech-text-strong line-clamp-2">
            {project.title}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded border border-htech-orange-border/60 bg-htech-bg-3 px-2 py-0.5 text-htech-orange-light">
          Table {project.table}
        </span>
        <span className="rounded border border-htech-orange-border/60 bg-htech-bg-3 px-2 py-0.5 text-htech-text">
          {project.slotStart}–{project.slotEnd}
        </span>
        {project.university ? (
          <span className="text-htech-text-muted">{project.university}</span>
        ) : null}
      </div>
      {project.prizeNames.length ? (
        <div className="flex flex-wrap gap-1.5">
          {project.prizeNames.slice(0, 4).map((p) => (
            <span
              key={p}
              className="rounded-full border border-htech-orange-border/40 bg-htech-bg-3 px-2 py-0.5 text-xs text-htech-text-muted"
            >
              {p}
            </span>
          ))}
          {project.prizeNames.length > 4 ? (
            <span className="text-xs text-htech-text-muted">
              +{project.prizeNames.length - 4} more
            </span>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}
