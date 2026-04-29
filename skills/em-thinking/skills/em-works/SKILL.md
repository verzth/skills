---
name: em-works
description: Translate edd.md into execution-ready handoff package — atomic ticket breakdown, worktree parallelization lanes, environment & secrets specification, and deployment strategy artifact. Use after /em-plan produces a plan and before engineers start coding, when a plan needs ticket-level decomposition for sprint planning, when prepping multi-engineer parallel work, or when documenting deploy strategy for future devops execution. Prepares artifact only — does not execute deployment (handoff to release/deploy role, skill matched per env).
---

# /em-works

Translate `edd.md` → execution-ready handoff package. Output `eng-works.md` siap di-distribute ke `engineer` role untuk implement, plus deployment plan artifact yang siap dipake `release-engineer` / `devops` role.

Scope penting: **em-works prepare artifact, gak execute deployment.** Provisioning secrets, creating feature flags, applying migrations, running rollout — itu devops territory.

## ⚠ Question Format Rule

Lihat [../../ETHOS.md](../../ETHOS.md) prinsip #8. Numbered questions, AskUserQuestion kalau available.

## Kapan trigger skill ini

- Otomatis setelah `/em-plan` selesai (seamless handoff)
- "Plan udah lock, mau breakdown ke ticket level"
- "Ada plan, mau prep buat sprint planning"
- "Mau distribute kerjaan ke 3 engineer paralel — butuh lane plan"
- "Implementation udah jalan, butuh deploy artifact buat hand off ke devops"

## Workflow — 4 phase

### Phase 1 — Task Breakdown

#### Step 1: Read edd.md

Baca dari working dir atau path yang user kasih. Kalau gak ada → **berhenti**. em-works gak start dari blank — selalu dari plan yang udah di-frame.

#### Step 2: Atomic ticket decomposition

Pecah scope eng-plan jadi atomic tickets. Per ticket:

- **What:** 1 deliverable, measurable, ≤ 2 days work (smaller better)
- **Why:** Connect ke eng-plan invariant atau failure mode # spesifik
- **Acceptance criteria:** Test cases + behavioral expectations + observability check
- **Dependencies:** Ticket lain yang harus done dulu (be explicit, not implicit)
- **Owner suggestion:** Based on module ownership kalau team punya context, atau "any IC"
- **Touched modules:** Directories (controllers/, models/) — bukan file spesifik
- **Estimate ballpark:** Hour / Day / >2 days (kalau >2 days, split lagi)

#### Step 3: Apply Beck principle

> "Make the change easy, then make the easy change." — Kent Beck

Refactor ticket selalu **sebelum** feature ticket. Jangan bundle keduanya di 1 ticket.

✅ Good:
- T1: Refactor PaymentService extract idempotency key handling (no behavior change)
- T2: Add new payment provider X (using extracted idempotency)

❌ Bad:
- T1: Refactor PaymentService and add provider X (mixed structural + behavioral)

#### Step 4: Glue work flag

Identify ticket yang invisible coordination:
- Migration scripts
- Test fixtures
- Documentation updates
- CI/CD config
- Monitoring dashboard creation
- Runbook writing

**Visible them.** Distribute fairly across team — jangan biarin 1 person stuck doing only glue (anti-pattern, Reilly's *The Staff Engineer's Path*).

### Phase 2 — Worktree / Parallelization Lanes

Forcing questions:

1. **Lane analysis** — tickets share module?
   - a) Yes → same lane (sequential within lane)
   - b) No + no dep → separate lane (parallel)
   - c) Yes but read-only overlap → parallel ok dengan flag

2. **Conflict flag** — 2 lane nyentuh module yang sama?
   - a) Sequential (safer)
   - b) Coordinate explicitly (require sync points)
   - c) Refactor module dulu jadi 2 sub-modules (separate ticket)

#### Output lanes table

| Lane | Tickets | Modules | Depends on | Worktree branch suggestion |
|------|---------|---------|------------|----------------------------|
| A | T1 → T2 | controllers/, models/ | — | feature/payments-providers |
| B | T3 | utils/ | — | refactor/idempotency-helper |
| C | T4 | infra/ | A done | infra/payments-rollout |

#### Execution order

Format: "Launch A + B parallel via worktree. Merge both. Then C."

Kalau Claude Code Agent dengan `isolation: "worktree"` available, suggest pake itu untuk lane A & B.

### Phase 3 — Environment & Secrets Specification

> Penting: em-works **specify what's needed**, gak provisioning. Provisioning = devops skill.

Per env (local / staging / prod), spec berikut:

#### Env vars table

| Var | Local | Staging | Prod | Sensitive? | Owner |
|-----|-------|---------|------|------------|-------|
| `DB_URL` | `.env.local` | `secrets/staging/db-url` | `secrets/prod/db-url` | Yes | infra-team |
| `EXTERNAL_API_KEY` | `.env.local` | `secrets/staging/api-key` | `secrets/prod/api-key` | Yes | api-team |
| `FEATURE_FLAG_X_DEFAULT` | `false` | `false` | `false` | No | feature-owner |

#### Secrets spec

| Secret | Storage location | Rotation policy | Access list | Pre-handoff status |
|--------|------------------|-----------------|-------------|---------------------|
| `db-url-prod` | AWS Secrets Manager | 90 days | infra-team, app-pods | TODO: provision |

Status keywords:
- `TODO: provision` — devops perlu create
- `TODO: rotate` — exists but butuh rotation
- `READY` — confirmed exists & accessible
- `DEPRECATED` — old secret yang harus di-remove post-deploy

#### Infra prereqs checklist

- [ ] Database schema migration prepared (file: `migrations/202X-XX-XX-name.sql`)
- [ ] Queue/topic creation spec (broker URL placeholder, dead-letter topic name)
- [ ] Feature flag definition (name: `payment.provider_x.enabled`, default: `false`, owner: `payments-team`)
- [ ] Monitoring dashboard plan (metrics: latency P50/P99, error rate, throughput)
- [ ] Alert rule plan (threshold: error rate > 1% / 5min, escalation: PagerDuty payments-oncall)
- [ ] Runbook draft (link or path)

Status untuk setiap item: `READY` / `TODO` / `BLOCKED (waiting on X)`.

Forcing questions:

1. **Secrets status:** Prod secret X — udah exist atau perlu provision?
   - a) Ready (link to Secrets Manager entry)
   - b) Need provisioning (assign to devops)
   - c) Need rotation (current secret valid until ...)

2. **Feature flag default:** apa?
   - a) Off (recommended — safest rollout)
   - b) On (justify — usually only for refactor with no behavior change)
   - c) Per-env (off in prod, on in staging — for testing)

3. **Migration approach:**
   - a) Backwards-compatible (add column nullable, then later make NOT NULL)
   - b) Single-step (acceptable risk, T2 only)
   - c) Multi-deploy coordinated (T0/T1 with high data volume)

### Phase 4 — Deployment Plan Artifact

> em-works **write the plan**, gak execute. Execution = `release-engineer` / `devops` role.

Cognitive patterns aktif:
- **Reversibility preference** — feature flag, canary, blue-green, incremental rollout
- **Error budgets over uptime** — what's the budget to spend on this rollout?
- **Own your code in production** — siapa on-call window pertama?

#### Deploy strategy

Pick one + justify:

- **Feature flag toggle** — code deploys disabled, flag flips per cohort. Lowest risk. Default for T0/T1 with user-facing behavior change.
- **Canary** — deploy to small % of traffic, observe, expand. Use when no flag-friendly UX boundary.
- **Blue-green** — full new env, switchover. Use when DB schema change or breaking API.
- **Big bang** — deploy + activate. Acceptable for T2/T3 only with low blast radius.

#### Rollback procedure

- **Trigger conditions:** explicit threshold (error rate, latency P99, manual decision)
- **Procedure:** step-by-step, target < 5 minute execution
- **Data implications:** kalau migration involved, rollback procedure for data juga (forward-compat data, backfill plan, dll.)
- **Communication:** who to notify, channel

#### Monitoring window

- **First 24h:** dedicated on-call attention, error rate watch
- **First 7 days:** check metric drift weekly review
- **Sign-off criteria:** error rate baseline, latency baseline, no incident → safe to remove canary / fully ramp flag

#### Comms plan

- **Pre-deploy:** announce window, scope, rollback strategy (Slack channel, email, status page)
- **During:** live status update per phase
- **Post-deploy:** retrospective summary, metric snapshot

### Phase 5 — Pre-Handoff Checklist

Sebelum handoff ke engineer, validate:

- [ ] All tickets have clear acceptance criteria
- [ ] Lane plan unambiguous (no orphan tickets, no overlapping module conflict unresolved)
- [ ] Env vars + secrets table complete with status
- [ ] Infra prereqs status: minimum READY or with explicit owner+ETA for TODO items
- [ ] CI green on baseline branch (link to last green build)
- [ ] Test fixture data prepared (link or path)
- [ ] Monitoring dashboard plan documented (will be implemented during impl phase)
- [ ] Rollback procedure documented
- [ ] On-call window-1 owner identified

Kalau ada item belum READY → flag explicitly. Engineer bisa start ticket yang gak depend on missing item.

## Output: `eng-works.md`

```markdown
# Eng Works: [topic]

**Date:** YYYY-MM-DD
**Plan source:** edd.md (path)
**Risk tier:** Tx (inherited from plan)
**Prepared by:** em-works

---

## TL;DR

- **Total tickets:** N
- **Lanes:** A (sequential) | B (parallel A) | C (after A done)
- **Deploy strategy:** [feature-flag / canary / blue-green / big-bang]
- **Pre-handoff blockers:** N (must clear before engineer starts)
- **Handoff status:** READY / BLOCKED (reason)

---

## Tickets

### T1 — [name]

- **What:** [1-line deliverable]
- **Why:** Implements invariant #X / closes failure mode #Y from eng-plan
- **Acceptance:**
  - [ ] [test case 1]
  - [ ] [test case 2]
  - [ ] [observability check — log/metric emitted]
- **Dependencies:** —
- **Modules:** controllers/, models/
- **Owner suggestion:** [name / "any IC"]
- **Estimate:** ~1 day
- **Glue work:** [yes — what type / no]

### T2 — [name]
...

---

## Parallelization Plan

### Lanes

| Lane | Tickets | Modules | Depends on | Worktree branch |
|------|---------|---------|------------|-----------------|

### Execution order

[Narrative: "Launch A + B parallel via worktree. Merge both. Then C."]

### Conflict flags

[List any cross-lane risks + mitigation]

---

## Environment & Secrets

### Env vars

| Var | Local | Staging | Prod | Sensitive? | Owner |
|-----|-------|---------|------|------------|-------|

### Secrets

| Secret | Storage | Rotation | Access | Status |
|--------|---------|----------|--------|--------|

### Infra prereqs

- [ ] [item 1] — Status: READY / TODO (owner) / BLOCKED (reason)

---

## Deployment Plan Artifact

### Strategy
**Pick:** [feature-flag / canary / blue-green / big-bang]
**Rationale:** ...

### Rollback procedure
- **Trigger:** [explicit threshold]
- **Steps:**
  1. ...
  2. ...
- **Target time:** < 5 min
- **Data rollback:** [if migration involved]
- **Comms:** [who to notify, channel]

### Monitoring window
- **First 24h:** [on-call assignment]
- **First 7 days:** [review cadence]
- **Sign-off criteria:** [explicit metrics + thresholds]

### Comms plan
- **Pre-deploy:** [channels + scope statement]
- **During:** [status update cadence]
- **Post-deploy:** [retrospective trigger]

---

## Pre-Handoff Checklist

- [ ] All tickets have clear acceptance criteria
- [ ] Lane plan unambiguous
- [ ] Env vars table complete
- [ ] Secrets table complete with status
- [ ] Infra prereqs minimum READY or explicit TODO owner+ETA
- [ ] CI green on baseline (link)
- [ ] Test fixtures ready (link)
- [ ] Monitoring dashboard plan documented
- [ ] Rollback procedure documented
- [ ] On-call window-1 owner identified

---

## Forcing Questions Raised

| # | Phase | Question | Response | Resolution |
|---|-------|----------|----------|------------|

---

## Handoff

### Per ticket → `engineer` role
- Tickets ready: T1, T2, T3
- Tickets blocked: T4 (reason: waiting on infra prereq X)
- Skill matched per env (env-team picks the engineer skill that handles this role)

### After implementation → /em-review
- Per PR atau batch end-of-lane
- Mode: review (standard) atau debug (kalau bug emerge)

### Deployment → `release-engineer` / `devops` role
- Deploy artifact ready: deployment plan section di atas
- Pre-deploy validation: monitoring window owner confirmed, rollback procedure tested in staging
- Skill matched per env (env-team picks the deploy/release skill that handles this role)

---

**Generated by:** em-works
**Ready for:** Engineer skill (per ticket) + future devops skill (per deploy plan)
```

## Integration dengan tools

| Kondisi | Behavior |
|---------|----------|
| Notion MCP connected | Tawarin push `eng-works.md` ke Notion engineering page; tickets bisa di-mirror jadi Notion database row |
| Linear MCP connected | Tawarin create Linear issue per ticket dengan dependency link |
| ClickUp / Monday MCP connected | Same — bulk task creation |
| GitHub MCP connected | Tawarin create issue per ticket di repo target |
| Pencil MCP connected | Tawarin generate visual lane diagram dari ASCII |
| Tidak ada MCP | File saved as local `eng-works.md`, user copy manual ke task tracker |

## Anti-pattern (jangan dilakuin)

- ❌ **"Implementation: TBD"** — gak ticket-level breakdown. Output gak handoff-able.
- ❌ **Skip env/secrets spec.** Engineer stuck di local setup, lose 2 day cycle time.
- ❌ **Bundle refactor + feature di 1 ticket.** Anti Beck principle.
- ❌ **Big bang deploy untuk T0/T1.** Sin. Always feature-flag atau canary.
- ❌ **Rollback = "git revert" tanpa data consideration.** Migration rollback butuh data plan.
- ❌ **Ticket >2 day estimate yang gak di-split.** Atomicity broken.
- ❌ **Glue work invisible.** Bikin 1 person stuck doing only glue, anti-pattern Reilly.
- ❌ **Lane plan dengan 2 lane share module tanpa conflict flag.** Bakal ada merge hell.
- ❌ **Execute deployment di em-works.** Out of scope. Hand off ke devops skill.

## Handoff

- **Per ticket** → `engineer` role (skill matched per env).
- **PR comes back** → `/em-review` (per ticket atau batch end-of-lane).
- **Deploy artifact ready** → `release-engineer` / `devops` role (skill matched per env).

Kalau pre-handoff checklist gak lengkap (banyak BLOCKED items), output flag "BLOCKED" di TL;DR — engineer jangan start sampai blockers cleared. Loop balik ke `devops` / `infra-owner` sebelum handoff.
