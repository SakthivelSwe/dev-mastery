# Archived DevMastery specs

⚠️ **The documents in this folder are historical.** They describe earlier
architectural iterations that have since been superseded. Do NOT feed them to
AI agents as the source of truth — they will regenerate code targeting a stack
we no longer use.

## What is current

| Concern | Current source of truth |
|---|---|
| Architecture, deployment, cost | [`README.md`](../../README.md) |
| Content-authoring rules (9-section schema) | [`SKILL.md`](../../SKILL.md) |
| Roadmap of new features | [`docs/ROADMAP.md`](../ROADMAP.md) |

## What is superseded

| Archived file | Why it's obsolete |
|---|---|
| `DEVMASTERY_PROJECT_SPEC_v1.md` | Described a Kafka + OpenSearch + Judge0 + MinIO + K3s microservice stack. The project is now a **modular monolith** on Render + Supabase (see README). |
| `DEVMASTERY_ROADMAP_Complete_details.md` | Long-form roadmap from the microservice era — kept for historical context. |
| `DEVMASTERY_ROADMAP_INTEGRATION.md` (+ parts 2 and 3) | Integration playbook for the microservice split. Some algorithmic content (learning-path definitions, sample MDX) is still useful; treat as reference only. |
| `SKILL_VISUAL.md` | Earlier draft of the visualizer configuration guide. Its rules are already merged into [`SKILL.md`](../../SKILL.md) §3. |

## When to consult them anyway

- Curriculum design choices ("why 6 layers per topic", "the 7 learning paths")
- Historical rationale for tech-stack decisions
- Sample MDX authored during the microservice era (still schema-compatible)

If you need to migrate a section from an archived file into the current spec,
open a PR against `README.md`, `SKILL.md`, or `docs/ROADMAP.md`.

