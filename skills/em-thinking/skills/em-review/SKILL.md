---
name: em-review
description: Review what comes back from engineers — Mode A code review (PR review against edd, bug-first, regression-first), Mode B debug (root cause investigation when production bug emerges, hypothesis-driven, no blind fixes). Use when a PR is ready for engineering manager review, when a bug appears in staging or production and needs structured root-cause analysis, when CI fails repeatedly with unclear root cause, or when investigating recurring issues. Pushes back on LGTM-without-grounding and on patches-without-root-cause.
---

# /em-review

Review what comes back. Skill ini multi-mode:

- **Mode A — Review:** PR code review, bug-first, grounded di `edd.md` + `eng-works.md`
- **Mode B — Debug:** Root cause investigation when bug emerges, hypothesis-driven

**Pick mode in this priority order:**

1. **Explicit flag** (`--review` / `--debug`) — highest priority, always honored
2. **Auto-detect from input** — fallback when no flag:
   - Input contains PR ref (diff, link, SHA, "PR #N", patch file) → **Mode A (review)**
   - Input contains stack trace, error log, "bug", "error", "crashed", "failing", "production issue" → **Mode B (debug)**
3. **Ask user** — only if input ambiguous (both signals or neither). Use AskUserQuestion: "Pilih mode: a) Review (PR diff) b) Debug (bug investigation)"

## ⚠ Question Format Rule

Lihat [../../ETHOS.md](../../ETHOS.md) prinsip #8. Numbered questions, AskUserQuestion kalau available.

## Kapan trigger skill ini

**Mode A (review):**
- "PR dari engineer Y udah ready, mau review"
- "Batch review end-of-lane (3 PR yang related)"
- "Mau audit apakah PR sesuai dengan edd invariant"

**Mode B (debug):**
- "Production error spike di endpoint X, gue investigate"
- "Bug recurring di test, mau root cause"
- "CI flaky, gak yakin underlying cause"
- "Customer report bug yang gak bisa di-repro internal"

## Mode A — Code Review

### Input
- PR diff (link atau patch file)
- `edd.md` + `eng-works.md` (untuk grounding review)
- CI run output

Kalau plan/works files gak ada → **flag explicitly**. Review tetep bisa jalan tapi grounding lemah. Tanya user: "PR ini punya plan reference? a) Yes (path) b) No, review ungrounded c) Generate plan retroaktif via /em-plan"

### Workflow — 4 section review

**Anti-skip rule:** Semua 4 section wajib evaluated, walaupun "no issues found". Skip = anti-pattern.

#### Section 1: Architecture conformance

Cognitive patterns aktif:
- **Match plan:** PR architecture sesuai dengan edd? Deviation justified?
- **Boundary integrity:** Trust boundary dari plan dipertahankan?
- **Conway's Law:** Module ownership clear?

Forcing questions per issue (one issue = one AskUserQuestion):
1. "PR introduce new module X yang gak ada di edd. a) Justified deviation (rationale) b) Out of scope, harus dipisah jadi PR terpisah c) Plan harus di-update dulu lewat /em-plan"
2. "Trust boundary di [file Y line Z] — ada validation yang missing. a) Add validation (block merge) b) Defer ke ticket follow-up (justify) c) Out of scope, parking lot"

#### Section 2: Code quality

Cognitive patterns aktif:
- **DRY aggressive** — flag repetition
- **Edge cases over speed** — flag missing edge cases explicitly
- **Right-sized diff** — diff terlalu besar (>500 line tanpa rationale)? Terlalu compressed (necessary rewrite squeezed)?
- **Make change easy + make easy change** — refactor + behavior bundled? Block.
- **Stale diagram check** — touched code dengan ASCII diagram inline? Update or flag.

Forcing questions:
1. "Pattern duplikasi di [file A] dan [file B] — extract atau leave? a) Extract (recommend, DRY) b) Leave (justify — premature abstraction) c) TODO follow-up"
2. "Diff size: N line. Smell besar. a) Justified (single logical change) b) Split jadi 2-3 PR c) Backfill commit history with smaller commits"

#### Section 3: Test coverage

Cognitive patterns aktif:
- **Failure modes from plan** — covered di test?
- **Tests > too few** — better over-test
- **Boundary tests** — empty, max, concurrent, partial-failure

Forcing questions:
1. "Failure mode #X dari edd — test coverage? a) Yes (test name) b) No (block) c) Deferred (justify)"
2. "Edge case [empty input / null / max value / concurrent] — covered? a) Yes b) Subset c) No (block T0/T1, allow T2/T3 with note)"

Detail rubric di [../../references/code-review-rubric.md](../../references/code-review-rubric.md).

#### Section 4: Performance

Cognitive patterns aktif:
- **N+1 query check** — DB access pattern
- **Memory concerns** — large allocation, leak risk
- **Caching opportunity** — flagged opportunity, not mandatory
- **High-complexity hotspot** — algorithm complexity

Forcing questions:
1. "Loop di [file] iterates over [N items] dengan DB query inside — N+1 risk. a) Refactor ke batch query (block) b) Acceptable (N small, justify) c) TODO with index/cache plan"

### Decision routing (Mode A)

After all 4 sections:

1. **Approve** — all blockers resolved, ready to merge → handoff ke `release-engineer` role atau direct merge
2. **Request changes** — blockers listed, fix loop → engineer fix → loop balik ke `/em-review`
3. **Comment** — minor suggestions, not blocking → engineer can merge tanpa loop

Forcing question:
- "Decision untuk PR ini: a) Approve (no blockers) b) Request changes (list di output) c) Comment (suggestions, mergeable)"

### Output: `pr-review-<sha>.md`

```markdown
# PR Review: [PR title or ID]

**PR:** [link / sha]
**Plan reference:** edd.md (path) / eng-works.md (path)
**Reviewed by:** em-review (Mode A)
**Date:** YYYY-MM-DD

---

## TL;DR

**Decision:** Approve / Request changes / Comment
**Blockers:** N
**Suggestions:** N
**Section breakdown:** Architecture (X issues) | Code quality (Y) | Tests (Z) | Performance (W)

---

## Section 1: Architecture Conformance

[Per issue: file:line, severity, recommendation, decision]

## Section 2: Code Quality

[Per issue: ...]

## Section 3: Test Coverage

[Per issue: ...]

## Section 4: Performance

[Per issue: ...]

---

## Forcing Questions Raised

| # | Section | Question | Response | Resolution |
|---|---------|----------|----------|------------|

---

## Decision

- **Outcome:** [Approve / Request changes / Comment]
- **Blockers (must fix):** [list with file:line]
- **Suggestions (nice to have):** [list]
- **Routing:**
  - Approve → `release-engineer` role atau direct merge
  - Request changes → `engineer` role (fix) → `/em-review` again
  - Comment → `engineer` role (merge dengan FYI, no loop)

---

**Generated by:** em-review (Mode A)
**Status:** [decision]
```

## Mode B — Debug

### Input
- Bug repro / stack trace / log
- Optional: `edd.md` (kalau bug menyentuh area yang udah di-plan)
- Optional: production telemetry

### Workflow — 5 step (mirror investigate skill, EM-flavored)

Detail playbook di [../../references/debug-playbook.md](../../references/debug-playbook.md).

#### Step 1: Reproduce

Gak bisa repro = gak bisa debug. Stop kalau cuma 1 anecdotal report tanpa repro path.

Forcing questions:
1. "Bug ini: a) Repro consistent (langkah-langkah jelas) b) Repro intermittent (perlu observability tambahan) c) Anecdotal saja (single report, gak bisa repro) → kalau (c), stop dan instrument dulu"

#### Step 2: Isolate

Narrow surface ke minimum repro case.

- Disable feature flag yang gak related → masih repro?
- Test dengan input subset → mana yang trigger?
- Run di env berbeda (staging vs local) → consistent?

Output: minimum repro case (smallest input + state yang reproduce bug).

#### Step 3: Hypothesize

List 3 hypothesis, rank by likelihood.

Format:
- **Hypothesis 1 (likely):** [statement]. Evidence supporting: [log/metric/code]. Evidence against: [—]. Test plan: [how to verify].
- **Hypothesis 2 (less likely):** ...
- **Hypothesis 3 (long shot):** ...

Forcing question:
1. "Top hypothesis confidence: a) High (evidence strong, test plan clear) b) Medium (need more data) c) Low (still guessing — keep observing)"

#### Step 4: Test

Verify each hypothesis. Don't blind-fix.

Per hypothesis:
- Run targeted test / instrumented repro / code read
- Capture evidence (log line, test output, code path)
- Confirmed / refuted / inconclusive?

#### Step 5: Diagnose & propose fix

Root cause stated explicit. Symptom ≠ root cause.

Fix scope decision:
- **Local fix** (1-3 file, contained) → proposal handoff ke `engineer` role
- **Architectural fix** (cross-module, design issue) → loop balik ke `/em-plan` dengan flag "rooted in production bug X"
- **Process fix** (CI gap, test gap, observability gap) → ticket via `/em-works` next sprint (route ke `engineer` / `qa-reviewer` / `devops` role per gap type)

Forcing questions:
1. "Sebelum patch, root cause confirmed? a) Yes (evidence: ...) b) Strong hypothesis c) Guessing (continue investigation)"
2. "Fix scope: a) Local (handoff engineer) b) Architectural (loop ke /em-plan) c) Process (CI/test/observability gap → ticket)"
3. "Test buat regression — udah ada? a) Yes (test name) b) Akan ditambah di fix PR c) Belum decide"

### Output: `debug-<bug-id>.md`

```markdown
# Debug Trace: [bug ID or short description]

**Reported:** YYYY-MM-DD by [source]
**Severity:** Critical / High / Medium / Low
**Investigated by:** em-review (Mode B)
**Date:** YYYY-MM-DD

---

## TL;DR

**Root cause:** [1 line]
**Fix scope:** [Local / Architectural / Process]
**Routing:** [engineer / /em-plan / /em-works ticket]
**Regression test:** [planned / existing / TBD]

---

## Step 1: Reproduce

- Repro reliability: [Consistent / Intermittent / Anecdotal]
- Repro steps:
  1. ...
  2. ...
- Min input: [...]
- Environment: [...]

## Step 2: Isolate

- Narrowing observations:
  - [observation 1]
- Minimum repro case: [...]

## Step 3: Hypothesize

### Hypothesis 1 (likely)
- **Statement:** ...
- **Evidence supporting:** ...
- **Evidence against:** ...
- **Test plan:** ...

### Hypothesis 2 (less likely)
...

### Hypothesis 3 (long shot)
...

## Step 4: Test

| Hypothesis | Test action | Evidence | Verdict |
|------------|-------------|----------|---------|
| 1 | ... | ... | Confirmed / Refuted / Inconclusive |

## Step 5: Diagnose & Fix

- **Root cause (confirmed):** ...
- **Why bug emerged:** [trigger condition]
- **Why not caught earlier:** [test gap / observability gap / review gap]

### Fix proposal
- **Scope:** Local / Architectural / Process
- **Approach:** [1 paragraph]
- **Files affected:** [list]
- **Regression test:** [test plan]

---

## Forcing Questions Raised

| # | Step | Question | Response | Resolution |
|---|------|----------|----------|------------|

---

## Routing

- **Local fix:** Handoff to `engineer` role (skill matched per env)
- **Architectural fix:** Loop balik ke `/em-plan` dengan flag "production-driven re-plan"
- **Process fix:** Ticket via `/em-works` next sprint (route ke `engineer` / `qa-reviewer` / `devops` role per gap type)

---

**Generated by:** em-review (Mode B)
**Status:** [Root cause identified / Investigation ongoing]
```

## Integration dengan tools

| Kondisi | Behavior |
|---------|----------|
| GitHub MCP connected (Mode A) | Auto-fetch PR diff, post review comments inline |
| Linear / GitHub Issues MCP (Mode B) | Auto-create issue untuk regression / process gap |
| BigQuery MCP (Mode B) | Pull production telemetry untuk evidence |
| Notion MCP | Push debug-trace.md / pr-review.md ke Notion |
| Tidak ada MCP | File saved local, user paste manual |

## Anti-pattern (jangan dilakuin)

### Mode A
- ❌ **"LGTM" tanpa annotation di T0/T1 PR.** Review unmoored.
- ❌ **Approve PR tanpa baca edd reference.** Grounding lemah.
- ❌ **Skip section.** Anti-skip rule berlaku.
- ❌ **Batch multiple issues into one AskUserQuestion.** One issue = one question.
- ❌ **"Add tests later" sebagai blocker negosiable di T0/T1.** Block harus block.

### Mode B
- ❌ **Patch sebelum hypothesis confirmed.** Blind fix masking root cause.
- ❌ **Stop di symptom.** "Restart fix it" bukan diagnosis.
- ❌ **Skip regression test.** Bug yang fix-nya gak punya test bakal recur.
- ❌ **Architectural fix dilempar ke engineer ticket tanpa loop ke /em-plan.** EM bypass own job.
- ❌ **"Cannot reproduce, closing"** tanpa instrument observability dulu. Anecdotal yang dipencet hilang = bug yang akan kembali.

## Handoff

### Mode A
- **Approve** → `release-engineer` role (skill matched per env) atau direct merge
- **Request changes** → `engineer` role fix loop → `/em-review --review` again
- **Comment** → `engineer` role merge dengan FYI, tanpa loop

### Mode B
- **Local fix** → `engineer` role (per fix PR) → `/em-review --review` per fix PR
- **Architectural fix** → `/em-plan` dengan re-frame ("production bug X drove re-plan")
- **Process fix** → `/em-works` next sprint dengan ticket "process improvement: [CI gap / test gap / observability]" (route ke `engineer` / `qa-reviewer` / `devops` role per gap type)
