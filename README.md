<p align="center">
  <h1 align="center">@verzth/skills</h1>
  <p align="center">
    Curated collection of custom skills for Claude Code, Cowork &amp; OpenClaw
    <br />
    <a href="https://www.npmjs.com/package/@verzth/skills"><strong>npm</strong></a> · <a href="https://github.com/verzth/skills/issues"><strong>Issues</strong></a>
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@verzth/skills"><img src="https://img.shields.io/npm/v/@verzth/skills?style=flat-square&color=blue" alt="npm version" /></a>
  <a href="https://github.com/verzth/skills/blob/main/LICENSE"><img src="https://img.shields.io/github/license/verzth/skills?style=flat-square" alt="license" /></a>
  <a href="https://www.npmjs.com/package/@verzth/skills"><img src="https://img.shields.io/npm/dm/@verzth/skills?style=flat-square" alt="downloads" /></a>
</p>

---

## What is this?

A plug-and-play skill registry for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cowork](https://claude.ai), and [OpenClaw](https://openclaw.ai). Each skill extends the AI's behavior with domain-specific frameworks, workflows, and personality — installed with a single command.

**Three install paths supported:**
- **npm CLI** — `npx @verzth/skills install <name>`
- **Claude Code plugin marketplace** — `/plugin install <name>@verzth-skills`
- **OpenClaw** — `npx @verzth/skills install <name> --openclaw`

## Available skills

| Skill | Type | Description |
|-------|------|-------------|
| `humanoid-thinking` | single | Human cognitive framework — intuition-first, validated by logic |
| `golang-developer` | single | Go microservices development (Clean Architecture, gRPC, Wire DI) |
| `pm-thinking` | bundle | AI-First Product Management — pm-discover, pm-works, pm-decide |
| `em-thinking` | bundle | AI-First Engineering Management — em-plan, em-works, em-review |
| `public-awareness` | single | Artifact integrity guardrail — keeps internal working context out of public-facing artifacts |
| `arch-diagram` | single | Interactive diagram generator — editable flowcharts (Cytoscape.js), rich SVG sequence diagrams, ER/state/class via Mermaid |
| `board-thinking` | single | Board Thinking idea diagnostic — convene a virtual board of 5-7 advisors (`/onboard`) to stress-test an idea before PRD or architecture |
| `cso-thinking` | single | CSO mindset security audit — single command (`/cso-audit`) covers frontend / backend / infra / db / Android / iOS / generic; emits SECURITY_AUDIT.md + .html with score, audit list, and fix-ready remediation prompts |

> Want something else? [Request a skill →](https://github.com/verzth/skills/issues/new)

## Quick Start (npm)

```bash
npx @verzth/skills install humanoid-thinking
```

You'll be prompted to choose where to install:

```
Where do you want to install?
  1) Global  → ~/.claude/skills/ (available in all projects)
  2) Project → ./.claude/skills/ (current project only)

Choose [1/2]:
```

Or skip the prompt with flags:

```bash
npx @verzth/skills install humanoid-thinking --global    # all projects
npx @verzth/skills install humanoid-thinking --project   # current project only
```

## Usage

```bash
# Install a specific skill
npx @verzth/skills install <skill-name>

# Install multiple skills
npx @verzth/skills install humanoid-thinking <other-skill>

# Install all available skills
npx @verzth/skills install --all

# List available skills
npx @verzth/skills list
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--global` | `-g` | Install to `~/.claude/skills/` — available across all projects |
| `--project` | `-p` | Install to `./.claude/skills/` — scoped to current project only |
| `--openclaw` | `-o` | Install for OpenClaw with adapted content |

Flags can be combined: `--openclaw --global` installs adapted skill to `~/.openclaw/skills/`.

When no scope flag is provided and the session is interactive, the CLI prompts you to choose. In non-interactive environments (CI/CD, piped input), it auto-detects based on whether `.claude/` (or `.openclaw/`) exists in the current directory.

## Install via Claude Code plugin marketplace

If you prefer the native plugin marketplace mechanism in Claude Code:

```
# Add this repo as a marketplace (one-time)
/plugin marketplace add https://github.com/verzth/skills.git

# Install any skill
/plugin install humanoid-thinking@verzth-skills
/plugin install golang-developer@verzth-skills
/plugin install pm-thinking@verzth-skills
/plugin install em-thinking@verzth-skills
/plugin install board-thinking@verzth-skills
/plugin install cso-thinking@verzth-skills
```

Update later:
```
/plugin marketplace update verzth-skills
/plugin update <skill-name>@verzth-skills
```

Marketplace catalog: [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json)

### Install for OpenClaw

```bash
# Global (recommended)
npx @verzth/skills install public-awareness --openclaw --global

# Project-scoped
npx @verzth/skills install public-awareness --openclaw --project
```

The `--openclaw` flag adapts skill content at install time:
- Installs to `~/.openclaw/skills/` or `.openclaw/skills/`
- Rewrites tool names: `Bash` → `exec`, `Write` → `write`, `Agent` → `sessions_spawn`, `TodoWrite` → `task tracker`
- Rewrites paths: `.claude/` → `.openclaw/`, `CLAUDE.md` → `AGENTS.md`
- Normalizes frontmatter: only `name`, `description`, and `version` are kept

### Alternative Install Methods

<details>
<summary><strong>curl (Claude Code)</strong></summary>

```bash
# Install all
curl -fsSL https://raw.githubusercontent.com/verzth/skills/main/install.sh | bash

# Install specific skill
curl -fsSL https://raw.githubusercontent.com/verzth/skills/main/install.sh | bash -s -- humanoid-thinking
```
</details>

<details>
<summary><strong>curl (OpenClaw)</strong></summary>

```bash
# Install specific skill for OpenClaw
curl -fsSL https://raw.githubusercontent.com/verzth/skills/main/install.sh | bash -s -- --openclaw public-awareness
```

> Note: curl installs change the install path but skip content adaptation (tool name rewrites). For fully adapted content, use `npx @verzth/skills install <name> --openclaw`.
</details>

<details>
<summary><strong>git clone</strong></summary>

```bash
git clone https://github.com/verzth/skills.git /tmp/verzth-skills
cp -r /tmp/verzth-skills/skills/humanoid-thinking .claude/skills/humanoid-thinking
```
</details>

## How Skills Work

Claude Code and Cowork load skills from `.claude/skills/` directories. Each skill is a folder containing a `SKILL.md` with instructions that shape how Claude thinks and responds.

**Global** (`~/.claude/skills/`) skills are active in every project on your machine. **Project** (`./.claude/skills/`) skills only activate when Claude is working in that specific project directory.

### Upgrade-safe

The installer automatically backs up and restores your `personality.md` configuration when upgrading skills, so your personalized settings are never lost.

## Skill: humanoid-thinking

The flagship skill. Makes Claude think with human-like common sense instead of exhaustively exploring every possibility.

**What it does:**
- **Framework HATI** (Human-Aware Thinking & Intuition) — a 4-step cognitive process: Tangkap → Intuisi → Validasi → Sampaikan
- **Smart confirmation** — asks follow-up questions only when genuinely ambiguous, not for things that are obvious from context
- **Personality system** — on first use, runs an onboarding flow where you name your agent, set communication style, language, and detail level. All preferences persist across sessions.

**Example:**
> *User:* "Mau cuci mobil, enaknya jalan kaki atau naik mobil?"
>
> *Without skill:* Analyzes both options, considers walking distance, pickup services, exercise benefits...
>
> *With skill:* "Naik mobil — mobilnya harus dibawa ke sana."

[Read full documentation →](./skills/humanoid-thinking/SKILL.md)

## Skill: golang-developer

An opinionated Go microservices development skill that enforces production-proven patterns across your entire Go codebase.

**What it does:**
- **Clean Architecture** — strict layering: entity → repository → service → handler, with Google Wire for compile-time DI
- **gRPC + grpc-gateway** — three-tier API design (Admin/Insider/Public) with buf for proto management and OpenAPI generation
- **Production stack** — GORM + MySQL, NATS JetStream for event streaming, Redis for caching and distributed locking
- **Comprehensive references** — covers entity patterns, repository patterns, service patterns, scheduler patterns, testing, infrastructure, and provider integration

**Covers:** scaffolding, code review, debugging, testing, and architecture guidance for Go microservices.

[Read full documentation →](./skills/golang-developer/SKILL.md)

## Skill: pm-thinking

A bundle that turns Claude into a virtual PM team. **One install → 3 sub-skills**: `/pm-discover` (researcher), `/pm-works` (senior PM), `/pm-decide` (strategist).

**What it does:**
- **Forcing questions, not templates** — each skill pushes you to answer sharp questions instead of filling out blank forms
- **Markdown handoffs between skills** — `discovery.md` feeds `/pm-works`, `prd.md` feeds `/pm-decide --review`, nothing falls through the cracks
- **Tech-aware, not tech-decide** — PMs understand technical impact (schema, API, backward compat) without making engineering decisions; clear boundary to a separate `engineer-manager` skill
- **Multi-mode `/pm-decide`** — `--prio` (prioritization), `--review` (PRD review), `--stakeholder` (updates), `--retro` (post-launch reflection)
- **Numbered questions, anti-ambiguity** — every question to the user is labeled (1/2/3 or a/b/c) so responses like "1a, 2c" stay precise and audit-friendly

**Sprint flow:** `/pm-discover` → `/pm-works` → `/pm-decide --review` → handoff to engineering → `/pm-decide --stakeholder` during build → `/pm-decide --retro` after ship.

[Read full documentation →](./skills/pm-thinking/README.md)

## Skill: em-thinking

A bundle that turns Claude into a virtual EM team. **One install → 3 sub-skills**: `/em-plan` (architect), `/em-works` (delivery prep), `/em-review` (reviewer + debugger). Companion to pm-thinking — picks up where PRD ends.

**What it does:**
- **EDD as PRD's parallel (dual `.md` + `.html` output)** — `/em-plan` produces `edd.md` + `edd.html` (Engineering Design Document) with risk tier (T0-T3), scope challenge, invariants, failure modes table, test strategy, and ASCII diagrams for component boundaries / data flow / state machine. HTML is self-contained (inline CSS, color-coded T0-T3 risk badges, ASCII diagram styling, TOC + breadcrumb, print-friendly) for human review
- **15 cognitive patterns from canonical sources** — State Diagnosis (Larson), Boring by Default (McKinley), Failure is Information (Allspaw/SRE), Make Change Easy (Beck), Conway's Law (Skelton/Pais), and more — applied as lens, not checklist
- **Execution-ready handoff** — `/em-works` translates EDD into atomic tickets + worktree parallelization lanes + env/secrets spec + deploy plan artifact (artifact-only, doesn't execute — devops/release skill handles execution)
- **Auto-detect mode in /em-review** — input contains PR ref → Mode A (code review, **dual `.md` + `.html` output** with severity-coded findings); stack trace / "bug" / "error" → Mode B (debug, hypothesis-driven, no blind fixes); ambiguous → asks
- **Role-based handoff (not skill-specific)** — outputs reference role names (`engineer`, `security-reviewer`, `qa-reviewer`, `release-engineer`/`devops`, `pm`) so they work across env conventions (verzth, soekarno, gstack, generic)
- **Numbered questions, anti-ambiguity** — same pattern as pm-thinking

**EM lifecycle flow:** `/em-plan` → `/em-works` → engineer role → `/em-review` (Mode A approve → release; Mode B debug if production incident → loop back to `/em-plan` if architectural).

**Inspired by** [gstack](https://github.com/garrytan/gstack) (Garry Tan, YC) for cognitive patterns + scope challenge discipline, and [soekarno](https://github.com/verzth/soekarno) for multi-agent process + structured handoff philosophy.

[Read full documentation →](./skills/em-thinking/README.md)

## Skill: public-awareness

A guardrail that keeps working context out of artifacts. Install it globally so every artifact-writing session automatically separates what's being built from how it's being built.

**What it does:**
- **Channel rule** — internal context (progress notes, uncertainty, process TODOs, session reasoning) belongs in conversation / TodoWrite / memory, never inside the artifact being built
- **Covers all artifact types** — websites, API specs, technical docs, database records, design specs, shared documents (Notion, Confluence, Google Docs), deployed code
- **Language rule** — the artifact's language follows the project audience, not the conversation language (e.g. prompter writes in Indonesian, product is an English website → content in English)
- **Audience check** — before writing, asks: "Is this content *part of the artifact* or *about how we're building it*?" When the target's visibility is unclear, asks before writing

**Example:**
> *Without skill:* Writes `<!-- TODO: verify pricing with legal -->` inside published HTML, or `"_note": "still validating"` inside a production JSON payload
>
> *With skill:* Keeps those notes in conversation; writes only intentional, finished content into the artifact

[Read full documentation →](./skills/public-awareness/SKILL.md)

## Skill: arch-diagram

Generates interactive system diagrams as self-contained `.html` files — open in any browser, no server, no build step.

**What it does:**
- **Flowchart / architecture** — fully editable Cytoscape.js canvas: drag nodes to rearrange, add/remove nodes and edges, rename labels inline, and drag any connection line to bend it into a curve. Auto-layout via dagre (LR/TD direction). Click any node to open a details sidebar with editable title, description, tech stack tags, and links
- **Sequence diagrams** — standalone custom SVG: gradient actor boxes with colored lifelines, phase bands with letter labels, numbered step circles, solid vs dashed arrow styles, and a legend — no Mermaid involved
- **ER / State / Class diagrams** — Mermaid-rendered with themed dark/light mode
- **Export** — SVG, PNG, and PDF from the toolbar
- **Category color system** — frontend (blue), backend (green), database (purple), cache (amber), queue (red), auth (pink), infra (cyan), external (gray)

**When to use:** any time the user wants to diagram, visualize, or document a system — even casual phrasing like "draw this", "show me how these connect", "map out my stack", or "make a diagram of my app".

[Read full documentation →](./skills/arch-diagram/SKILL.md)

## Skill: board-thinking

A multi-perspective idea diagnostic that sits between raw ideation and structured product work. **One install → one skill**: `/onboard` (Board Thinking).

**What it does:**
- **Convenes a virtual board of 5-7 stakeholder advisors** — 5 always-on lenses (The Skeptical Customer, The Cynical Investor, The Operator, The Contrarian, The Time Traveler) plus auto-added domain seats (Compliance Officer for regulated industries; Technical Architect for enterprise-scale or real-time claims)
- **Two rounds of questions** — Round 1 is discovery (each member asks one probing question citing specifics from the idea); Round 2 is cross-examination (each member reacts to other members' findings to surface tension). Cross-examination is the unique value vs single-voice "office hours" diagnosis
- **Mechanical verdict tally** — `≥4 REJECT → REJECT`, `≥4 APPROVE no rejects → PROCEED`, anything else → `PROCEED_WITH_CONDITIONS`. Founder enthusiasm does not override votes — verdicts reflect answer quality
- **Self-contained memo output** — writes `board-memo-{YYYYMMDD-HHMMSS}.md` to the working directory with executive summary, idea brief, roster, both rounds verbatim, verdicts table, conditions to satisfy, "the most important finding," "recommended next action," and "what the board noticed about how you think"
- **Bilingual runtime output** — memo prose matches user's language (Indonesian/English mix supported); persona names, verdict tokens, and section anchors stay English to preserve brand and parseability across sessions
- **Anti-routing discipline on REJECT** — a REJECT verdict never routes to `/em-plan` or `/pm-works`; it loops back to ideation or parks the project

**Sprint flow position:** raw idea → `/onboard` → verdict → `/pm-works` (PRD) or `/em-plan` (architecture) on PROCEED; off-tool user interviews then `/pm-discover` on PROCEED_WITH_CONDITIONS; back to ideation on REJECT.

**When to use:** "stress test this idea", "what would a board say", "should I build this", "review this idea from multiple perspectives", "convene a board" — when you have an idea past raw brainstorm but before any PRD or architecture commitment, and want disconfirming evidence rather than affirmation.

[Read full documentation →](./skills/board-thinking/README.md)

## Skill: cso-thinking

A Chief Security Officer in a single command. **One install → one skill**: `/cso-audit`.

**What it does:**
- **Auto-detects target profile(s)** from the working directory — frontend, backend (any language: Go / Node / Python / Java / Ruby / PHP / Rust / .NET / Elixir), infrastructure (Docker / Terraform / Kubernetes / Helm / Ansible / CI), databases, Android, iOS. `generic` baseline (secrets, supply chain, repo hygiene) is always active.
- **Confirms scope before running** — proposes profiles with detection evidence, accepts edits (no surprise 20-minute audit on the wrong target).
- **Hybrid execution** — runs external tools where installed (`gitleaks`, `semgrep`, `trivy`, `osv-scanner`, `govulncheck`, `bandit`, `mobsfscan`, `npm audit`, `hadolint`, `checkov`, `actionlint`, …) and falls back to checklist review against curated reference files (OWASP Top 10 / API Top 10 / ASVS / MASVS / Cheat Sheets, CIS benchmarks, NIST SP 800-190, SLSA) where they are not.
- **Composite score 0–100 + letter grade** with a hard cap at C+ when any Critical finding exists — score is a trend signal, not a pass/fail. Severity-weighted formula (Critical −15, High −7, Medium −3, Low −1, Info 0) with scope-size adjustment so a 50-line script and a 500k-LOC platform don't share the same scale.
- **Fix-ready audit list** — every finding has severity, location (`file:line` or config key), source (tool+version or checklist item ID), why-it-matters, copy-pasteable remediation prompt (paste into a fresh Claude session and the fix executes itself), and verification steps.
- **Dual output** — `SECURITY_AUDIT.md` (agent handoff, stable structure, parseable) AND `SECURITY_AUDIT.html` (human review with score banner, severity filters, expandable findings, copy buttons, dark/light auto, printable).
- **Re-audit deltas** — second run computes resolved/regressed/new findings and shows score trend over time, preserving the prior report.
- **Honest about blind spots** — every report ends with a Scope & limitations section listing what the audit could not assess (runtime behavior, business-logic flaws, social engineering, physical security).

**When to use:** "audit security", "security score", "vulnerability scan", "OWASP check", "MASVS check", "find security holes", "audit our api/infra/app/db", "is this safe to ship", "security posture", "security review" — pre-release, periodic posture review, post-incident, before audit committee.

[Read full documentation →](./skills/cso-thinking/README.md)

## Requirements

- **Node.js** 14+ (for `npx`)
- **Claude Code** or **Cowork** by Anthropic, or **OpenClaw**

## FAQ

**Can I use multiple skills at once?**
Yes. Install as many as you want — they work independently and don't conflict.

**What happens when I upgrade a skill?**
Your personalized settings (like `personality.md`) are automatically backed up and restored. You won't lose your configuration.

**Global or project — which should I pick?**
Use **global** if you want the skill everywhere. Use **project** if you only want it in a specific repo, or if different projects need different configurations.

**Can I uninstall a skill?**
Just delete the skill folder from `.claude/skills/` (project) or `~/.claude/skills/` (global). For OpenClaw, same pattern under `.openclaw/skills/`.

## License

[MIT](./LICENSE)
