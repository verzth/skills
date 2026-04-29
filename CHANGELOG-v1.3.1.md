# Changelog v1.3.1 — em-thinking Docs Sync

**Released:** 2026-04-29

## What's fixed

### em-thinking documentation sync (`eng-plan` → `edd` in prose references)

In v1.3.0, the artifact filename was renamed from `eng-plan.md` to `edd.md` (Engineering Design Document, per industry convention). Filenames were correctly updated, but **prose references** to the document still used the old "eng-plan" shortname in 14 locations across 4 files.

This patch fixes those prose references for consistency.

Files updated (14 references total, all prose without `.md` suffix):

- `skills/em-thinking/README.md` — 2 references (Tools integration table, em-thinking vs pm-thinking boundary line)
- `skills/em-thinking/references/code-review-rubric.md` — 3 references (Section 3 forcing question, Anti-pattern, Self-check)
- `skills/em-thinking/skills/em-review/SKILL.md` — 6 references (description frontmatter, trigger list, Section 1 grounding, Section 1 forcing question, Section 3 forcing question, anti-pattern)
- `skills/em-thinking/skills/em-works/SKILL.md` — 3 references (Phase 1 scope, ticket Why connect, output template ticket Why)

The skill name `/em-plan` (slash command) was unaffected — only `eng-plan` (the artifact's old shortname) was renamed.

## Internal changes

- Bumped `em-thinking` plugin version 0.1.0 → 0.1.1 in `marketplace.json`
- Bumped `@verzth/skills` package version 1.3.0 → 1.3.1 in `package.json`
- Updated marketplace metadata version to 1.3.1
- Added `CHANGELOG-v1.3.1.md`

## Breaking changes

None. Pure docs/text consistency fix. No functional or behavioral change.

## Migration

No migration needed.

## Install / Update

```bash
# npm CLI
npx @verzth/skills install em-thinking  # pulls latest v1.3.1

# Claude Code plugin marketplace
/plugin marketplace update verzth-skills
/plugin update em-thinking@verzth-skills
```

## Why this fix matters

Inconsistency between filename (`edd.md`) and prose references (`eng-plan`) creates ambiguity for skill consumers — both AI agents reading SKILL.md and humans reading docs. After this fix, the artifact is consistently called `edd` (short) or `edd.md` (file), reflecting its role as the Engineering Design Document.
