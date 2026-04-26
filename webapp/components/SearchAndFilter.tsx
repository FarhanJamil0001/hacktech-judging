"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

type Props = {
  projects: Project[];
  prizeCatalog: string[];
};

export function SearchAndFilter({ projects, prizeCatalog }: Props) {
  const [query, setQuery] = useState("");
  const [activePrizes, setActivePrizes] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const qRaw = query.trim();
    const q = qRaw.toLowerCase();
    return projects.filter((p) => {
      if (q) {
        const asNum = qRaw.replace(/^#/, "").trim();
        const onlyDigits = /^\d+$/.test(asNum);
        if (onlyDigits && p.number === Number(asNum)) {
          // exact project number
        } else {
          const hay = `${p.title} ${p.builtWith.join(" ")} #${p.number} ${p.number}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
      }
      if (activePrizes.size > 0) {
        const hit = p.prizeNames.some((n) => activePrizes.has(n));
        if (!hit) return false;
      }
      return true;
    });
  }, [projects, query, activePrizes]);

  function togglePrize(p: string) {
    setActivePrizes((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  function clearAll() {
    setQuery("");
    setActivePrizes(new Set());
  }

  return (
    <section className="mt-6 flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-xl border border-htech-orange-border/40 bg-htech-bg-2 p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by project number, name, or tech…"
          className="w-full rounded border border-htech-orange-border/40 bg-htech-bg-3 px-4 py-3 font-body text-htech-text-strong placeholder:text-htech-text-muted focus:border-htech-orange focus:outline-none"
        />
        {prizeCatalog.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted self-center pr-1">
              Filter prizes
            </span>
            {prizeCatalog.map((p) => {
              const on = activePrizes.has(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePrize(p)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    on
                      ? "border-htech-orange bg-htech-orange text-htech-bg"
                      : "border-htech-orange-border/50 bg-htech-bg-3 text-htech-text hover:border-htech-orange hover:text-htech-orange"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            {(query || activePrizes.size > 0) && (
              <button
                onClick={clearAll}
                className="ml-2 text-xs text-htech-text-muted underline hover:text-htech-orange"
              >
                clear
              </button>
            )}
          </div>
        ) : null}
        <div className="text-sm text-htech-text-muted">
          Showing <span className="text-htech-text-strong">{filtered.length}</span>{" "}
          of {projects.length} projects
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-htech-orange-border/30 bg-htech-bg-2 p-10 text-center">
          <p className="font-display text-xl text-htech-text-strong">No projects match.</p>
          <button
            onClick={clearAll}
            className="mt-4 rounded bg-htech-orange px-4 py-2 font-display text-sm text-htech-bg hover:bg-htech-orange-light"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.number} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}
