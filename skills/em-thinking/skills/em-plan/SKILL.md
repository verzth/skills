---
name: em-plan
description: Receive engineering intake (PRD, design doc, bug repro, ad-hoc request) and produce an architectural plan with risk tier, scope challenge, invariants, failure modes, and test strategy. Use when starting a new engineering investigation, when a PRD lands and needs eng grounding, when a recurring bug needs proper plan before patching, when team debates two architectural approaches, or when a refactor request needs structured framing. Pushes back on speculative architecture — extracts boundaries and invariants, not implementation choices.
---

# /em-plan

Terima input mentah (PRD, design doc, bug repro, ad-hoc request) → produce `edd.md` yang lock architecture, risk tier, invariants, failure modes, dan test strategy.

Bukan execution detail (task breakdown, env, deploy) — itu `/em-works` job. Bukan code review — itu `/em-review` job. **em-plan = pikirin sebelum kerja.**

## ⚠ Question Format Rule (wajib semua skill di em-thinking)

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

User: "1a, 2b" — done. Detail di [../../ETHOS.md](../../ETHOS.md) prinsip #8.

## Kapan trigger skill ini

- "PRD dari `/pm-works` udah ready, gue mau eng plan"
- "Bug recurring di production, gue butuh proper plan sebelum patch"
- "Founder minta feature X — gue belum yakin scope eng-nya"
- "Tim debat 2 approach (microservice vs module) — butuh structured framing"
- "Refactor module Y — mau plan proper sebelum start"
- "Plan dari junior eng — gue mau audit framing-nya"

## Workflow — 4 phase

### Phase 1 — Capture & Risk-Classify

#### Step 1: Tangkap input

Tanya user salah satu:

a) **PRD / discovery.md** — output dari pm-thinking (path / Notion link)
b) **Design doc** — markdown / Notion / Pencil canvas
c) **Bug repro** — stack trace + repro steps + observed behaviour
d) **Ad-hoc verbal** — user paste plain English request
e) **Existing code** — refactor request, "module X mau di-rework"

Kalau gak ada satu pun → **berhenti**. Skill ini gak speculate. Kasih tau user untuk balik dengan minimum 1 concrete artifact.

#### Step 2: Klasifikasi risk tier

Wajib state explicit di awal — risk tier nentuin discipline yang harus apply (test-first, security review, dll).

| Tier | Surface | Examples | Required discipline |
|------|---------|----------|---------------------|
| **T0 — Critical** | Irreversible operations, security boundaries (auth/authz, secrets), state machines with concurrency, external system contracts (idempotency, exactly-once), sensitive data (PII, regulated, financial, health) | Critical write path, login/session handling, distributed lock, webhook receiver, data export with sensitive fields | Test-first wajib. `security-reviewer` role parallel. Postmortem-grade documentation. |
| **T1 — High** | Schema migration, breaking API, multi-service coordination, observability gap di area sensitif | Add NOT NULL column, change response field type, cross-service transaction | Test strategy explicit. Migration plan reviewed. Backward compat addressed. |
| **T2 — Standard** | Single-module feature, additive backward-compat, isolated surface | New endpoint with feature flag, internal helper module | Standard test coverage. Invariants stated. |
| **T3 — Trivial** | Config / docs / dev tooling / style | README update, CI workflow tweak, lint rule | Sanity check only. Skip heavy review. |

Detail klasifikasi di [../../references/risk-tiering.md](../../references/risk-tiering.md).

T0/T1 → wajib test-first di Phase 4. T2/T3 → fast lane, tetep wajib invariant statement min 1.

### Phase 2 — Step-0 Scope Challenge

> Do this **before** designing architecture. Scope locked first → architecture second.

Forcing questions (one issue = one AskUserQuestion):

1. **What already exists** — code/flow yang udah partially solve problem ini?
   - Skill harus *search* (Grep/Glob), bukan tanya user. Cari similar function, similar module, similar pattern.
   - Output: list dengan reuse decision per item ("reuse / extend / parallel-build with rationale").

2. **Minimum change set** — kalau goal cuma X, apa yang bisa di-defer?
   - Push back kalau scope mengandung "while we're at it..." — itu scope creep.
   - Output: in-scope vs deferred (NOT-in-scope) list.

3. **Complexity smell check** — proposal nyentuh >8 file atau introduce >2 new class/service?
   - Trigger scope-reduce conversation kalau yes.
   - AskUserQuestion: "Plan ini nyentuh N file (>8). Reduce scope, atau lanjut as-is dengan justifikasi?"

4. **Built-in check** — framework/runtime punya built-in untuk pattern ini?
   - Search "{framework} {pattern} built-in" sebelum custom solution.
   - Search "{pattern} pitfalls" untuk known footguns.
   - Kalau WebSearch unavailable, note: "Search unavailable — proceeding with in-distribution knowledge only."

5. **Two-week smell test** — competent engineer baru bisa ship feature ini dalam 2 minggu?
   - Kalau gak, masalahnya di onboarding/architecture/docs, bukan di feature itu sendiri.
   - Flag sebagai "onboarding problem masked sebagai architecture" kalau triggered.

Setelah Phase 2: **commit to scope.** Don't re-argue scope di Phase 3-4. Kalau scope berubah → loop balik ke Phase 1.

### Phase 3 — Architecture Design

Apply 15 cognitive patterns sebagai **lens**, bukan checklist mati. Detail di [../../references/cognitive-patterns.md](../../references/cognitive-patterns.md).

Sub-step:

#### 3.1 — State Diagnosis (Larson)
Tim ini di state apa?
- a) **Falling behind** — backlog menumpuk, on-call lelah, ship lambat → intervention: reduce WIP, simplify
- b) **Treading water** — ship kerja tapi gak progress strategis → intervention: reclaim slack
- c) **Repaying debt** — actively cleaning up → intervention: protect from new scope
- d) **Innovating** — foundation kuat, tim explore → intervention: bounded experiments

Plan harus kontekstual sama state. Plan ambitious untuk tim "falling behind" = menambah pain.

#### 3.2 — Component & Data Flow

Wajib produce:
- **Component boundaries** — apa di dalam scope, apa di luar (ASCII box diagram)
- **Data flow** — request masuk dari mana, lewat apa, keluar ke mana (ASCII arrow diagram)
- **State machine** — kalau ada state >2, ASCII state diagram
- **Trust boundaries** — di mana data validated, di mana di-trust apa adanya
- **Single points of failure** — identify, then decide accept atau mitigate

Diagram **wajib** untuk non-trivial flow (>2 hop). Skip diagram = anti-pattern.

#### 3.3 — Invariants (min 1)

"What must always be true." Statement yang lebih spesifik dari prose, tapi gak harus formal logic.

✅ Good:
- "Account balance can never be negative."
- "Once a webhook event is acknowledged, it is processed exactly once."
- "Session tokens are never logged or persisted in plaintext."

❌ Bad:
- "TBD" — kalau gak bisa state, plan belum ready
- "Code is clean" — bukan invariant, itu aspirasi
- "No bugs" — bukan invariant, itu impossible

#### 3.4 — Cognitive Pattern Citation (min 2)

Cite cognitive pattern yang aktually shape decision di plan ini. Bukan empty signaling.

✅ Good:
- "Boring by default — picked Postgres over <new shiny db> karena tim udah operate Postgres 3 tahun. Innovation token saved untuk feature X."
- "Reversibility — feature flag default off, canary 5% → 25% → 100%. Rollback < 5 minute via flag toggle."

❌ Bad:
- "We applied Conway's Law." — gak nyambung ke decision spesifik
- (Tanpa citation sama sekali) — generic review

### Phase 4 — Test Strategy

T0/T1 → mandatory test-first. T2/T3 → standard coverage.

#### Failure modes table

Wajib enumerate. Per row:

| # | Scenario | Test? | Handling? | Visible to user? | Severity |
|---|----------|-------|-----------|-------------------|----------|
| 1 | Network timeout to upstream | ✓ | ✓ retry | Loud retry message | Med |
| 2 | Race condition di concurrent write | ✗ | ✗ | Silent corruption | **Critical gap** |

Critical gap = no test + no handling + silent. Critical gap > 0 → block sebelum em-works.

#### Coverage targets

- Core invariant — 100% (mandatory T0/T1)
- Error paths — explicit list
- Edge cases — explicit list (empty input, max input, concurrent access, partial failure)
- Integration — required interactions covered

Forcing questions:
1. "Failure mode #X — accept gap atau block? a) Accept (rationale) b) Block c) Defer ke ticket follow-up"
2. "Test-first untuk T0 surface — apply 100% atau partial dengan justifikasi? a) Full b) Partial X% c) No (justify)"

## Output: `edd.md` + `edd.html` (dual output)

**WAJIB tulis 2 file** di working dir:

1. **`edd.md`** — source markdown (struktur di bawah, wajib persis untuk downstream skill consumption)
2. **`edd.html`** — human-readable review version, self-contained dengan inline CSS (badge T0-T3 colored, ASCII diagram styled, failure modes table critical-gap highlighted, TOC + breadcrumb)

HTML render pakai template + full CSS spec dari [`../../references/html-template.md`](../../references/html-template.md). Konten harus konsisten 1:1 dengan markdown — same data, beda rendering. Skip HTML = anti-pattern (user explicitly review via HTML).

Push opsional: kalau Notion MCP connected, tawarin push `edd.md` ke Notion (markdown render native di Notion). HTML keep local buat browser review.

### MD Structure (wajib persis)

```markdown
# EDD: [topic]

**Date:** YYYY-MM-DD
**Risk tier:** T0 / T1 / T2 / T3
**Source:** [PRD path / Notion link / verbal description]
**Planned by:** em-plan
**State diagnosis:** [Falling behind / Treading water / Repaying debt / Innovating]

---

## TL;DR — Recommended Path

**Problem (1 line):** ...
**Architecture summary (1 paragraph):** ...
**Critical invariants:** [bullet list]
**Critical gaps:** N (must resolve before em-works)
**Recommended path:** [proceed to em-works / scope-reduce first / send back to PM]
**Next skill:** `/em-works` (kalau ready) atau `/em-plan --rescope`

---

## Step-0 Scope Findings

- **What already exists:** [refs + reuse decision per item]
- **Minimum change set:** [in-scope items]
- **NOT in scope:** [items deferred + 1-line rationale each]
- **Complexity smell:** [yes — N files / no]
- **Built-in available:** [yes — what / no — search performed]
- **Two-week feasibility:** [yes / no — root cause if no]

---

## Architecture

### Component boundaries

\`\`\`
[ASCII box diagram]
\`\`\`

### Data flow

\`\`\`
[ASCII arrow diagram]
\`\`\`

### State machine (if applicable)

\`\`\`
[ASCII state diagram]
\`\`\`

### Trust boundaries

- [boundary 1 — what data crosses, what's validated, what's trusted]
- [boundary 2 — ...]

### Single points of failure

- [SPOF 1 — accept rationale OR mitigation plan]

### Cognitive patterns applied

- **[Pattern X]** → applied to [decision Y] because [reason]
- **[Pattern Z]** → applied to [decision W] because [reason]

(Min 2-3 — cited explicitly, connected to concrete decision)

---

## Invariants

- [Invariant 1 — what must always be true]
- [Invariant 2 — ...]

---

## Failure Modes

| # | Scenario | Test? | Handling? | UX | Severity |
|---|----------|-------|-----------|-----|----------|

**Critical gaps:** [items with no test + no handling + silent]

---

## Test Strategy

- **Test-first required:** [yes (T0/T1) / no]
- **Coverage targets:**
  - Core invariant: [target %]
  - Error paths: [list]
  - Edge cases: [list]
  - Integration: [list]
- **Test types:** [unit / integration / contract / e2e — applicable mix]

---

## Forcing Questions Raised

| # | Phase | Question | Response | Resolution |
|---|-------|----------|----------|------------|
| 1 | Scope | "[Q]" | "[user response]" | "[how it shaped output]" |

---

## Open Questions for em-works

- [Q answerable di execution prep, e.g. infra prereq, secret management]
- [Q yang harus di-resolve sebelum task breakdown]

---

## Handoff

- **Next skill:** `/em-works`
- **Required input:** this file + [referenced docs]
- **Required follow-up review (route by role, not skill name):**
  - `security-reviewer` role — kalau T0 + sensitive surface
  - `qa-reviewer` role — kalau T0/T1 + complex test surface
  - none — kalau T2/T3
- **Block conditions:** critical gaps > 0 → must resolve before em-works

---

**Generated by:** em-plan
**Ready for:** /em-works
```

## Integration dengan tools

| Kondisi | Behavior |
|---------|----------|
| Notion MCP connected | Tawarin push `edd.md` ke Notion engineering page (HTML keep local) |
| BigQuery MCP connected | Tawarin pull metric data buat validate scale assumption (concurrent users, query volume) |
| Pencil MCP connected | Tawarin generate diagram dari ASCII (kalau user prefer visual) |
| WebSearch tool available | Auto-search built-in check di Phase 2 step 4 |
| Tidak ada MCP | Files saved as local `edd.md` + `edd.html`, user open `edd.html` di browser |

## Anti-pattern (jangan dilakuin)

- ❌ **Skip `edd.html` output.** Dual output (`.md` + `.html`) mandatory — user review via HTML.
- ❌ **Skip risk tier.** Bikin downstream gak punya gate yang bener.
- ❌ **Jumping ke implementation.** "Pake Postgres + Kafka" di Phase 3 tanpa state diagnosis = anti-pattern.
- ❌ **Skip "what already exists" search.** Bikin tim rebuild parallel infrastructure.
- ❌ **"Critical invariant: TBD"** — kalau gak bisa state, plan belum ready.
- ❌ **Cite cognitive pattern tanpa connect ke decision konkret.** Empty signaling.
- ❌ **Skip ASCII diagram untuk flow > 2 hop.** Diagram bukan optional.
- ❌ **Recommend gede-gedean ke T2/T3.** Over-engineering = sin.
- ❌ **Bundle refactor + feature di plan yang sama.** Beck's principle: make change easy, then make easy change. Two plans.
- ❌ **Plan untuk tim "falling behind" yang nambah scope.** Menambah pain, bukan reducing.

## Handoff

Output `edd.md` jadi **input wajib** untuk `/em-works`. Critical gaps di failure modes → blocker, harus resolve dulu.

Kalau hasil em-plan menunjukkan **scope terlalu besar atau approach fundamentally wrong**, output juga valid — itu artinya `/pm-works` perlu di-loop balik dengan reframed problem, atau scope di-reduce sebelum lanjut.

Kalau T0 dengan security/compliance surface → trigger `security-reviewer` role parallel ke `/em-works`. Kedua jalan paralel, hasil security findings feedback ke em-works pre-handoff checklist.
