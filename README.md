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

## Quick Start

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

## Available Skills

| Skill | Description | Highlights |
|-------|-------------|------------|
| [`humanoid-thinking`](./skills/humanoid-thinking/) | Human cognitive framework for Claude | Common-sense reasoning, intuition-first logic, smart confirmation, personality system |
| [`golang-developer`](./skills/golang-developer/) | Go microservices development skill | Clean Architecture, gRPC + grpc-gateway, GORM, Google Wire DI, NATS JetStream, Redis |

> Want something else? [Request a skill →](https://github.com/verzth/skills/issues/new)

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
