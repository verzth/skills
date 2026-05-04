<p align="center">
  <h1 align="center">@verzth/skills</h1>
  <p align="center">
    Curated collection of custom skills for Claude Code &amp; Cowork
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

A plug-and-play skill registry for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [Cowork](https://claude.ai). Each skill extends Claude's behavior with domain-specific frameworks, workflows, and personality — installed with a single command.

**Two install paths supported:**
- **npm CLI** (legacy, simple) — `npx @verzth/skills install <name>`
- **Claude Code plugin marketplace** (newer, native) — `/plugin install <name>@verzth-skills`

Both methods install the same content. Pick whichever fits your workflow.

## Available skills

| Skill | Type | Description |
|-------|------|-------------|
| `humanoid-thinking` | single | Human cognitive framework — intuition-first, validated by logic |
| `golang-developer` | single | Go microservices development (Clean Architecture, gRPC, Wire DI) |
| `pm-thinking` | bundle | AI-First Product Management — pm-discover, pm-works, pm-decide |
| `em-thinking` | bundle | AI-First Engineering Management — em-plan, em-works, em-review |

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

When no flag is provided and the session is interactive, the CLI prompts you to choose. In non-interactive environments (CI/CD, piped input), it auto-detects based on whether `.claude/` exists in the current directory.

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
```

Update later:
```
/plugin marketplace update verzth-skills
/plugin update <skill-name>@verzth-skills
```

Marketplace catalog: [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json)

### Alternative Install Methods

<details>
<summary><strong>curl</strong></summary>

```bash
# Install all
curl -fsSL https://raw.githubusercontent.com/verzth/skills/main/install.sh | bash

# Install specific skill
curl -fsSL https://raw.githubusercontent.com/verzth/skills/main/install.sh | bash -s -- humanoid-thinking
```
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

## Requirements

- **Node.js** 14+ (for `npx`)
- **Claude Code** or **Cowork** by Anthropic

## FAQ

**Can I use multiple skills at once?**
Yes. Install as many as you want — they work independently and don't conflict.

**What happens when I upgrade a skill?**
Your personalized settings (like `personality.md`) are automatically backed up and restored. You won't lose your configuration.

**Global or project — which should I pick?**
Use **global** if you want the skill everywhere. Use **project** if you only want it in a specific repo, or if different projects need different configurations.

**Can I uninstall a skill?**
Just delete the skill folder from `.claude/skills/` (project) or `~/.claude/skills/` (global).

## License

[MIT](./LICENSE)
