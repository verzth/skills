# Changelog v1.2.0 — Plugin Marketplace + Bundle Support

**Released:** 2026-04-26

## What's new

### Dual install methods

`@verzth/skills` now supports **two install paths** for the same content:

1. **npm CLI (existing, unchanged)** — `npx @verzth/skills install <name>`
2. **Claude Code plugin marketplace (new)** — `/plugin marketplace add ... && /plugin install <name>@verzth-skills`

Pick whichever fits your workflow. Both install identical content.

### Bundle plugin support

CLI now recognizes **bundle plugins** (multi-skill folders with `.claude-plugin/plugin.json` instead of single SKILL.md at root).

Example: `pm-thinking` is a bundle that contains 3 sub-skills (`pm-discover`, `pm-works`, `pm-decide`). Installing it gives you all 3:

```bash
npx @verzth/skills install pm-thinking
# → installs ~/.claude/skills/pm-thinking/ with skills/{pm-discover,pm-works,pm-decide}/
# → all 3 slash commands available in Claude Code
```

`npx @verzth/skills list` now shows bundle annotation:

```
pm-thinking
AI-First Product Management — ... [bundle: 3 skills]
```

### New skill: `pm-thinking` (v0.1.0)

AI-First Product Management bundle for tech-literate Product PMs. Modeled after gstack (Garry Tan) but for PM workflows.

3 sub-skills:
- `/pm-discover` — synthesize raw user research → JTBD hypothesis
- `/pm-works` — write PRD with strict 7-section Tech Implications + Handoff section
- `/pm-decide` — multi-mode (`--prio`, `--review`, `--stakeholder`, `--retro`)

Filosofi:
1. AI as orchestrator (not assistant)
2. Forcing questions (not template fill-in)
3. Output handoff-ready
4. Tech-aware, not tech-decide
5. Numbered questions (anti-ambiguity)

See [skills/pm-thinking/README.md](./skills/pm-thinking/README.md) for full docs.

## Internal changes

- Added `.claude-plugin/marketplace.json` at repo root (catalog of all plugins)
- Added `.claude-plugin/plugin.json` to each skill folder (humanoid-thinking, golang-developer, pm-thinking)
- Modified `bin/cli.js`:
  - New `detectSkillType(name)` — returns `"single"` / `"bundle"` / `null`
  - `getAvailableSkills()` now picks up bundle plugins
  - `getSkillDescription()` reads from plugin.json for bundles, with sub-skill count annotation
- Updated `package.json` `files` field to include `.claude-plugin/`
- Updated README with both install methods documented

## Breaking changes

None. All existing usage of `npx @verzth/skills install humanoid-thinking` etc. works exactly as before. New behavior is purely additive.

## Migration

No migration needed. Existing users continue with `npx @verzth/skills` flow.

New users can choose either path:
- npm: `npx @verzth/skills install <name>`
- Claude Code: `/plugin marketplace add https://github.com/verzth/skills.git`
