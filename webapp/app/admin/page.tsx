"use client";

import { useState } from "react";
import type { Schedule, ScheduleConfig } from "@/lib/types";

const DEFAULT_CONFIG: ScheduleConfig = {
  startTime: "10:00",
  endTime: "13:00",
  slotMinutes: 10,
  pitchMinutes: 5,
  eligibleStatuses: ["Submitted (Gallery/Visible)"],
  numTables: null,
  randomSeed: "42",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  return authed ? <AdminPanel /> : <LoginGate onSuccess={() => setAuthed(true)} />;
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setSubmitting(false);
    if (res.ok) onSuccess();
    else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Login failed");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-20 w-full max-w-sm rounded-xl border border-htech-orange-border/40 bg-htech-bg-2 p-6"
    >
      <h1 className="font-display text-2xl text-htech-text-strong">Admin login</h1>
      <p className="mt-1 text-sm text-htech-text-muted">
        Enter the shared organizer password.
      </p>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Password"
        className="mt-4 w-full rounded border border-htech-orange-border/40 bg-htech-bg-3 px-3 py-2 text-htech-text-strong focus:border-htech-orange focus:outline-none"
        autoFocus
      />
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded bg-htech-orange px-4 py-2 font-display text-sm text-htech-bg disabled:opacity-50"
      >
        {submitting ? "…" : "Log in"}
      </button>
    </form>
  );
}

function AdminPanel() {
  const [config, setConfig] = useState<ScheduleConfig>(DEFAULT_CONFIG);
  const [csv, setCsv] = useState<File | null>(null);
  const [preview, setPreview] = useState<Schedule | null>(null);
  const [busy, setBusy] = useState<"idle" | "previewing" | "publishing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  function update<K extends keyof ScheduleConfig>(k: K, v: ScheduleConfig[K]) {
    setConfig((c) => ({ ...c, [k]: v }));
  }

  async function doPreview() {
    setError(null);
    setPublishedUrl(null);
    if (!csv) {
      setError("Choose a CSV file first.");
      return;
    }
    setBusy("previewing");
    const fd = new FormData();
    fd.append("csv", csv);
    fd.append("config", JSON.stringify(config));
    const res = await fetch("/api/admin/preview", { method: "POST", body: fd });
    setBusy("idle");
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "Preview failed");
      setPreview(null);
      return;
    }
    setPreview(body.schedule);
  }

  async function doPublish() {
    if (!preview) return;
    setError(null);
    setPublishedUrl(null);
    setBusy("publishing");
    const res = await fetch("/api/admin/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ schedule: preview }),
    });
    setBusy("idle");
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "Publish failed");
      return;
    }
    setPublishedUrl(body.commitUrl || body.contentUrl || null);
  }

  return (
    <div className="pt-10">
      <h1 className="font-display text-3xl font-bold text-htech-text-strong">
        Admin
      </h1>
      <p className="mt-1 text-sm text-htech-text-muted">
        Upload the latest Devpost CSV, choose a window, preview, and publish.
      </p>

      <section className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-htech-orange-border/40 bg-htech-bg-2 p-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
            Devpost CSV
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setCsv(e.target.files?.[0] ?? null)}
            className="rounded border border-htech-orange-border/40 bg-htech-bg-3 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-htech-orange file:px-3 file:py-1 file:font-display file:text-sm file:text-htech-bg"
          />
        </label>

        <NumberOrTime label="Start time" value={config.startTime} onChange={(v) => update("startTime", v)} />
        <NumberOrTime label="End time" value={config.endTime} onChange={(v) => update("endTime", v)} />

        <NumberInput label="Slot minutes" value={config.slotMinutes} onChange={(v) => update("slotMinutes", v)} />
        <NumberInput label="Pitch minutes" value={config.pitchMinutes} onChange={(v) => update("pitchMinutes", v)} />

        <label className="flex flex-col gap-1">
          <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
            Number of tables (blank = auto)
          </span>
          <input
            type="number"
            min={1}
            value={config.numTables ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              update("numTables", v === "" ? null : Number(v));
            }}
            className="rounded border border-htech-orange-border/40 bg-htech-bg-3 px-3 py-2 text-htech-text-strong focus:border-htech-orange focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
            Random seed
          </span>
          <input
            type="text"
            value={config.randomSeed}
            onChange={(e) => update("randomSeed", e.target.value)}
            className="rounded border border-htech-orange-border/40 bg-htech-bg-3 px-3 py-2 text-htech-text-strong focus:border-htech-orange focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
            Eligible statuses (one per line)
          </span>
          <textarea
            rows={2}
            value={config.eligibleStatuses.join("\n")}
            onChange={(e) =>
              update(
                "eligibleStatuses",
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="rounded border border-htech-orange-border/40 bg-htech-bg-3 px-3 py-2 font-mono text-sm text-htech-text-strong focus:border-htech-orange focus:outline-none"
          />
        </label>

        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            onClick={doPreview}
            disabled={busy !== "idle"}
            className="rounded bg-htech-orange px-4 py-2 font-display text-sm text-htech-bg disabled:opacity-50"
          >
            {busy === "previewing" ? "…" : "Preview"}
          </button>
          <button
            onClick={doPublish}
            disabled={busy !== "idle" || !preview}
            className="rounded border border-htech-orange-border px-4 py-2 font-display text-sm text-htech-orange hover:bg-htech-bg-3 disabled:opacity-50"
          >
            {busy === "publishing" ? "…" : "Publish to GitHub"}
          </button>
          {error ? <span className="text-sm text-red-400">{error}</span> : null}
          {publishedUrl ? (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-htech-orange hover:underline"
            >
              Published ↗
            </a>
          ) : null}
        </div>
      </section>

      {preview ? <PreviewPane schedule={preview} /> : null}
    </div>
  );
}

function NumberOrTime({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-htech-orange-border/40 bg-htech-bg-3 px-3 py-2 text-htech-text-strong focus:border-htech-orange focus:outline-none"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
        {label}
      </span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-htech-orange-border/40 bg-htech-bg-3 px-3 py-2 text-htech-text-strong focus:border-htech-orange focus:outline-none"
      />
    </label>
  );
}

function PreviewPane({ schedule }: { schedule: Schedule }) {
  return (
    <section className="mt-6 rounded-xl border border-htech-orange-border/40 bg-htech-bg-2 p-5">
      <h2 className="font-display text-xl text-htech-text-strong">Preview</h2>
      <p className="mt-1 text-sm text-htech-text-muted">
        {schedule.meta?.eligibleCount} eligible projects · {schedule.meta?.numTables} tables ·{" "}
        {schedule.meta?.slotsPerTable} slots/table · {schedule.prizeCatalog.length} prize chips
      </p>
      <div className="mt-4 max-h-96 overflow-auto rounded border border-htech-orange-border/40 bg-htech-bg-3">
        <table className="w-full text-left text-sm">
          <thead className="font-display text-xs uppercase tracking-wider text-htech-text-muted">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Table</th>
              <th className="px-3 py-2">Slot</th>
            </tr>
          </thead>
          <tbody>
            {schedule.projects.map((p) => (
              <tr key={p.number} className="border-t border-htech-orange-border/20">
                <td className="px-3 py-1.5 font-display text-htech-orange">#{p.number}</td>
                <td className="px-3 py-1.5">{p.title}</td>
                <td className="px-3 py-1.5">{p.table}</td>
                <td className="px-3 py-1.5 text-htech-text-muted">
                  {p.slotStart}–{p.slotEnd}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
