# Code Review Rubric

Detail untuk `/em-review` Mode A. 4-section review dengan severity levels dan decision matrix.

---

## Pakai Di Mana

- `/em-review` Mode A workflow — semua 4 section wajib evaluated
- Anti-skip rule — even kalau "no issues found", evaluate dan state explicit

---

## Section 1: Architecture Conformance

### Tujuan
Match PR ke `edd.md` + `eng-works.md`. Deviation harus justified.

### Items to check

- [ ] **PR scope match plan** — implements ticket dari eng-works, gak menyimpang
- [ ] **No new module unjustified** — module baru yang gak di plan = deviation
- [ ] **Boundaries preserved** — trust boundaries dari plan dipertahankan
- [ ] **Conway's Law** — module ownership clear, gak crossing tim ownership tanpa coord
- [ ] **Existing patterns reused** — gak parallel-build yang udah ada

### Severity levels

- **Block** — Architecture deviation yang nge-affect invariant atau failure mode dari plan
- **Major** — New module yang gak di plan, perlu update plan dulu
- **Minor** — Pattern deviation yang debatable, suggest discuss

### Forcing question template

1. "Issue [#X] — severity: a) Block b) Major c) Minor d) Info"
2. "PR introduce module Y yang gak di plan. a) Justified deviation (rationale: ...) b) Out of scope (split jadi PR terpisah) c) Plan harus di-update via /em-plan"

---

## Section 2: Code Quality

### Tujuan
Code maintainable, follows team convention, no over/under-engineering.

### Items to check

- [ ] **DRY** — repetition aggressive flagged
- [ ] **Error handling** — explicit, with recovery atau loud failure
- [ ] **Edge cases** — missing edge cases flagged (empty, null, max, concurrent)
- [ ] **Naming** — descriptive, consistent dengan codebase
- [ ] **Tech debt hotspots** — touched code dengan known debt — leave or refactor?
- [ ] **Right-sized diff** — > 500 line diff: justified atau split? Necessary rewrite tapi compressed: red flag.
- [ ] **Make change easy + make easy change** — refactor + behavior bundled? Block.
- [ ] **Stale ASCII diagram** — touched code dengan inline diagram comment? Update or flag.
- [ ] **Observability** — log, metric, trace cukup untuk future debugging?

### Severity levels

- **Block** — DRY violation di T0/T1 path, missing error handling di critical path, refactor + feature bundled
- **Major** — Edge case missed, technical debt yang ditambah unjustified
- **Minor** — Naming improvement, suggestion non-blocking

### Forcing question template

1. "Pattern duplikasi di [file A] dan [file B] — extract atau leave? a) Extract (DRY) b) Leave (premature abstraction risk) c) TODO follow-up"
2. "Diff size: N line. a) Justified (single logical change) b) Split jadi 2-3 PR c) Backfill commit history with smaller commits"

---

## Section 3: Test Coverage

### Tujuan
Test strategy dari plan implemented. Failure modes dari plan covered.

### Items to check

- [ ] **Test-first untuk T0/T1** — tests written sebelum implementation (commit history check)
- [ ] **Failure modes covered** — setiap row di failure modes table dari plan punya test
- [ ] **Edge cases** — empty, max, null, concurrent, partial failure
- [ ] **Boundary tests** — at min, at max, at zero
- [ ] **Integration coverage** — required interactions tested
- [ ] **No skipped/disabled tests** — kalau ada `skip` atau `xit`, justify
- [ ] **Test naming** — descriptive, matches what's tested

### Severity levels

- **Block (T0/T1)** — Failure mode dari plan gak ada test, OR critical edge case missing
- **Block (T2)** — Test missing untuk core invariant
- **Major** — Test exists tapi assertion lemah
- **Minor** — Test naming suggestion, additional case yang nice-to-have

### Forcing question template

1. "Failure mode #X dari eng-plan — test coverage? a) Yes (test name: ...) b) No (block) c) Deferred (justify)"
2. "Edge case [empty / null / max / concurrent] — covered? a) Yes b) Subset c) No (block T0/T1, allow T2/T3 with note)"
3. "Test commit timing — pre atau post implementation? a) Pre (test-first) b) Same commit c) Post (red flag T0/T1)"

---

## Section 4: Performance

### Tujuan
No obvious performance footgun. N+1 queries flagged. Memory hotspots aware.

### Items to check

- [ ] **N+1 queries** — loop over records dengan DB query inside? Flag.
- [ ] **Memory allocation hotspot** — large slice/map allocation in tight loop, leak risk
- [ ] **Caching opportunity** — read-heavy + immutable data without cache?
- [ ] **High-complexity path** — O(n²) or worse where O(n log n) possible
- [ ] **Database indexes** — new query path uses existing index, atau perlu new index?
- [ ] **External API calls** — rate limit aware, retry policy, timeout configured

### Severity levels

- **Block** — N+1 di T0/T1 endpoint, memory leak risk, missing index untuk query yang nge-table-scan
- **Major** — Caching opportunity yang clear, complexity hotspot di hot path
- **Minor** — Suggestion, nice-to-have optimization

### Forcing question template

1. "Loop di [file] iterates over [N items] dengan DB query inside — N+1 risk. a) Refactor batch query (block) b) Acceptable (N small, justify) c) TODO with index/cache plan"
2. "External API call di [file] — timeout configured? Rate limit aware?"

---

## Severity Levels Summary

| Severity | Action |
|----------|--------|
| **Block** | Must fix sebelum merge. Request changes. |
| **Major** | Discuss; can defer ke follow-up PR dengan ticket. |
| **Minor** | Comment; engineer decides. |
| **Info** | FYI, no action needed. |

---

## Decision Matrix

| Block count | Major count | Minor count | Decision |
|-------------|-------------|-------------|----------|
| 0 | 0 | any | **Approve** |
| 0 | ≤ 2 (with TODO ticket) | any | **Approve** with follow-up tickets |
| 0 | ≥ 3 | any | **Comment** (engineer decide if PR splits or merges) |
| ≥ 1 | any | any | **Request changes** |

Engineer judgment override allowed dengan rationale di output.

---

## Anti-pattern Reviewer (jangan dilakuin)

- ❌ **"LGTM" tanpa annotation di T0/T1 PR.** Review unmoored.
- ❌ **Approve tanpa baca eng-plan.** Grounding lemah.
- ❌ **Skip section.** Anti-skip rule — even "no issues" must be stated explicit.
- ❌ **Batch multiple issues into one AskUserQuestion.** One issue = one question.
- ❌ **"Add tests later" sebagai negotiable di T0/T1.** Block harus block.
- ❌ **Severity inflation** — flag everything as block. Trust erodes.
- ❌ **Severity deflation** — flag block as minor. Bug ships.
- ❌ **Re-architect via review.** Kalau architectural concern muncul, suggest /em-plan loop, jangan dictate redesign di review thread.

---

## Self-check: Apakah review ini berkualitas?

- [ ] Setiap finding linked ke file:line specific
- [ ] Setiap finding referenced ke section eng-plan / failure mode
- [ ] Severity assigned per finding
- [ ] One issue = one AskUserQuestion (anti-batch)
- [ ] Decision konsisten dengan severity counts (matrix)
- [ ] Tone: actionable, bukan judgmental
