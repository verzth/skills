# Debug Playbook

Detail untuk `/em-review` Mode B. 5-step investigation, hypothesis-driven, **no blind fixes**.

---

## Iron Rule

> **No fixes without root cause confirmed.**

Patch yang ship sebelum hypothesis confirmed = future bug yang akan recur. Symptom ≠ root cause.

---

## Step 1: Reproduce

### Tujuan
Gak bisa repro = gak bisa debug. **Stop kalau cuma 1 anecdotal report tanpa repro path.**

### Reliability levels

| Level | Description | Action |
|-------|-------------|--------|
| **Consistent** | Repro 100% dengan langkah jelas | Proceed to Step 2 |
| **Intermittent** | Repro sometimes, butuh observability | Instrument, gather data, retry |
| **Anecdotal** | Single report, gak bisa repro | **Stop**. Instrument observability dulu. |

### Forcing questions

1. "Bug ini: a) Repro consistent (langkah jelas) b) Repro intermittent (perlu more obs) c) Anecdotal (gak bisa repro)"
2. "Kalau (c) — stop dan instrument. Kasih tau user: bug yang gak bisa di-repro = bug yang akan recur."

### Anti-pattern

❌ **"Cannot reproduce, closing."** Tanpa instrument observability dulu = bug yang akan kembali.

❌ **"Customer report, gue assume legit."** Repro path harus established sebelum waktu engineer di-spend.

---

## Step 2: Isolate

### Tujuan
Narrow surface ke **minimum repro case** (smallest input + state yang reproduce bug).

### Techniques

- **Disable feature flag** yang gak related → masih repro?
- **Test dengan input subset** → mana yang trigger?
- **Run di env berbeda** (staging vs local) → consistent?
- **Strip dependencies** — kalau bug di service A→B→C, isolate apakah B atau C yang misbehave
- **Time-based isolation** — kalau bug muncul setelah deploy X, bisect git history
- **Data-based isolation** — affected user/record share property yang common?

### Output

Minimum repro case sebagai code/script + state setup.

### Forcing questions

1. "Minimum repro case udah established? a) Yes b) Still narrowing c) Cannot narrow further (proceed dengan caveat)"
2. "Pattern di affected — same user segment? same time window? same data shape?"

---

## Step 3: Hypothesize

### Tujuan
List 3 hypothesis, rank by likelihood. Hypothesis yang testable.

### Format per hypothesis

```
Hypothesis [N] (likelihood: high/medium/low):
- **Statement:** [what's wrong, in declarative form]
- **Evidence supporting:** [log line, metric, code reading, similar past bug]
- **Evidence against:** [if any, be honest]
- **Test plan:** [how to verify or refute — concrete action]
```

### Likelihood rationale

- **High** — strong supporting evidence, no contradicting evidence, similar past bug
- **Medium** — some supporting evidence, gap in knowledge
- **Low** — speculative, weak evidence, but plausible enough to test

### Hypothesis sources (where to look)

- Recent code changes (git log on affected file)
- Recent infra changes (deploy, config, scale)
- Recent dependency updates
- Recent user behavior change (load, pattern)
- Known existing tech debt yang touched
- Time correlation (cron job? business hour pattern?)

### Forcing questions

1. "Top hypothesis confidence: a) High (evidence strong, test plan clear) b) Medium (need more data) c) Low (still guessing — keep observing)"
2. "Hypothesis count — minimum 2 alternatives considered? Single-hypothesis investigation = confirmation bias risk."

---

## Step 4: Test

### Tujuan
Verify each hypothesis dengan **evidence**, bukan opinion. Don't blind-fix.

### Per hypothesis

| Action | Evidence collected | Verdict |
|--------|---------------------|---------|
| Run targeted unit test | Test output (pass/fail/exception) | Confirmed / Refuted / Inconclusive |
| Add temporary log line, repro | Log line content | Confirmed / Refuted / Inconclusive |
| Read code path | Code reading note | Confirmed / Refuted / Inconclusive |
| Run instrumented repro | Trace / metric data | Confirmed / Refuted / Inconclusive |

### Verdict definitions

- **Confirmed** — evidence directly supports hypothesis (e.g. expected log line matched)
- **Refuted** — evidence contradicts hypothesis
- **Inconclusive** — evidence gathered tapi gak decisive — refine hypothesis atau collect more

### Forcing questions

1. "Test [X] — verdict: a) Confirmed b) Refuted c) Inconclusive — keep gathering"
2. "Multiple hypothesis confirmed simultaneously — check kalau hypothesis ada subset/superset relationship"

---

## Step 5: Diagnose & Propose Fix

### Tujuan
**Root cause stated explicit.** Symptom ≠ root cause.

### Symptom vs root cause

❌ **Symptom-stated:**
> "Service X returns 500 on endpoint /orders"

✅ **Root-cause-stated:**
> "OrderRepository.find() throws IllegalStateException when transaction isolation conflicts with read-after-write — race between insert and read in concurrent request handling"

### Why-chain (ask 5 whys)

```
Bug: API returns 500
↓ Why?
Endpoint throws unhandled exception
↓ Why?
Database query returns inconsistent state
↓ Why?
Race condition between insert and read
↓ Why?
Transaction isolation level READ_COMMITTED + concurrent insert
↓ Why?
Service uses default isolation, never set to SERIALIZABLE for this critical path
                ↑
               Root cause
```

Stop deeper kalau hit organizational / external boundary (e.g. "tim gak punya budget upgrade DB" = real root cause yang gak bisa di-solve teknis).

### Fix scope decision

| Scope | Description | Routing |
|-------|-------------|---------|
| **Local** | 1-3 file, contained, tactical | Engineer role (skill matched per env) — handoff per fix PR |
| **Architectural** | Cross-module, design issue | Loop ke `/em-plan` dengan flag "rooted in production bug X" |
| **Process** | CI gap, test gap, observability gap | Ticket via `/em-works` next sprint (route ke engineer/qa-reviewer/devops role per gap type) |

### Why not caught earlier?

Wajib answer ini di output. Memorialize untuk preventative learning:

- Test gap? — add regression test
- Observability gap? — add metric/log/trace
- Review gap? — add to code-review-rubric.md
- Architecture gap? — flag to em-plan untuk future similar work

### Forcing questions

1. "Root cause confirmed: a) Yes (evidence: ...) b) Strong hypothesis (more verification needed) c) Guessing (continue investigation)"
2. "Fix scope: a) Local b) Architectural c) Process"
3. "Test buat regression: a) Yes (test name) b) Akan ditambah di fix PR c) Belum decide"
4. "Why not caught earlier — gap type: a) Test gap b) Observability gap c) Review gap d) Architecture gap"

---

## Common Anti-patterns in Debugging

### ❌ Blind fix
"Restart fixes it" — gak diagnosis. Restart hides root cause. Bug akan recur.

### ❌ Symptom patch
"Add try/catch around the failing line" — masking, bukan fixing. Future bug akan emerge dengan less visibility.

### ❌ Single hypothesis
"It's definitely the cache" — confirmation bias. Always ≥ 2 hypothesis dipertimbangkan.

### ❌ "Cannot reproduce, closing"
Tanpa instrument observability. Anecdotal yang dipencet hilang = bug yang akan kembali.

### ❌ Skip regression test
Bug yang fix-nya gak punya test bakal recur. Always test.

### ❌ Architectural fix dilempar ke engineer ticket
Tanpa loop ke `/em-plan`. EM bypass own job. Engineer fix locally, pattern propagates ke service lain.

### ❌ Stop di proximate cause
"Engineer X membuat bug" — bukan root cause, itu blame. Sistem-nya kenapa allow this bug? Test? Review? Process?

---

## Output Linkage

Debug output (`debug-<bug-id>.md`) feed:
- **Local fix** → engineer role (skill matched per env)
- **Architectural fix** → `/em-plan` (re-planning context: production bug drove re-frame)
- **Process fix** → `/em-works` next sprint ticket
- **Lessons** → update `references/code-review-rubric.md` atau `references/architecture-checklist.md` kalau pattern generalizable

Self-improving loop: debug findings → reference doc updates → fewer similar bugs di future.
