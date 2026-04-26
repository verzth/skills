---
name: pm-works
description: Write a Product Requirements Document (PRD) from a discovery output or a problem hypothesis, with built-in Technical Implications section and structured handoff to engineering. Use when turning a validated hypothesis into a spec, when writing a PRD that engineers will actually act on, when scoping a feature with goals and non-goals, when defining acceptance criteria and success metrics, or when a feature request needs structured documentation before sprint planning. Forces tech-awareness (schema, API, backward compat) without making engineering decisions.
argument-hint: "<feature topic or path to discovery.md>"
---

# /pm-works

Tulis PRD lengkap dari discovery output atau hypothesis. Output siap di-handoff ke `engineer-manager` skill (atau eng team langsung).

Skill ini **draft-only**. Untuk audit / red-team, run `/pm-decide --review` setelah PRD selesai.

## ⚠ Question Format Rule (wajib semua skill di pm-thinking)

**Setiap question ke user wajib di-tag label unik** (1/2/3 atau a/b/c) supaya user bisa respond by pointing — anti-ambigu, hemat user effort.

Pake `AskUserQuestion` MCP kalau available. Fallback ke numbered text:

```
1. [Q]?
   a) ...
   b) ...
2. [Q]?
   a) ...
   b) ...
```

User: "1a, 2b" — done. Detail di [references/ai-first-principles.md](../../references/ai-first-principles.md) prinsip #8.

## Kapan trigger skill ini

- "Hypothesis udah ke-validasi, sekarang gue mau tulis PRD"
- "Tulis spec untuk feature X, baca dari `discovery.md`"
- "Buatin PRD untuk SSO enterprise, deadline 2 minggu"
- "Convert ide ini jadi spec yang bisa di-eksekusi eng"
- "Aku punya rough Notion page, perlu di-rapihin jadi PRD format"

## Workflow

### Step 1: Tangkap input

Tanya user:

a) **Path ke `discovery.md`** dari `/pm-discover` (preferred — best context)
b) **Notion page link** dengan hypothesis / rough draft (kalau Notion MCP connected, baca via `mcp__plugin_operations_notion__*`)
c) **Hypothesis statement langsung** — paste di chat
d) **Argument langsung** — `$ARGUMENTS` dari skill invocation

Kalau gak ada satu pun, **berhenti**. PRD tanpa hypothesis = solution looking for a problem. Kasih tau user untuk run `/pm-discover` dulu, atau minimal kasih hypothesis statement.

### Step 2: Gather context (tanya satu per satu, jangan dump)

Tanya hal-hal ini secara conversational. Pake **AskUserQuestion** kalau available untuk jawaban cepat:

#### Wajib (jangan skip)

1. **Target user segment** — siapa specific-nya? ("enterprise admin" bukan "user")
2. **Success metric (north star)** — gimana lo tau ini berhasil? Specific number, time window
3. **Hard deadline / dependency** — ada commitment date? Locked stakeholder?
4. **Scope boundary** — ini v1 atau full vision?

#### Kalau ada signal

5. **Existing component** — apakah ada feature / API / component existing yang bisa di-reuse atau bakal kena?
6. **Compliance / legal** — touch personal data, regulated industry, region-specific?
7. **Mockup link** — ada Pencil / Figma link? (kalau Pencil MCP connected, fetch via `mcp__pencil__*`)

### Step 3: Drive Tech Implications (CORE differentiator skill ini)

**Ini yang ngebedain pm-works dari skill PRD generic.** Sebelum nulis, push PM jawab:

> Lihat [references/tech-literacy-checklist.md](../../references/tech-literacy-checklist.md) untuk full checklist.

**Force PM mikir (bukan PM ngambil keputusan):**

| Question | Why PM perlu jawab |
|----------|---------------------|
| Schema baru? Migration di table existing? | Eng butuh tau scope database work |
| API contract berubah? Breaking change? | Backward compat strategy harus di-planning |
| Touch data sensitif? PII / payment / health? | Compliance review timeline harus di-allocate |
| Existing component yang bakal kena? | Risk regression di area lain |
| Realistic effort — week, month, atau quarter? | Sanity check sebelum commit deadline |

PM **gak ambil keputusan** — PM cuma flag awareness. Output PRD bakal punya section "Technical Implications" yang isinya **observasi**, bukan **prescription**.

### Step 4: Tulis PRD

Output ke file `prd.md` (atau Notion page kalau MCP connected). Gunakan template ini **persis**:

```markdown
# PRD: [Feature Name]

**Author:** [PM]
**Status:** Draft → Review → Approved → Building → Shipped
**Date:** YYYY-MM-DD
**Discovery source:** [link ke discovery.md atau Notion]
**Engineering lead:** TBD (akan di-assign via /pm-decide --prio)

---

## TL;DR

[2-3 kalimat. Apa yang dibangun, untuk siapa, kenapa sekarang.]

---

## Problem Statement

[Dari discovery.md hypothesis. Pain → segment → cost-of-not-solving.]

**Evidence:**
- [Quote / data point #1] — [source]
- [Quote / data point #2] — [source]

---

## Goals (3-5)

Outcome yang measurable. Bukan output (feature shipped), tapi behavior change.

1. [Goal] — measurable by [metric, target, time window]
2. ...

---

## Non-Goals (3-5)

Apa yang explicitly OUT of scope, plus rationale.

1. [Thing] — out of scope karena [reason]
2. ...

---

## User Stories

Group by persona. Format: As a [user type], I want [capability] so that [benefit].

### Persona 1: [name]
- As a [type], I want [capability] so that [benefit]
- ...

### Persona 2: ...

---

## Requirements

### Must-Have (P0)
- [ ] [Requirement] — acceptance: [Given/When/Then atau checklist]
- [ ] ...

### Nice-to-Have (P1)
- [ ] ...

### Future Considerations (P2)
- [ ] ...

---

## Technical Implications (CORE — wajib diisi)

> PM observasi, bukan prescription. Engineering decide implementasi.

### Data layer
- Schema impact: [None / New table X / Add column Y to table Z]
- Migration: [Required / None]
- Data sensitivity: [PII / payment / none]

### API / Integration
- API contract change: [None / New endpoint / Breaking change to existing]
- Backward compat: [N/A / Required — strategy TBD by eng]
- External dependency: [None / X service / Y vendor]

### Existing components affected
- [Component A] — [how affected]
- [Component B] — [how affected]

### Compliance / Privacy
- Touches: [list — none, PII, payment, health, regulated region]
- Required review: [None / Legal / Security / Privacy]

### Effort ballpark (PM guess, not commitment)
- [Days / Weeks / Months] — full eng commitment to be confirmed by engineer-manager skill

### Open technical questions for eng
- [Q1 — yang PM gak bisa jawab, butuh eng input]
- [Q2 — ...]

---

## Success Metrics

### Leading indicators (days–weeks)
- [Metric] — current baseline → target → measurement source [BigQuery query / Amplitude / Notion log]

### Lagging indicators (weeks–months)
- [Metric] — baseline → target → measurement window

---

## Rollout Plan

- **Phase 1 (internal):** [scope, timeline]
- **Phase 2 (beta cohort):** [criteria, timeline]
- **Phase 3 (GA):** [criteria, timeline]

### Kill switch / rollback
- [Mechanism — feature flag, env var, etc.]

---

## Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | [Q] | [Eng / Design / Legal / Data] | [Yes / No] |

---

## Handoff to Engineer Manager

Section ini buat di-konsumsi `engineer-manager` skill (atau eng tech lead langsung). PM stop di sini, eng take over.

**Hypothesis to validate:**
[Dari discovery.md]

**Constraints (locked by PM):**
- [User-facing constraint, e.g., "harus support SSO via SAML 2.0"]
- [Business constraint, e.g., "ship sebelum Q3 review"]

**Decisions delegated to eng:**
- [Decision area — e.g., "tech stack untuk SSO library"]
- [Decision area — e.g., "session storage strategy"]

**Don't decide engineering:**
- Specific library / framework choice
- Service boundary
- Performance trade-off
- Deployment strategy

---

## Appendix

- Mockup: [Pencil link kalau ada]
- Discovery source: [link]
- Related PRDs: [link]
```

### Step 5: Push ke Notion (kalau connected)

Kalau `mcp__plugin_operations_notion__*` connected, **tawarin** push PRD ke Notion page. Default lokasi: PRD database / folder yang user tunjuk. Tanya konfirmasi sekali, lalu push.

### Step 6: Suggest next step

Setelah PRD selesai, kasih saran ke user:

> "PRD draft selesai. Next: run `/pm-decide --review` untuk red-team audit sebelum handoff ke eng. Mau gue trigger sekarang?"

## Integration dengan tools

| Kondisi | Behavior |
|---------|----------|
| Notion MCP connected | Push PRD ke Notion, ambil discovery dari Notion link |
| Pencil MCP connected | Embed mockup link di Appendix |
| BigQuery MCP connected | Auto-fill baseline metric kalau PM kasih SQL hint |
| Tidak ada MCP | Output ke local `prd.md`, copy manual |

## Anti-pattern

- ❌ Tulis PRD tanpa discovery / hypothesis upstream — itu wishful thinking
- ❌ "Technical Implications" kosong / vague ("might affect database") — minimum: list specific component, schema impact
- ❌ Goal output-based ("ship onboarding wizard") bukan outcome-based ("reduce time-to-first-value 50%")
- ❌ P0 yang isinya 15 item — ruthless prio, P0 max 5-7
- ❌ "Skip Tech Implications, eng yang figure out" — itu yang bikin eng surprise pas kickoff
- ❌ Decide tech stack di PRD — itu domain engineer-manager

## Handoff downstream

- `prd.md` → `/pm-decide --review` untuk red-team audit
- Setelah review approved → `engineer-manager` skill ngambil section "Handoff to Engineer Manager" buat technical design
- Section "Success Metrics" → di-feed ke `/pm-decide --retro` post-launch

## Reference

- [tech-literacy-checklist.md](../../references/tech-literacy-checklist.md) — full checklist Tech Implications
- [handoff-to-eng-manager.md](../../references/handoff-to-eng-manager.md) — kontrak antara pm-thinking dan engineer-manager
