# Changelog v1.5.0 — em-thinking + pm-thinking translated to English

**Released:** 2026-04-29

## What's changed

### Bahasa Indonesia narrative translated to English (hybrid style)

Both **em-thinking** and **pm-thinking** bundles now use English throughout. Previous "Bahasa Mixed" convention (English structural keywords + Bahasa Indonesia narrative) was deprecated for international accessibility.

**Hybrid English style:**

- **Narrative / explanation**: casual professional. "You should...", "if X, do Y." Direct, opinionated, short sentences.
- **Tables / structured lists**: formal English. Consistent voice.
- **Code blocks, frontmatter, technical anchors**: unchanged (already English).
- **Forcing questions**: numbered with concrete options (a/b/c).

The voice is preserved — same direct, opinionated tone — just in English.

### Translation summary

| Bundle | Files translated | Lines changed | Status |
|--------|------------------:|---------------:|--------|
| em-thinking | 12/12 | ~452 narrative lines | ✓ clean |
| pm-thinking | 8/8 | ~250 narrative lines | ✓ clean |
| **humanoid-thinking** | — | unchanged | **intentionally preserved** |

humanoid-thinking is unchanged because the **HATI framework** (Hidup-Aktif-Tahu-Inisiatif) is rooted in Indonesian identity. Step names (Tangkap → Intuisi → Validasi → Sampaikan) and example interactions are intentionally Indonesian to demonstrate the framework's cultural grounding.

### ETHOS updates

Each bundle's ETHOS.md had a "Catatan: Bahasa Mixed (Inggris struktur, Bahasa narasi)" section. These were replaced with:

```markdown
## Note: English Style (Casual Narrative + Formal Tables)

Skills in this bundle use English throughout. Style guide:
- Narrative/explanation: casual professional. "You should...", "if X, do Y." Direct, opinionated, short sentences.
- Tables / structured lists: formal English. Consistent voice.
- Code blocks, frontmatter, anchors: unchanged technical anchors.
- Forcing questions: numbered, with concrete options (a/b/c).

The previous "Bahasa Mixed" convention (English structure + Indonesian narrative) was deprecated in v1.5.0 for international accessibility.
```

Same update applied to `pm-thinking/references/ai-first-principles.md` (parallel principle list).

### Translation examples (calibrating tone)

| Indonesian | English |
|------------|---------|
| "Skill ini gak speculate — butuh real user signal." | "This skill doesn't speculate — needs real user signal." |
| "Plan yang ngebut sekarang tapi bikin debt 6 bulan = anti-velocity." | "A plan that ships fast now but creates debt 6 months later = anti-velocity." |
| "PM yang AI-First adalah orchestrator: AI yang sintesis raw input..." | "An AI-First PM is an orchestrator: AI synthesizes raw input..." |
| "Skill yang ngasih template kosong = nyuruh lo ngerjain kerjaan AI." | "A skill that gives an empty template = making you do the AI's job." |

## Internal changes

- Translated 20 files across em-thinking + pm-thinking bundles
- Updated `marketplace.json`:
  - `metadata.version`: 1.4.0 → 1.5.0
  - em-thinking plugin: 0.2.0 → 0.3.0
  - pm-thinking plugin: 0.1.0 → 0.2.0
  - Both plugin descriptions noted "English-only since v1.5.0"
- Bumped `@verzth/skills` package version 1.4.0 → 1.5.0 in `package.json`
- Added `CHANGELOG-v1.5.0.md`
- Root `README.md` retained Indonesian-only in humanoid-thinking section (HATI framework identity)

## Breaking changes

None.

The translation preserves all functional behavior — same skills, same workflow, same output structure. Only narrative language changed. Existing artifacts (edd.md, eng-works.md, prd.md, etc.) remain identical in format.

## Migration

No migration needed.

## Install / Update

```bash
# npm CLI
npx @verzth/skills install em-thinking
npx @verzth/skills install pm-thinking

# Claude Code plugin marketplace
/plugin marketplace update verzth-skills
/plugin update em-thinking@verzth-skills
/plugin update pm-thinking@verzth-skills
```

## Why translate

The previous Bahasa Mixed convention worked well for Indonesian-speaking teams but limited skill adoption internationally. With em-thinking and pm-thinking targeting general engineering management / product management workflows (not domain-specific), English narrative makes the skills accessible to a broader audience.

humanoid-thinking remains Indonesian by design — its HATI framework is culturally grounded and the framework's strength comes from that grounding.

## Acknowledgments

Translation executed via parallel sub-agents (general-purpose). Both agents preserved structural elements (frontmatter, code blocks, ASCII diagrams, role names, technical anchors) while translating only narrative content. ETHOS principles, forcing question numbering, anti-pattern markers, and cognitive pattern citations all preserved verbatim.
