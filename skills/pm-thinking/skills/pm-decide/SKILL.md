---
name: pm-decide
description: Multi-mode strategic skill — prioritize backlog, red-team review a PRD, draft a stakeholder update, or run a post-launch retro. Use with --prio when ranking initiatives or running RICE/ICE/Kano against a backlog, with --review when auditing a PRD before handoff to engineering, with --stakeholder when writing weekly status or translating progress for exec/eng/sales/customer audiences, or with --retro when reflecting on a shipped feature against success criteria. Forces critical questions for each mode — not template fill-in.
argument-hint: "--prio | --review <prd-path> | --stakeholder <audience> | --retro <feature-name>"
---

# /pm-decide

Skill multi-mode untuk **deliberate reflection layer** — prio, review, stakeholder, retro. Setiap mode pake forcing question pattern, bukan template kosong.

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

**Specific application untuk pm-decide:**
- Mode picker (kalau user gak kasih flag): label setiap mode opsi 1/2/3/4
- Forcing questions di tiap mode: number tiap question + letter tiap option pilihan
- Confirmation prompts (push ke Notion, send update, etc.): a/b/c options

## Mode picker — kapan pake yang mana

| Mode | Triggers |
|------|----------|
| `--prio` | "Rank backlog Q3", "RICE this list", "apa yang harus dibangun duluan?", "decide next sprint focus" |
| `--review` | "Audit PRD ini", "red-team spec gue", "ada yang missing di PRD?", "is this ready for eng?" |
| `--stakeholder` | "Tulis weekly update", "translate progress untuk exec", "explain status ke sales", "monthly leadership report" |
| `--retro` | "Post-mortem feature X", "retro fitur yang baru launch", "did we hit metric?", "lessons learned" |

Kalau user gak kasih flag, **tanya dulu** mana mode yang dimaksud. Jangan default ke salah satu.

---

## Mode 1: `--prio` (Prioritize)

**Peran:** Product Lead. **Goal:** rank backlog dengan rationale yang gak feel-based.

### Workflow

#### Step 1: Tangkap backlog

Sumber:
- File `.md` / `.csv` dengan list initiative
- Notion database link (via Notion MCP)
- BigQuery query untuk metric reach (kalau MCP connected)
- Verbal list dari user

Minimum: setiap item harus punya **nama + 1-line description**. Kalau user kasih list yang cuma judul tanpa konteks, **berhenti** dan minta minimum brief per item.

#### Step 2: Pilih framework

Tanya user (AskUserQuestion):

a) **RICE** (Reach × Impact × Confidence ÷ Effort) — paling umum, butuh angka
b) **ICE** (Impact × Confidence × Ease) — versi simpler RICE, untuk early-stage
c) **Kano** (Must-Have / Performance / Delighter) — untuk feature variation, gak buat strategic prio
d) **Custom** — user define dimensi sendiri

#### Step 3: Drive scoring (forcing questions per item)

Untuk **setiap item** di backlog, push PM jawab tajam:

**Kalau RICE:**
1. **Reach:** "Berapa user yang bakal kena dalam time window relevant? Source angka-nya dari mana? (Bukan tebakan — query, segment count, dll.)"
2. **Impact:** "Kalau ini work, behavior user bakal change seberapa? Skala 0.25 / 0.5 / 1 / 2 / 3. Why?"
3. **Confidence:** "Lo seberapa yakin Reach × Impact-nya bakal terealisasi? %. Evidence-nya apa?"
4. **Effort:** "Eng ballpark — person-week. Confirmed by eng atau guess PM?"

**Kalau Confidence < 50%:** flag — perlu more discovery atau experiment dulu.

**Kalau Effort = "PM guess":** flag — minta sanity check dari engineer-manager skill / eng lead sebelum lock prio.

#### Step 4: Cross-cutting check

Setelah scoring, tanya:

- **"Item top-3 ini — apakah mereka semua bisa dikerjain bareng dari sisi capacity / dependency? Atau ada yang block-an?"**
- **"Apakah ada item yang LOW score tapi strategic / commitment ke stakeholder?"** (force eksplisit override rationale)
- **"Bottom-tier item — apa yang paling deserve di-kill, bukan parked?"** (force courage)

#### Step 5: Output

```markdown
# Priority: [list name / sprint / quarter]

**Date:** YYYY-MM-DD
**Framework:** RICE / ICE / Kano
**Decided by:** [PM] with input from [stakeholders]

## Ranked

| # | Item | Reach | Impact | Conf | Effort | Score | Notes |
|---|------|-------|--------|------|--------|-------|-------|
| 1 | ... | ... | ... | ... | ... | ... | ... |

## Top-3 commitment

1. **[Item]** — why first, what's at stake
2. ...

## Low-score, strategic override

- [Item] — kenapa di-promote padahal score rendah

## Killed (not parked)

- [Item] — why killing, not parking

## Open dependency / blocker

- [Issue] — owner, deadline

## Next actions

- [ ] Sprint planning kickoff with eng
- [ ] Communicate deprio to [stakeholder]
- [ ] Run /pm-works --spec for top item
```

---

## Mode 2: `--review` (Red-team PRD audit)

**Peran:** Senior PM Reviewer. **Goal:** find what's missing / weak in a PRD before handoff.

### Workflow

#### Step 1: Read PRD

Argument: path ke `prd.md` atau Notion link. Kalau gak ada, tanya user.

Read full content. Kalau PRD gak pake template `pm-works`, masih bisa di-audit — tapi flag bahwa struktur kurang standar.

#### Step 2: Run audit checklist

Lihat tiap section, **bukan ngerangkum** — tapi cari **gap / weakness**.

##### Problem Statement audit
- [ ] Specific user segment (bukan generic "users")?
- [ ] Evidence di-cite (quote, data, source)? Bukan asumsi?
- [ ] Cost-of-not-solving terbukti, bukan hand-wave?

##### Goals audit
- [ ] Outcome-based, bukan output-based?
- [ ] Measurable dengan target + time window?
- [ ] 3-5 goal, bukan 10+ (dilution risk)?

##### Non-Goals audit
- [ ] Cukup specific untuk prevent scope creep?
- [ ] Rationale per non-goal jelas?

##### Requirements audit
- [ ] P0 lean (max 5-7)? Kalau >10, force re-prioritize
- [ ] Acceptance criteria writable as test case?
- [ ] Edge cases / error states covered?

##### Technical Implications audit
- [ ] Schema impact specified?
- [ ] API breaking change flagged?
- [ ] Compliance / privacy reviewed?
- [ ] Existing components affected listed?
- [ ] Effort ballpark realistic / acknowledged as guess?

##### Success Metrics audit
- [ ] Leading + lagging indicators?
- [ ] Baseline current value documented?
- [ ] Measurement source / query identified?

##### Rollout Plan audit
- [ ] Phasing makes sense (internal → beta → GA)?
- [ ] Kill switch / rollback mechanism?

##### Open Questions audit
- [ ] Owner assigned per question?
- [ ] Blocking vs non-blocking flagged?

##### Handoff section audit
- [ ] Constraints PM-locked vs decisions delegated jelas separated?
- [ ] Eng gak akan dapat surprise pas kickoff?

#### Step 3: Forcing questions to PM

Untuk gap yang ditemukan, **bukan kasih checklist hasil**, tapi **trigger AskUserQuestion** atau pertanyaan langsung:

- "Lo bilang Reach = 10K user — angka itu dari mana? Lo pernah verify queryt-nya?"
- "P0 lo ada 12 item. Yakin semua 12 bener-bener cannot-ship-without? Coba kill 5 yang paling bisa di-cut."
- "Tech Implications kosong di section 'Existing components' — beneran gak nyentuh apa-apa, atau lo belum cek?"

PM jawab → update PRD sesuai feedback.

#### Step 4: Output

```markdown
# PRD Review: [PRD name]

**Reviewed:** YYYY-MM-DD
**Reviewer:** /pm-decide --review (AI red team)
**Original PRD:** [path / link]
**Status:** Needs revision / Ready for handoff

## Severity scorecard

- 🔴 **Blocker** — must fix before eng handoff: N issues
- 🟡 **Should fix** — strong recommend: N issues
- 🟢 **Nit** — optional: N issues

## Blocker findings

### B1. [Title]
**Section:** [section name]
**Issue:** [what's wrong / missing]
**Why blocker:** [risk if shipped as-is]
**Fix:** [specific recommendation]

## Should-fix findings
...

## Nit findings
...

## What's strong (so user knows what to keep)

- [Section] — [why solid]

## Recommendation

- [ ] Fix all blockers, then re-run /pm-decide --review
- [ ] OR: proceed to handoff acknowledging [trade-off]
```

---

## Mode 3: `--stakeholder` (Audience-specific update)

**Peran:** Comms Lead. **Goal:** translate same fact into different framing per audience.

### Workflow

#### Step 1: Tangkap context + audience

Tanya:

a) **Audience:**
- `exec` — board / leadership (impact + decision needed)
- `eng` — engineering team (technical detail + dependency)
- `sales` — sales / GTM (customer-facing benefit + timeline)
- `customer` — external user (value + transparency)
- `team` — broad team-wide update (everyone)

b) **What's the update about?**
- File / Notion / verbal: progress, milestone, blocker, launch, escalation
- Period: weekly / monthly / one-off

c) **Cadence:** weekly digest, monthly review, one-time escalation, launch announcement

#### Step 2: Frame per audience

**Audience-aware filter:**

| Audience | Lead with | De-emphasize | Tone |
|----------|-----------|--------------|------|
| Exec | Outcome / impact / decision needed | Implementation detail | Concise, direct, action-oriented |
| Eng | Tech detail, dependency, blocker | Business framing | Specific, technical, no fluff |
| Sales | Customer benefit, timeline, talking points | Internal trade-off | Confident, customer-language |
| Customer | Value, transparency, what's next | Internal politics | Friendly, honest, no jargon |
| Team | Progress, learnings, what's next | Anything siloed | Inclusive, energizing, honest |

#### Step 3: Push back kalau lo nemu signal off

- Update lo all-positive padahal milestone slipped → "Lo mau cover-up atau lo emang gak liat risk?"
- Update terlalu detail untuk exec → "Cut 60%. Exec butuh impact, bukan log."
- Update terlalu vague untuk eng → "Specific please — issue ID, file, deadline."

#### Step 4: Output

Template berbeda per audience:

##### Exec / Leadership

```markdown
# [Project] Status — [Date]

**TL;DR:** [1 sentence — on track / at risk / off track + biggest signal]

**Decision needed:** [Yes / No — kalau yes, isi di bawah]

## Wins this period
- [Outcome with metric]

## At risk / Off track
- [Issue] — [impact] — [decision needed by [date]]

## What we need from you
- [Specific ask, decision, or unblock]
```

##### Eng

```markdown
# [Project] — Eng Update [Date]

## Shipped
- [Issue ID] — [what shipped]

## In flight
- [Issue ID] — [status, ETA, blocker?]

## Coming up
- [Issue ID] — [scope, dep]

## Blocked / Help wanted
- [Issue] — [what's blocking, who can help]

## Tech context (kalau relevant)
- [Migration, deprecation, new tooling]
```

##### Sales / GTM

```markdown
# [Feature] — GTM Update [Date]

**ETA:** [date or window]
**Status:** [On track / At risk]

## What's shipping
[1-2 paragraf customer-language]

## How to talk about it
- **Lead with:** [key benefit]
- **Avoid:** [what's not in scope yet]
- **Talking point:** [specific scenario]

## Customer-facing date
[When is this announceable]
```

##### Customer

```markdown
# [Feature] is [coming / live]

**For:** [user segment]

[Plain-language explanation: what it does, what problem it solves, what changes]

## What's new
- [Feature] — [benefit]

## What's NOT changing
[Address common worry]

## Need help?
[Support link / contact]
```

##### Team

```markdown
# [Project] Weekly — [Date]

## Wins
- [Outcome]

## Learnings
- [What we learned, what we changed]

## Coming up
- [Next milestone]

## Shoutouts
- [Person] for [thing]
```

---

## Mode 4: `--retro` (Post-launch reflection)

**Peran:** Reflective PM. **Goal:** structured reflection — what surprised us, what's the gap.

### Workflow

#### Step 1: Tangkap launch context

Tanya:
- **Feature / project name** + launch date
- **Time since launch** — minimum 1 sprint pasca-launch (kalau lebih cepat, retro premature)
- **Original PRD path / link** — buat compare expectation vs reality
- **Metric source** — BigQuery, Amplitude, Notion log

#### Step 2: Pull data (kalau MCP connected)

Kalau BigQuery MCP connected, tawarin pull metric:
- Adoption rate (vs target)
- Activation / completion rate
- Error rate
- Retention impact

User confirm query yang dipake. Skill jalanin, tampilkan hasil.

#### Step 3: Structured reflection (forcing questions)

Push PM jawab — bukan kasih template kosong:

##### Outcome vs hypothesis
1. **"Hypothesis lo: [from PRD]. Reality: [data]. Gap-nya gimana? Hypothesis confirmed, partially confirmed, atau salah?"**
2. **"Kalau salah, lo rasa miss-nya di mana — discovery, framing, atau eksekusi?"**

##### Behavior change
3. **"Behavior yang lo expect: [from PRD]. Behavior yang ke-observe: [data]. Surprise-nya apa?"**
4. **"Ada signal yang lo gak expect — positif maupun negatif?"**

##### Process
5. **"Eksekusi smooth atau kacau? Apa yang slow / unexpected? Eng dapet surprise gak pas build?"** (kalau yes → flag improvement untuk Tech Implications next time)
6. **"Stakeholder alignment — eksekutif, sales, customer — sesuai expectation atau ada friction?"**

##### Forward
7. **"Kalau lo ulang, apa yang lo ubah di discovery / PRD / rollout?"**
8. **"Apa yang harus di-fix sekarang (fast follow), apa yang di-park, apa yang di-kill?"**

#### Step 4: Output

```markdown
# Retro: [Feature / Project]

**Launched:** YYYY-MM-DD
**Retro date:** YYYY-MM-DD
**Time since launch:** N weeks

## Hypothesis vs Reality

| Hypothesis (from PRD) | Reality (data) | Verdict |
|------------------------|----------------|---------|
| [statement] | [metric / observation] | Confirmed / Partial / Incorrect |

## Metrics scorecard

| Metric | Target | Actual | Gap | Source |
|--------|--------|--------|-----|--------|
| ... | ... | ... | ... | ... |

## What surprised us

- [Positive surprise]
- [Negative surprise]

## What we got right

- [Process / decision that worked]

## What we missed

- [Discovery gap / framing miss / eksekusi issue]
- [Why we missed it — root cause, not blame]

## Process notes (next-time improvement)

- [Tech Implications was [thorough / vague] — improve by [specific change]]
- [Stakeholder alignment was [smooth / friction] — improve by [specific change]]

## Forward decisions

### Fast follow (next sprint)
- [ ] [Item] — owner [name], deadline [date]

### Parked (revisit Q[X])
- [Item]

### Killed
- [Item] — why

## Confidence update

For future similar features: confidence level on [type of bet] is [up / down / unchanged] because [evidence].
```

---

## Anti-pattern (semua mode)

- ❌ Template fill-in tanpa forcing question — lo wasting AI capability
- ❌ Override mode tanpa reason — kalau lo paksa skip --review padahal blocker ada, write-down trade-off
- ❌ Stakeholder update yang sama copy-paste ke semua audience — itu bukan comms, itu lazy
- ❌ Retro tanpa data — itu opinion, bukan retrospective
- ❌ Prio tanpa effort sanity-check dari eng — itu wishful thinking

## Integration dengan tools

| Mode | Tool yang dipake (kalau connected) |
|------|--------------------------------------|
| `--prio` | Notion (read backlog), BigQuery (reach numerator) |
| `--review` | Notion (read PRD), kalau PRD di Notion |
| `--stakeholder` | Notion (push update ke status page), Slack/Gmail (kalau MCP ada) — tapi gak auto-send, draft only |
| `--retro` | BigQuery (pull metric), Notion (push retro page) |

## Handoff downstream

- `priority.md` → input sprint planning (eng), bisa di-feed ke `engineer-manager` skill untuk capacity check
- `review.md` → kalau ada Blocker, balik ke `/pm-works` for revision
- `update.md` → ready to send / paste, audience-specific
- `retro.md` → input untuk next discovery loop (`/pm-discover`)
