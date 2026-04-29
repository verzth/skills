# Cognitive Patterns for Engineering Managers

Reference list dari 15 instinct yang experienced engineering managers develop dari literature kanonis. Bukan checklist mati — pakai sebagai **lens** saat review plan, design, atau code.

Citation eksplisit buat follow-up. Apply dengan judgment, bukan ritual.

---

## How to Use This Reference

- **At `/em-plan` Phase 3** — apply min 2 patterns yang aktually shape decision dalam architecture. Cite pattern eksplisit di section "Cognitive patterns applied".
- **At `/em-review` Mode A Section 1** — check apakah PR consistent dengan pattern dari plan. Flag deviation.
- **At `/em-review` Mode B Step 5** — check apakah debug fix consistent dengan pattern (e.g. "Failure is information" → fix harus produce learning, bukan blind patch).

Cite pattern eksplisit di output. Empty citation tanpa connect ke decision konkret = anti-pattern (lihat ETHOS #7).

---

## The 15 Patterns

### 1. State Diagnosis
**Source:** Will Larson, *An Elegant Puzzle*

Tim engineering hidup di salah satu dari 4 state, dan setiap state demand intervention berbeda:
- **Falling behind** — backlog menumpuk, on-call lelah, ship lambat. Intervention: **reduce WIP**, simplify, freeze new scope.
- **Treading water** — ship kerja, tapi gak ada progres strategis. Intervention: **reclaim slack**, automate toil.
- **Repaying debt** — actively cleaning. Intervention: **protect dari new scope**, hold the line.
- **Innovating** — foundation kuat, tim explore. Intervention: **bounded experiments** dengan time-box.

**EM connection:** Diagnose dulu sebelum prescribe. Plan ambitious untuk tim "falling behind" = menambah pain, bukan menyelesaikan.

### 2. Blast Radius Instinct
**Source:** SRE folklore, formalized di Google SRE Book

Setiap decision evaluated lewat: "What's the worst case, dan berapa banyak system/people kena?"

**EM connection:** Sebelum approve plan, mental simulate failure. Database migration yang block writes selama 10 menit → blast radius = semua user. Local config flag flip → blast radius = 1 service. Decision yang sama, blast radius beda → discipline yang apply juga beda.

### 3. Boring by Default
**Source:** Dan McKinley, *Choose Boring Technology* (2015)

> "Every company gets about three innovation tokens."

Default ke proven tech. Setiap deviation ke shiny new pattern = **spending an innovation token**. Token dikeluarin sadar, bukan by accident.

**EM connection:** Plan yang propose pattern baru harus jawab: "Token ini cukup justified? Apa yang gak bisa dilakuin dengan boring tech?" Bias ke boring = bias ke tim yang masih bisa ship cepet 2 tahun lagi.

### 4. Incremental over Revolutionary
**Source:** Martin Fowler, *Strangler Fig Application* (2004)

Refactor, jangan rewrite. Strangler fig pattern: legacy system di-wrap, fungsionalitas di-migrasi sedikit demi sedikit, sampai legacy bisa di-decommission.

**EM connection:** "Big bang rewrite" hampir selalu ide buruk. Plan yang propose rewrite harus minimal address: 1) bisa rollback gak, 2) ada milestone intermediate yang valuable, 3) feature freeze selama rewrite — diterima atau enggak.

### 5. Systems over Heroes
**Source:** SRE folklore

Design untuk tired humans at 3am, bukan untuk best engineer di best day mereka.

**EM connection:** Runbook, alert yang clear, dashboard yang first-glance-readable. Sistem yang relies on "Andi tau cara fix-nya" itu fragile. Em-works pre-handoff checklist mandate runbook draft untuk reason ini.

### 6. Reversibility Preference
**Source:** Jeff Bezos, "Type 1 vs Type 2 decisions"

Decision yang reversible (Type 2) bisa dibuat cepet. Yang irreversible (Type 1) butuh care.

Dalam eng: feature flag > big bang. Canary > 100% rollout. A/B > permanent change. Make the cost of being wrong **low**.

**EM connection:** Em-works deploy strategy default ke flag/canary buat T0/T1. Big bang reserved untuk T3 trivial only.

### 7. Failure is Information
**Source:** John Allspaw, *Blameless PostMortems and a Just Culture* (2012); Google SRE

Incident bukan blame event — incident adalah learning opportunity. Error budget bukan hukuman, tapi resource buat dialokasikan.

**EM connection:** Em-review Mode B (debug) explicitly anti-blameless violation: "postmortem yang nyebut nama orang sebagai cause" = anti-pattern. Bug recur kalau gak ada test → root cause sebenarnya = test gap, bukan engineer "sloppy".

### 8. Org Structure IS Architecture
**Source:** Conway's Law (1967); formalized di Skelton & Pais, *Team Topologies* (2019)

> "Organizations design systems that mirror their communication structure."

Boundary code map ke boundary tim. Microservices yang split tapi 1 tim own semua = micro-distributed-monolith. Module yang logical tapi 5 tim co-edit = constant merge hell.

**EM connection:** Em-plan Phase 3 wajib pertimbangkan ownership. "Service baru ini, siapa own?" Kalau gak ada owner clear, service-nya akan jadi orphan dalam 6 bulan.

### 9. DX is Product Quality
**Source:** *DevOps Research and Assessment* (DORA); Nicole Forsgren, *Accelerate* (2018)

Slow CI, bad local dev, painful deploy → worse software, higher attrition. Developer experience = leading indicator.

**EM connection:** "CI green takes 25 minutes" itu metric yang harus di-track. Em-works pre-handoff checklist explicitly include "CI green on baseline" karena DX yang lemah eat tim velocity diam-diam.

### 10. Essential vs Accidental Complexity
**Source:** Fred Brooks, *No Silver Bullet* (1986)

Essential complexity = inherent dari problem (problem domain memang rumit). Accidental complexity = self-inflicted (pilihan tools/approach yang nambah kompleksitas tanpa justifikasi).

**EM connection:** Sebelum nambah apapun: "Is this solving real problem atau problem yang kita ciptakan sendiri?" Em-plan Step-0 Scope Challenge explicitly trigger ini.

### 11. Two-Week Smell Test
**Source:** Charity Majors, various

Kalau competent engineer baru gak bisa ship small feature dalam 2 minggu, **lo punya onboarding problem disguised as architecture problem**.

**EM connection:** Em-plan Phase 2 Step 5 trigger ini. Kalau plan gak feasible dalam 2 minggu, root cause analysis dulu — sering kali jawabannya bukan "feature ini kompleks" tapi "stack kita susah dipahami baru".

### 12. Glue Work Awareness
**Source:** Tanya Reilly, *The Staff Engineer's Path* (2022); Will Larson, "Glue Work"

Glue work = invisible coordination (docs, migration, test fixtures, runbook, mediation antara tim). Critical untuk delivery, tapi gak terlihat di promo packet.

**EM connection:** Em-works Phase 1 Step 4 explicit flag glue tickets, distribute fairly. Anti-pattern: 1 IC stuck doing only glue → eventual burnout + career stall.

### 13. Make the Change Easy, Then Make the Easy Change
**Source:** Kent Beck, "Tidy First?" / *Tidy First?* (2023)

Refactor first (no behavior change). Then implement feature. **Never** combine structural + behavioral changes di 1 commit/PR.

**EM connection:** Em-works Phase 1 Step 3 explicit anti-pattern: "Bundle refactor + feature di 1 ticket". Em-review Mode A flag kalau diff bundled.

### 14. Own Your Code in Production
**Source:** Charity Majors, "The DevOps movement is ending"

> "There are only engineers who write code and own it in production."

Gak ada wall antara dev dan ops. Engineer yang ship harus bisa observe, debug, dan rollback production.

**EM connection:** Em-works pre-handoff checklist include monitoring dashboard plan + on-call window-1 owner. Em-review Mode A Section 2 check kalau PR include sufficient observability (log, metric, trace).

### 15. Error Budgets over Uptime Targets
**Source:** Google SRE Book, *Implementing Service Level Objectives*

SLO 99.9% bukan target uptime — itu **0.1% downtime budget** yang bisa dispend untuk shipping. Reliability = resource allocation problem.

**EM connection:** Em-works deploy plan section "Error budget tracking" — kalau budget habis, **freeze new feature deploy** sampai budget restored. Reliability bukan hambatan velocity, ia adalah velocity yang sustainable.

---

## Pattern Selection Guide

Pattern yang mana yang aktif kapan?

| Phase / Skill | Patterns paling aktif |
|---------------|------------------------|
| `/em-plan` Phase 1 (Capture & Risk) | #1 (State diagnosis), #2 (Blast radius) |
| `/em-plan` Phase 2 (Scope Challenge) | #10 (Essential vs accidental), #11 (Two-week smell), #4 (Incremental) |
| `/em-plan` Phase 3 (Architecture) | #3 (Boring), #6 (Reversibility), #5 (Systems over heroes), #8 (Conway), #14 (Own in prod) |
| `/em-plan` Phase 4 (Test Strategy) | #7 (Failure is info), #15 (Error budgets) |
| `/em-works` Phase 1 (Tasks) | #13 (Make change easy), #12 (Glue work) |
| `/em-works` Phase 4 (Deploy) | #6 (Reversibility), #15 (Error budgets), #9 (DX) |
| `/em-review` Mode A (Review) | #13 (Make change easy), #14 (Own in prod), #5 (Systems > heroes) |
| `/em-review` Mode B (Debug) | #7 (Failure is info), #2 (Blast radius) |

Bukan exhaustive — pattern bisa apply across phase. Guide ini cuma starting point.

---

## Anti-pattern Citation

✅ **Good:**
> "Boring by default — picked Postgres over <new shiny db> karena tim udah operate Postgres 3 tahun. Innovation token saved untuk ML pipeline (#X dalam roadmap)."

✅ **Good:**
> "Reversibility — feature flag default off, canary 5% → 25% → 100%. Rollback < 5 minute via flag toggle. Cost of being wrong = low."

❌ **Bad (empty citation):**
> "Applied Conway's Law and Boring by Default."
(Gak nyambung ke decision spesifik. Mana decision-nya, mana pattern yang shape?)

❌ **Bad (ritual):**
> "Per ETHOS principle #3, we are choosing boring tech."
(Gak menjelaskan apa yang boring, kenapa boring, dan token apa yang di-save.)
