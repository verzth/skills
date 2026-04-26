---
name: pm-discover
description: Synthesize raw user input (interviews, support tickets, NPS, feedback) into themes and reframe pain into hypothesis. Use when starting a new product investigation, when sitting on a pile of unprocessed user research, when deciding whether to even build something, when validating a feature request before writing a PRD, or when the team keeps debating "what's the real problem here." Pushes back on solution-prescriptive framing — extracts JTBD and opportunity, not feature requests.
---

# /pm-discover

Sintesis user research mentah → theme map. Lalu reframe: pain yang dilaporkan vs pain sebenarnya.

Output: `discovery.md` yang siap di-feed ke `/pm-works` untuk nulis PRD.

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

- "Aku punya 25 transcript interview, perlu disintesis"
- "Customer minta feature X, gue mau validasi dulu sebelum nulis PRD"
- "Tim debat terus soal problem-nya apa — gue mau structured approach"
- "Ada NPS comment + support ticket numpuk, mau cari theme"
- "Sebelum prio backlog, mau sure dulu top user pain yang mana"

## Workflow — 2 phase

### Phase 1 — Synthesize (sintesis raw input → theme)

#### Step 1: Tangkap raw input

Tanya user salah satu (atau kombinasi):

a) **File / URL** — interview transcript, NPS export, support ticket dump, feedback form result
b) **Notion page** — kalau user kasih link Notion, baca via MCP `mcp__plugin_operations_notion__*` (kalau connected)
c) **BigQuery query** — untuk support volume / NPS distribution / feature request frequency, kalau MCP `mcp__plugin_data_bigquery__*` connected
d) **Verbal dump** — user paste raw notes / quote langsung di chat

Kalau gak ada satu pun, **berhenti**. Skill ini gak buat speculate — butuh real user signal. Kasih tau user untuk balik dengan minimum 5 data point user-asli (interview snippet, ticket, NPS verbatim, dll.).

#### Step 2: Ekstrak — JTBD (Jobs To Be Done) bukan feature

Untuk setiap data point, jangan catat "user mau X". Catat:

- **Job:** Apa yang user lagi coba achieve? (bukan tools-nya, outcome-nya)
- **Trigger:** Kapan job ini muncul? (event / situasi)
- **Current solution / workaround:** Mereka sekarang ngakalin gimana?
- **Pain point:** Apa yang bikin current solution gak cukup?
- **Quote verbatim:** Kutipan asli user — keep it raw, jangan dirapihin

Output table:

| Source | Job | Trigger | Workaround | Pain | Quote |
|--------|-----|---------|------------|------|-------|

#### Step 3: Cluster theme

Group berdasarkan **kesamaan job + pain**, bukan kesamaan feature request. Contoh:

❌ **Bad cluster:** "Users yang minta CSV export"
✅ **Good cluster:** "Users yang stuck di reporting workflow karena harus copy-paste data ke spreadsheet eksternal"

Untuk tiap theme, hitung:
- **Frequency:** Berapa data point yang nge-mention?
- **Severity:** Workaround mereka cost-nya tinggi atau ringan?
- **Recency:** Recent (3 bulan terakhir) atau old?

### Phase 2 — Reframe (push back pada framing)

Setelah theme clustered, **AI ganti hat jadi Strategist** dan tanyain forcing questions ke PM.

#### Forcing questions — wajib di-RAISE, baik live atau di-log di output

Saat live session: tanyain satu-satu pake AskUserQuestion. Saat batch / async: **log eksplisit di output** sebagai section "Forcing Questions Raised" — supaya PM tau apa yang skill challenge dan bisa reflect.

**Question categories (rephrase per scenario, jangan copy-paste literal):**

1. **Data quality challenge:** "Lo bilang [klaim, e.g. '8 interview']. Tapi data konkret yang lo paste cuma [N]. Selisihnya signifikan? Bias / gap di sample?"

2. **Reframe symptom vs cause:** "Theme `[X]` punya quote `[Y]`. Apakah itu beneran tentang `[X]`, atau symptom dari masalah lain (`[Z]`)?"

3. **Opportunity sizing:** "Frequency × severity theme ini cukup justify dibangun? Atau vocal minority?"

4. **Success criteria force:** "Kalau lo solve theme ini, behavior change-nya apa? Metric specific yang bakal gerak?"

5. **Red team:** "Apa kemungkinan SALAH-nya? Kalau lo build dan gak gerak, apa yang lo missed?"

6. **Cluster validity:** "Theme ini distinct atau overlap sama theme lain?"

**SETIAP question yang skill raise WAJIB muncul di section "Forcing Questions Raised" di discovery.md** — bukan disembunyiin di chat history. PM butuh trail audit-nya buat self-reflect dan share ke tim.

Why important: forcing question yang invisible = lo PM gak tau apa yang skill bantu push back. Visibility = trust + auditability.

#### Output reframing

Tiap theme di-rewrite jadi **Hypothesis Statement**:

```
We believe that [user segment] is struggling with [job] because [pain].
If we [intervention], we expect [behavior change] which we'll measure by [metric].
We're confident in this because [evidence: quote refs + frequency].
```

## Output: `discovery.md`

Tulis file `discovery.md` di working dir, atau push ke Notion via MCP kalau connected. Struktur **wajib persis** di bawah — section ordering matter buat downstream skill consumption.

```markdown
# Discovery: [topic]

**Date:** YYYY-MM-DD
**Sources:** [list of files / Notion links / BigQuery queries]
**Total data points:** N
**Reframed by:** [PM name]

---

## TL;DR — Pursue Hypothesis

> **Lead with the one to pursue.** PM yang lagi sibuk butuh tau dalam 30 detik mana yang harus di-PRD-in.

**Recommended pursue:** Hypothesis #[X] — [1-line statement]
**Why this one:** [Bukti utama: deal value / frequency / severity yang menang]
**Next skill:** `/pm-works --spec "[hypothesis #X]"` — spec stub di section akhir

---

## Methodology

- Source mix: X interviews + Y tickets + Z NPS verbatims
- Time range: [from – to]
- Notable bias / gap: [e.g. "skewed enterprise, no SMB voice"]
- Data quality flags: [e.g. "PM klaim 8 interview tapi quote konkret cuma 4 — sample size lebih kecil dari yang dilaporkan"]

---

## Forcing Questions Raised

> Visible audit trail — apa yang skill push back / challenge ke PM.

| # | Category | Question | PM response | Resolution |
|---|----------|----------|-------------|------------|
| 1 | Data quality | "[Q raised]" | "[user response, atau 'assumed [X]' kalau async]" | "[how it shaped the output]" |
| 2 | Reframe | "[Q]" | "[response]" | "[resolution]" |
| ... | | | | |

---

## Themes (ranked by impact × frequency)

### Theme 1: [Job-based label, NOT feature label]
- **Frequency:** N/total mentions
- **Severity:** [High / Med / Low] — based on workaround cost
- **Recency:** [Recent / Mixed / Old]
- **Representative quotes:**
  - "..." — [source ref]
  - "..." — [source ref]

#### JTBD Analysis
- **Job:** [Outcome user mau achieve, BUKAN tools/feature]
- **Trigger:** [Event / situasi]
- **Workaround:** [Cara mereka ngakalin sekarang]
- **Pain:** [Apa yang bikin workaround gak cukup]

#### Hypothesis #1
**We believe that** [segment] is struggling with [job] **because** [pain].
**If we** [intervention], **we expect** [behavior change],
**which we'll measure by** [metric, target, time window].
**Confidence:** [High / Med / Low].
**Evidence:**
- [Quote ref + frequency / severity bukti]
- [Industry / market signal kalau ada]

#### Open questions (untuk validate / strengthen)
- [Q yang lo gak yakin, perlu more research]
- *Suggest follow-up:* [specific action — interview siapa, query apa]

### Theme 2: ...

---

## Tech Implications (For Eng Kickoff)

> Wajib pake **7-section format** dari `references/tech-literacy-checklist.md`. Bukan freeform observation. Ini buat eng-manager skill konsumsi langsung.

### 1. Data layer
- Schema impact: [None / New table X / Add column Y to table Z]
- Migration: [Required / None]
- Volume: [Small / Med / Large]
- Sensitive data: [None / PII / payment / health]
- Retention: [If applicable]

### 2. API / Integration
- API contract change: [None / New endpoint / Breaking change]
- Backward compat: [N/A / Required]
- External dependency: [None / [name]]
- Auth model change: [None / [description]]

### 3. Existing components affected
- [Component] — [how affected, owner team]

### 4. Compliance / Privacy / Security
- Touches: [list — none, PII, payment, health, regulated region]
- Required review: [None / Legal / Security / Privacy]

### 5. Performance / Scale
- Concurrent user expectation: [number]
- Latency tolerance: [target]
- Heavy compute: [None / Yes — what]

### 6. Effort ballpark (PM guess)
- [Days / 1-2 weeks / 1 month / 1 quarter / >1 quarter]
- *To be confirmed by engineer-manager skill*

### 7. Open technical questions for eng
- [Q1 — yang PM gak bisa jawab]
- [Q2 — ...]

---

## Out-of-scope themes (acknowledged but parked)

### [Theme name]
- **Why parked:** [reason]
- **Solved as side-effect of pursuing Theme #[X]?:** [Yes / No]
- **Revisit when:** [trigger / time window]

---

## Spec stub for `/pm-works --spec`

Copy-paste ready buat skill berikutnya:

\`\`\`
Problem: [problem statement dari hypothesis terpilih]
Success metric: [metric + target + time window]
Constraints:
- [User-facing constraint]
- [Business constraint]
- [Compliance constraint]
\`\`\`

---

**Generated by:** pm-discover
**Ready for:** /pm-works --spec
```

## Integration dengan tools

| Kondisi | Behavior |
|---------|----------|
| Notion MCP connected | Tawarin push `discovery.md` ke Notion page (default: ke folder PM Discovery yang user tunjuk) |
| BigQuery MCP connected | Tawarin pull support ticket / NPS aggregate untuk validasi frequency theme |
| Pencil MCP connected | Skip — discover gak butuh design |
| Tidak ada MCP | File saved as local `discovery.md`, user copy manual |

## Anti-pattern (jangan dilakuin)

- ❌ Ngerangkum interview tanpa cluster theme — itu summary, bukan discovery
- ❌ Pake feature request user as-is jadi theme — selalu reframe ke job/pain
- ❌ Skip forcing questions kalau theme keliatan obvious — justru theme obvious yang sering paling lemah
- ❌ Recommend "build all themes" — discovery harus berani prio top 1-2 theme
- ❌ Asumsi user pake "AI tools" / "Notion AI" — kita yang sintesis raw, bukan delegasiin

## Handoff

Output `discovery.md` jadi **input wajib** untuk `/pm-works --spec`. Hypothesis statement yang lo hasilkan akan jadi Problem Statement di PRD.

Kalau hasil discovery menunjukkan **theme yang gak worth dibangun**, output juga valid — itu artinya `/pm-decide --prio` akan dapet input "park theme ini" yang berharga.
