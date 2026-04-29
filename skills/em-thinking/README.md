# em-thinking

> **AI-First Engineering Management — opinionated workflow for tech-lead Engineering Managers.**

A bundle yang turns Claude into a virtual EM team. **One install** → langsung dapet 3 skill: `/em-plan` (architect), `/em-works` (delivery prep), `/em-review` (reviewer + debugger).

Companion ke [pm-thinking](https://github.com/verzth/skills/tree/main/pm-thinking) — kalau pm-thinking turns Claude into PM team, **em-thinking turns Claude into EM team yang nerusin handoff dari PM**.

Inspired by [gstack](https://github.com/garrytan/gstack) (Garry Tan, YC) untuk cognitive patterns + scope challenge discipline, dan [soekarno](https://github.com/verzth/soekarno) untuk multi-agent process + structured handoff philosophy.

## Philosophy

EM yang AI-First **bukan EM yang nge-review code lebih cepet pake AI**. EM yang AI-First adalah **reviewer & synthesizer**: AI yang draft architecture plan, AI yang sintesis review issues, AI yang challenge balik forcing questions — EM yang ambil keputusan akhir.

8 prinsip inti:

1. **AI-First EM = Reviewer & Synthesizer, bukan Code Writer.**
2. **Reduce Future Pain > Maximize Current Speed.** Compound velocity, bukan sprint velocity.
3. **Boring by Default, Innovation Tokens Are Scarce** (Tan/McKinley — 3 tokens per company).
4. **Boil the Lake** (Tan) — completeness ketika AI marginal cost ≈ 0.
5. **EM Owns Architecture & Scope, Bukan Implementation Detail.** Boundary clear ke `engineer` role.
6. **Forcing Questions > Template.** Push tajam, EM mikir, AI nyusun.
7. **Output Handoff-Aware (Role-Based).** Setiap output reference role (`engineer`, `security-reviewer`, `qa-reviewer`, `release-engineer`/`devops`), bukan skill name spesifik.
8. **Numbered Questions — Anti-Ambiguity.** Tag setiap question 1/2/3 atau a/b/c.

Detail lengkap di [ETHOS.md](./ETHOS.md).

## The 3 skills

| Skill | Peran spesialis | EM lifecycle stage |
|-------|----------------|---------------------|
| [`/em-plan`](./skills/em-plan/SKILL.md) | **Architect + Risk Classifier** — receive PRD/design/bug → produce edd.md (risk tier T0-T3, scope challenge, invariants, failure modes, test strategy) | Plan |
| [`/em-works`](./skills/em-works/SKILL.md) | **Delivery Lead** — translate plan → execution-ready package (atomic tickets, worktree lanes, env/secrets spec, deploy plan artifact) | Prep |
| [`/em-review`](./skills/em-review/SKILL.md) | **Code Reviewer + Debugger** — Mode A PR review (4-section, against plan), Mode B hypothesis-driven debug (5-step, root-cause-first) | Review / Debug |

## EM lifecycle flow

```
[PM /pm-works] ── prd.md ──┐
                            ▼
                       [/em-plan]
                            │ edd.md
                            ▼
       ┌── (T0 + sensitive) ─┴──── security-reviewer role (parallel)
       │                     │
       │                [/em-works]
       │                     │ eng-works.md + tickets + deploy artifact
       │                     ▼
       │                engineer role ── PRs ──┐
       │                                        ▼
       │                                  [/em-review]
       │                                        │
       │                                ┌───────┴────────┐
       │                          Mode A│                │ Mode B (architectural)
       │                          approve│                │
       │                                ▼                ▼
       │                       release-engineer    [em-plan loop]
       │                       role
       │                                ▼ (post-deploy incident)
       │                          [/em-review Mode B]
       │                                │
       └─── action items ◄──────────────┘
                  │
                  ▼
            [/em-works next sprint]
```

## Risk tier (T0-T3)

| Tier | Surface | Example | Discipline |
|------|---------|---------|------------|
| **T0 — Critical** | Irreversible ops, security boundaries, state machines w/ concurrency, external contracts (idempotency), sensitive data | Critical write path, login/session, distributed lock, webhook receiver | Test-first wajib. Security review parallel. Postmortem-grade docs. Feature flag/canary deploy. |
| **T1 — High** | Schema migration, breaking API, multi-service coordination | Add NOT NULL column, change response field type | Test strategy explicit. Migration plan. Backward compat. |
| **T2 — Standard** | Single-module additive, isolated surface | New endpoint with flag, internal helper | Standard test coverage. Invariants stated. |
| **T3 — Trivial** | Config / docs / dev tooling | README typo, lint rule | Sanity check only. Fast lane. |

Detail di [references/risk-tiering.md](./references/risk-tiering.md).

## Install — sekali, langsung dapet 3 skill

### Via npm CLI (recommended)

```bash
npx @verzth/skills install em-thinking
```

Pilih scope (Global = `~/.claude/skills/em-thinking/`, Project = `./.claude/skills/em-thinking/`).

### Via Claude Code plugin marketplace

```text
/plugin marketplace add https://github.com/verzth/skills.git
/plugin install em-thinking@verzth-skills
```

### Manual (clone + symlink)

```bash
git clone https://github.com/verzth/skills.git ~/.verzth-skills
ln -s ~/.verzth-skills/skills/em-thinking ~/.claude/skills/em-thinking
```

Habis install, restart Claude Code. Ketiga skill akan muncul:
- `/em-plan`
- `/em-works`
- `/em-review`

### Update

```bash
# npm CLI
npx @verzth/skills install em-thinking  # re-install latest

# Manual
cd ~/.verzth-skills && git pull
```

## Tools integration

em-thinking opportunistically calls connected MCP tools — **kalau ada, dipake; kalau gak ada, fallback ke manual**:

| Tool | Dipake oleh | Untuk apa |
|------|-------------|-----------|
| **Notion** | em-plan, em-works, em-review | Push edd/eng-works/pr-review/debug-trace ke Notion engineering page |
| **GitHub** | em-review (Mode A) | Auto-fetch PR diff, post review comments inline |
| **Linear / GitHub Issues** | em-works, em-review | Auto-create issue per ticket / regression / process gap |
| **BigQuery** | em-plan, em-review (Mode B) | Validate scale assumption / pull production telemetry untuk debug evidence |
| **Pencil Dev** | em-plan | Generate visual diagram dari ASCII (kalau user prefer visual) |
| **WebSearch** | em-plan (Phase 2 built-in check) | Search "{framework} {pattern} built-in" sebelum custom solution |

Skill gak akan minta lo connect tools yang gak ada — straight ke manual mode.

## Boundary: em-thinking vs pm-thinking

pm-thinking ends di **PRD ready (handoff to eng)**. em-thinking starts di **PRD received → edd**.

| pm-thinking owns | em-thinking owns |
|-------------------|-------------------|
| User research synthesis | Architecture & scope |
| JTBD reframing | Risk tier classification |
| PRD writing | Failure modes enumeration |
| Tech Implications (PM-level) | Test strategy |
| Stakeholder updates | Code review (against plan) |
| Prio decisions | Debug investigation |
| Retro | Deploy plan artifact (no execution) |

Cross-handoff:
- pm-thinking PRD → em-plan input
- em-plan scope-reduce → loop back ke pm-thinking pm-decide --prio
- em-review Mode B architectural fix → em-plan re-frame

## Boundary: em-thinking vs engineer role

em-thinking **TIDAK** dictate implementation detail:

| em-thinking owns | engineer role owns |
|-------------------|---------------------|
| Architecture (boundaries, invariants) | Code style, naming, refactoring choices |
| Test strategy (what to test, coverage targets) | Test implementation (mocks, fixtures) |
| Failure modes (what can go wrong) | Error path implementation |
| Risk tier (T0-T3 classification) | Library micro-choices |
| Scope (in / out) | Function-level decomposition |

EM trust engineer untuk decide *how*, sambil EM jaga *what* dan *why*.

## Boundary: em-thinking vs deployment

em-thinking **prepares deploy artifact, doesn't execute**. Deploy execution = `release-engineer` / `devops` role (skill matched per env).

| em-thinking produces | release/devops role executes |
|------------------------|-------------------------------|
| Env vars + secrets spec (with status keywords) | Provisioning di Secrets Manager |
| Migration ID + rollback SQL | Running migration |
| Feature flag definition (name, default, owner) | Creating flag di flag platform |
| Deploy strategy (canary 5%/25%/100%) | Triggering canary |
| Rollback procedure step-by-step | Executing rollback |
| Monitoring dashboard plan | Creating dashboard |

Detail di [references/deploy-prep-checklist.md](./references/deploy-prep-checklist.md).

## References

- [`cognitive-patterns.md`](./references/cognitive-patterns.md) — 15 patterns dari Tan / Larson / SRE / Beck / Conway / Brooks (with citation)
- [`risk-tiering.md`](./references/risk-tiering.md) — T0-T3 detail (shared dengan pm-thinking)
- [`architecture-checklist.md`](./references/architecture-checklist.md) — boundaries / invariants / failure modes / SPOFs
- [`deploy-prep-checklist.md`](./references/deploy-prep-checklist.md) — env / secrets / rollback (artifact spec only)
- [`code-review-rubric.md`](./references/code-review-rubric.md) — 4-section review + severity + decision matrix
- [`debug-playbook.md`](./references/debug-playbook.md) — 5-step investigation + anti-patterns

## License

MIT.
