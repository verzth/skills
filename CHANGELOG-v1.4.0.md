# Changelog v1.4.0 — em-thinking Dual Output (.md + .html)

**Released:** 2026-04-29

## What's new

### Dual output (`.md` + `.html`) for em-thinking review artifacts

`/em-plan` and `/em-review` Mode A now produce **two files per invocation** — markdown source AND a self-contained HTML rendering for human review.

| Skill | Old output | New output |
|-------|------------|------------|
| `/em-plan` | `edd.md` | `edd.md` + **`edd.html`** |
| `/em-review` Mode A | `pr-review-<sha>.md` | `pr-review-<sha>.md` + **`pr-review-<sha>.html`** |
| `/em-works` | `eng-works.md` | `eng-works.md` (unchanged — execution artifact, less review-oriented) |
| `/em-review` Mode B | `debug-<bug-id>.md` | `debug-<bug-id>.md` (unchanged — internal investigation doc) |

The two files MUST be 1:1 consistent — same content, different rendering. Markdown stays editable + version-controllable; HTML is for browser review, sharing, printing.

### HTML rendering features

Self-contained HTML (no external CDN, no JavaScript, no build step). Open in any browser via `file://`.

Visual treatment:

- **Risk tier badges** color-coded:
  - T0 Critical = red `#dc2626`
  - T1 High = orange `#ea580c`
  - T2 Standard = blue `#2563eb`
  - T3 Trivial = gray `#6b7280`
- **Severity badges** for code review (Block / Major / Minor / Info) — same color palette
- **ASCII diagrams** styled in `<pre class="ascii-diagram">` — light background, monospace, preserved letter-spacing for box-drawing chars
- **Component diagrams** optional HTML/CSS alternative — colored boxes by `data-type` (`service`, `external`, `database`, `queue`, `cache`)
- **Failure modes table** — critical gap rows highlighted with red left border + tinted background
- **Forcing question callouts** — blue left border, 💭 prefix
- **Anti-pattern callouts** — red left border, ❌ prefix
- **TL;DR card** — sticky-style top section with blue accent border
- **TOC** auto-generated from `<h2>` and `<h3>` headings with anchor links
- **Breadcrumb** navigation: `em-thinking › <skill> › <artifact>`
- **Print-friendly** CSS rules — hide TOC nav, page-break-aware tables, badge borders fallback for print
- **Mobile responsive** — single-column meta, smaller padding, smaller font at <640px

### New reference doc

Added `skills/em-thinking/references/html-template.md` — comprehensive template + ~250 lines of inline CSS specification + section rendering examples + diagram conventions + common mistakes.

This becomes the single source of truth for HTML rendering across em-thinking skills.

## Internal changes

- Added `skills/em-thinking/references/html-template.md` (~570 lines)
- Updated `skills/em-thinking/skills/em-plan/SKILL.md`:
  - Output section header: `Output: edd.md` → `Output: edd.md + edd.html (dual output)`
  - Mandatory dual file write instruction
  - Reference link to html-template.md
  - New anti-pattern: "Skip `edd.html` output"
  - Tool integration table updated
- Updated `skills/em-thinking/skills/em-review/SKILL.md`:
  - Mode A output section header: `Output: pr-review-<sha>.md` → `Output: pr-review-<sha>.md + pr-review-<sha>.html (dual output)`
  - Mandatory dual file write instruction for Mode A
  - Reference link to html-template.md
  - New Mode A anti-pattern: "Skip `pr-review-<sha>.html` output"
- Updated `skills/em-thinking/README.md` — sub-skills table mention dual output, dedicated bullet about dual output feature
- Updated root `README.md` — em-thinking section mentions dual output for /em-plan and /em-review Mode A
- Bumped `em-thinking` plugin version 0.1.1 → 0.2.0 in `marketplace.json`
- Bumped `@verzth/skills` package version 1.3.1 → 1.4.0 in `package.json`
- Updated marketplace metadata version to 1.4.0
- Added `CHANGELOG-v1.4.0.md`

## Breaking changes

None.

While `/em-plan` and `/em-review` Mode A now mandate dual output, the markdown contract is unchanged — existing downstream consumers reading `.md` files continue to work. The `.html` is purely additive for human review.

## Migration

No migration needed.

## Install / Update

```bash
# npm CLI
npx @verzth/skills install em-thinking  # pulls latest v0.2.0

# Claude Code plugin marketplace
/plugin marketplace update verzth-skills
/plugin update em-thinking@verzth-skills
```

## Why dual output

Markdown is portable and version-controllable, but harder to scan in browser without rendering. Engineers reviewing an EDD or PR review artifact want immediate human-readable context — colors for severity, formatted tables, navigable TOC. HTML answers that need with zero tooling friction (no `mkdocs`, no `pandoc`, no GitHub render dependency).

The trade-off: slightly higher token cost per skill invocation (model writes both files). For artifacts that get reviewed by humans (EDD, PR review), the UX gain outweighs the cost.

Future v1.5+ may extend HTML output to `/em-works` and `/em-review` Mode B if user feedback indicates value.

## Known limitations

- HTML render duplicates content from .md (model writes both). Not a single-source-of-truth approach. If you edit `.md` post-generation, `.html` becomes stale until next generation.
- For lighter-weight option, consider future `npx @verzth/skills render edd.md` CLI flag (not in v1.4.0).
- `em-works` and `em-review` Mode B still emit `.md` only.
