# HackTech Judging Expo (Phase 2)

Next.js 14 web app that wraps the Phase 1 schedule generator with a
search/filter UI for participants, a per-table view for judges, and an
admin panel that uploads a Devpost CSV and publishes a new schedule by
committing `data/schedule.json` to this repo.

## Local dev

```bash
cd webapp
cp .env.example .env.local      # set ADMIN_PASSWORD at minimum
npm install
npm run seed                    # one-off: build initial data/schedule.json
npm run dev                     # http://localhost:3000
```

`npm run seed` reads the most recent `projects-hacktech-*.csv` it finds in
the parent directory and writes `data/schedule.json`. Override the time
window with env vars: `SEED_START`, `SEED_END`, `SEED_SLOT`, `SEED_PITCH`,
`SEED_TABLES`, `SEED_SEED`, `SEED_CSV`.

## Pages

- `/` — participant search/list (live search + prize chips)
- `/projects/[number]` — project detail + judging slot
- `/tables/[id]` — judges' queue for one table (print-friendly)
- `/admin` — password-gated upload + preview + publish

## Admin auth

`ADMIN_PASSWORD` is a single shared secret. The login route sets an
httpOnly cookie that authenticates subsequent admin API calls.

## Publish flow

`POST /api/admin/publish` writes the new schedule to GitHub via the
Octokit `createOrUpdateFileContents` API. Vercel's GitHub integration
auto-redeploys on commit, making the new schedule live in ~1 minute.

Required env vars for publish:

| Var | Notes |
| --- | --- |
| `GITHUB_TOKEN` | PAT with `repo` (or `contents:write`) scope |
| `GITHUB_REPO` | `owner/name` of the repo to commit into |
| `GITHUB_BRANCH` | default `main` |
| `GITHUB_DATA_PATH` | default `webapp/data/schedule.json` |

If these are unset the admin can still preview but publish will 500 with
a clear message.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, import the repo with the **Root Directory** set to `webapp`.
3. Set env vars (`ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_REPO`, etc.).
4. Deploy. The first deploy uses whatever is currently in
   `data/schedule.json`. Use `/admin` to publish updates.
