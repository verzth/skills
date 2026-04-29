# Changelog v1.3.0 — em-thinking Bundle

**Released:** 2026-04-29

## What's new

### New skill: `em-thinking` (v0.1.0)

AI-First Engineering Management bundle for tech-lead Engineering Managers. Companion to pm-thinking — picks up where PRD ends, produces Engineering Design Document (EDD) and downstream execution artifacts.

3 sub-skills:

- **`/em-plan`** — receive intake (PRD, design doc, bug repro, ad-hoc request) → produce `edd.md` with risk tier (T0-T3), scope challenge (Step-0 forcing questions borrowed from gstack), architecture (component boundaries, data flow, state machine, trust boundaries — all with ASCII diagrams), invariants, failure modes table, test strategy, cognitive patterns applied (min 2 cited).

- **`/em-works`** — translate `edd.md` → execution-ready handoff package: atomic tickets (Beck principle: refactor before feature, never bundle), worktree parallelization lanes, env/secrets specification (with status keywords: `READY`/`TODO: provision`/`BLOCKED`), deployment plan artifact (strategy + rollback + monitoring + comms). **Prepares artifact only — does not execute deployment.** Future devops skill (or existing `release-engineer`/`devops` role-matched skill) handles execution.

- **`/em-review`** — multi-mode review skill. Mode A: PR code review (4-section: Architecture / Code Quality / Tests / Performance, grounded di edd.md + eng-works.md, severity matrix Block/Major/Minor). Mode B: hypothesis-driven debug (5-step: Reproduce → Isolate → Hypothesize → Test → Diagnose, with iron rule "no fixes without root cause confirmed"). Auto-detect mode from input (PR ref → review; stack trace → debug; ambiguous → ask).

### 8 ETHOS principles

1. **AI-First EM = Reviewer & Synthesizer** (not Code Writer). EM ngarahin technical decision, AI nyusun review/plan/breakdown, EM ambil final call.
2. **Reduce Future Pain > Maximize Current Speed.** Compound velocity, not sprint velocity.
3. **Boring by Default, Innovation Tokens Are Scarce** (Tan/McKinley — 3 tokens per company).
4. **Boil the Lake** (Tan) — completeness when AI marginal cost ≈ 0.
5. **EM Owns Architecture & Scope** (not Implementation Detail). Boundary clear ke `engineer` role.
6. **Forcing Questions > Template.** Push tajam, EM mikir, AI nyusun.
7. **Output Handoff-Aware (Role-Based, not Skill-Specific).** Outputs reference role names, bukan specific skill names.
8. **Numbered Questions — Anti-Ambiguity.** Tag setiap question 1/2/3 atau a/b/c.

### EDD as PRD's parallel

Where pm-thinking ends with `prd.md`, em-thinking starts with `edd.md` (Engineering Design Document). The natural artifact chain:

```
discovery.md → prd.md → edd.md → eng-works.md → pr-review-<sha>.md → debug-<bug-id>.md
   (PM)        (PM)     (EM)      (EM)            (EM)                  (EM)
```

`edd.md` includes content typical of industry Engineering Design Doc / Technical Design Doc / RFC: architecture, invariants, failure modes, test strategy, plus em-thinking-specific risk tier classification and cognitive pattern citations.

### Role-based handoff (not skill-specific)

Outputs reference **roles** instead of specific skill names. Map:

| Role | Consumes | Returns |
|------|----------|---------|
| `engineer` | `eng-works.md` per ticket | PR / commit |
| `security-reviewer` | `edd.md` (parallel di T0) | Security findings |
| `qa-reviewer` | `edd.md` (parallel di T0/T1 complex) | QA findings |
| `release-engineer` / `devops` | `eng-works.md` deploy plan section | Rollout execution |
| `pm` | scope-reduce loopback dari `edd.md` | Reframed PRD |

This makes em-thinking portable across env conventions (verzth uses `golang-developer`, soekarno uses `golang-engineer`, gstack uses generic `build`, etc.). Reader translates role → skill matched per env.

### 6 reference docs

- **`cognitive-patterns.md`** — 15 patterns from Larson (*An Elegant Puzzle*), McKinley (*Choose Boring Technology*), Fowler (Strangler Fig), Allspaw + Google SRE (blameless postmortem), Skelton/Pais (*Team Topologies*), Forsgren (*Accelerate*), Brooks (*No Silver Bullet*), Reilly (*The Staff Engineer's Path*), Beck (*Tidy First?*), Majors (DevOps), Google SRE (error budgets) — with citations and EM connection per pattern.
- **`risk-tiering.md`** — T0-T3 generic taxonomy (NOT domain-specific; future flavor extensions for MMF / healthcare / regulated finance possible). Tier boundary forcing questions and escalation triggers included.
- **`architecture-checklist.md`** — boundaries, invariants, failure modes, SPOFs detail with ASCII diagram conventions and forcing questions per dimension.
- **`deploy-prep-checklist.md`** — env/secrets spec, deploy strategy taxonomy (feature flag / canary / blue-green / big-bang), rollback procedure templates, monitoring window, comms plan. Artifact-only scope (em-works prepares, devops executes).
- **`code-review-rubric.md`** — 4-section severity matrix (Block/Major/Minor/Info), decision matrix (block count → Approve/Request changes/Comment).
- **`debug-playbook.md`** — 5-step investigation, root cause vs symptom, why-chain (5 whys), fix scope decision (Local/Architectural/Process), common anti-patterns.

### Auto-detect mode in /em-review

```
1. Explicit flag (--review / --debug) — highest priority
2. Auto-detect from input:
   - PR ref (diff, link, SHA, "PR #N") → Mode A (review)
   - Stack trace, "bug", "error", "crashed", "failing" → Mode B (debug)
3. Ask user — only if ambiguous
```

## Internal changes

- Added `skills/em-thinking/` bundle (12 files, 2,676 lines):
  - `ETHOS.md` (191 lines) — 8 principles
  - `README.md` (192 lines)
  - `.claude-plugin/plugin.json` (24 lines)
  - 6 references (1,189 lines total)
  - 3 sub-skill `SKILL.md` (1,080 lines total)
- Updated `.claude-plugin/marketplace.json` — added em-thinking entry, version 1.2.0 → 1.3.0
- Updated root `README.md` — added em-thinking row to Available skills table + plugin marketplace install commands + dedicated em-thinking section
- `bin/cli.js` — no changes (existing bundle detection already works for em-thinking)

## Breaking changes

None. Purely additive. All existing usage of v1.2.0 (humanoid-thinking, golang-developer, pm-thinking) works exactly as before.

## Migration

No migration needed.

## Install

```bash
# npm CLI
npx @verzth/skills install em-thinking

# Claude Code plugin marketplace
/plugin marketplace add https://github.com/verzth/skills.git
/plugin install em-thinking@verzth-skills
```

After install, restart Claude Code. 3 slash commands available:

- `/em-plan`
- `/em-works`
- `/em-review`

## Known limitations

- **Future devops skill not yet shipped.** em-works produces deploy plan artifact, but execution requires future devops skill or existing `release-engineer`/`land-and-deploy`/`release-manager` role-matched skill in your env.
- **MMF / regulated finance flavor not included.** Risk tiering is generic. Future extension for MMF (Money Market Fund) flavor planned, with regulated-finance-specific risk surfaces and discipline gates.
- **pm-thinking ETHOS still references generic `engineer-manager` skill.** Future cleanup will update pm-thinking to specifically reference `/em-plan` for PRD → EDD handoff.
