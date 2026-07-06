# `scripts/` — DevMastery Tooling Index

This folder holds every Node/TypeScript/PowerShell script the project uses.
Everything is grouped by purpose below so you know which are safe to run and
which are archive-only.

---

## ✅ Active / supported tools

Run these from the repo root. All are wired into `package.json` scripts where
practical.

| Script | Command | Purpose |
| --- | --- | --- |
| [`audit-content-health.js`](audit-content-health.js) | `npm run content:audit` | Score every MDX topic against the 9-section schema (SKILL.md). Writes `apps/web/content/_audit/health.json` + `.md`. Enforced in CI by `.github/workflows/content-health.yml`. |
| [`auto-fix-content.js`](auto-fix-content.js) | `npm run content:autofix <path> [limit]` | Read the health report, ask Gemini to rewrite missing/shallow sections for the worst topics, save *proposals* under `apps/web/content/_audit/proposals/`. Requires `GEMINI_API_KEY` (or `DRY_RUN=1`). |
| [`auditAllPaths.js`](auditAllPaths.js) | `node scripts/auditAllPaths.js` | Prints per-path topic counts + 9-section completeness (as tracked in SKILL.md). |
| [`regenerateGFGContent.ts`](regenerateGFGContent.ts) | `npm run content:generate[:<path>]` | Regenerate one or all learning paths from source templates. |
| [`importContentDirect.js`](importContentDirect.js) | `npm run content:import` | Push MDX files into Supabase (bypasses backend). |
| [`apply-visualizer-configs.js`](apply-visualizer-configs.js) | `node scripts/apply-visualizer-configs.js [--import]` | Splice per-topic `## VISUALIZATION_CONFIG` blocks using the batched config catalogues (all `visualizer-configs-*.js` files). |
| [`sync-has-visualizer.js`](sync-has-visualizer.js) | `node scripts/sync-has-visualizer.js` | Reconcile the `topics.has_visualizer` flag in Supabase with the MDX content. |
| [`verify-visualizer-sync.js`](verify-visualizer-sync.js) | `node scripts/verify-visualizer-sync.js` | Report drift between the MDX visualizer configs and the DB. |
| [`probe-endpoints.ps1`](probe-endpoints.ps1) | `pwsh scripts/probe-endpoints.ps1` | Smoke-test the live backend API surface. |
| [`verify-platform.ps1`](verify-platform.ps1) | `pwsh scripts/verify-platform.ps1` | End-to-end platform health check (backend + Supabase + Gemini). |

---

## 📦 Visualizer batch catalogues

Files matching `visualizer-configs-*.js` are **data**, not tools — they are
loaded automatically by `apply-visualizer-configs.js` via `readdirSync`. Do
NOT rename or move them without updating that loader. They were split into
batches during initial seeding to keep individual files under 5000 lines.

---

## 🗂️ Legacy — one-shot scripts (`scripts/legacy/`)

Everything under [`scripts/legacy/`](./legacy/) was written for a single
migration or investigation and is no longer part of any workflow. Kept for
historical reference. Includes:

- `check-*.js` / `check_*.js` — one-off DB probes ("does path X have all its
  topics?", "which topics are missing sections?").
- `_fix-*.js` / `fix-*.js` — one-shot content patchers used during the great
  9-section migration.
- `debug-*.js` — throwaway debuggers written during specific bug hunts.
- `audit_java_sections.js` — superseded by the general `audit-content-health.js`.

Do NOT delete this folder without confirming nothing in a runbook still points
at these filenames.

---

## 🧭 When adding a new script

1. Give it a clear name — `<action>-<subject>.js`, e.g. `import-microservices.js`.
2. If it's a one-off, drop it directly into `scripts/legacy/` from the start.
3. If it's ongoing, register a wrapper in `package.json` and add a row here.
4. Never write to production data without a `--dry-run` mode.
5. Never commit secrets — read them from env vars.

