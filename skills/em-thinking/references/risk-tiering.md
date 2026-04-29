# Risk Tiering — T0 / T1 / T2 / T3

Risk tier nentuin **discipline yang apply** ke plan, code review, dan deploy. T0 punya gate ketat, T3 punya fast lane.

Generic taxonomy — gak terikat ke domain spesifik. Untuk regulated finance / MMF / healthcare flavor, lihat optional flavor extension (TBD, future).

---

## Pakai Di Mana

- `/em-plan` Phase 1 Step 2 — klasifikasi initial untuk plan
- `/em-works` Phase 4 — gate untuk deploy strategy choice (T0/T1 wajib feature flag/canary)
- `/em-review` Mode A — gate untuk LGTM threshold (T0/T1 strict, T2/T3 loose)
- `/em-review` Mode B — debug severity matching tier

Shared dengan `pm-thinking` (akan di-cross-reference dari pm-thinking PRD risk section nantinya — saat ini standalone di em-thinking).

---

## T0 — Critical

### Definisi
Surface yang **kalau salah, gak bisa di-undo dengan mudah** atau **bisa cause harm signifikan ke user / business / reputation**.

### Surfaces (generic categories)
- **Irreversible operations** — write yang gak bisa di-rollback tanpa data loss (delete, payment send, irrevocable state transition)
- **Security boundaries** — auth, authz, secret management, session handling, encryption boundaries
- **State machines with concurrency** — distributed lock, saga, transaction coordinator, exactly-once processing
- **External system contracts** — webhook receiver, idempotency key handling, retries, contracts dengan third-party API yang punya consequence finansial/legal
- **Sensitive data** — PII, regulated data (HIPAA / GDPR / PCI), financial records, health records

### Examples (generic)
- Critical write path (e.g. order placement, payment send, irreversible content delete)
- Login / session / authentication flow
- Distributed lock, saga, transaction coordinator
- Webhook receiver dari payment provider
- Data export endpoint dengan sensitive fields
- Migration yang nge-touch sensitive columns

### Required discipline
- **Test-first** — wajib. Core invariant 100% covered.
- **Security review** — `security-reviewer` role parallel ke em-works.
- **Postmortem-grade documentation** — invariants explicit, failure modes complete, rollback procedure tested in staging.
- **Deploy strategy** — feature flag atau canary, never big bang.
- **On-call window** — extended (>24h) post-deploy attention.

---

## T1 — High

### Definisi
Surface yang **kalau salah, cause user-visible problem yang serius tapi recoverable** dengan effort yang reasonable.

### Surfaces (generic categories)
- **Schema migrations** — DDL changes, column adds yang nge-touch nullable→NOT NULL, type widening/narrowing
- **Breaking API changes** — request/response shape changes, contract changes yang force client update
- **Multi-service coordination** — fanout, cross-service transaction (yang gak T0-grade tapi tetep tricky)
- **Observability gap di sensitive surface** — kasus di mana T0-adjacent code gak punya cukup tracing/log

### Examples (generic)
- Add NOT NULL column ke existing large table
- Change response field from string to typed enum
- Cross-service transaction (payment + ledger + notification)
- Refactor logging library used by sensitive endpoint

### Required discipline
- **Test strategy explicit** — failure modes documented, edge cases enumerated.
- **Migration plan reviewed** — backwards-compat plan written, rollback procedure for data juga.
- **Backward compat** — addressed kalau breaking. Deprecation path documented.
- **Deploy strategy** — feature flag atau canary preferred. Big bang acceptable kalau low-volume + reversible.
- **On-call window** — standard (24h) post-deploy.

---

## T2 — Standard

### Definisi
Surface yang **isolated, additive, reversible, dan low blast radius**. Sebagian besar feature work hidup di sini.

### Surfaces (generic categories)
- Single-module feature (new endpoint, new helper, new internal tool)
- Additive backward-compat changes (new optional field, new feature flag, new metric emission)
- UI changes yang gak nge-affect data flow
- Performance optimization yang gak ubah semantics

### Examples (generic)
- New endpoint dengan feature flag default off
- Internal helper module
- New dashboard widget
- Caching layer untuk read-heavy endpoint

### Required discipline
- **Standard test coverage** — unit + integration sesuai konvensi tim.
- **Invariants stated** — minimum 1 per ticket.
- **Deploy strategy** — flag/canary recommended, big bang acceptable kalau truly isolated.
- **On-call** — normal rotation.

---

## T3 — Trivial

### Definisi
Surface yang **gak nge-touch product behavior**. Pure config, docs, dev tooling, style.

### Surfaces (generic categories)
- Documentation update
- CI/CD config (yang gak nge-touch deployment safety)
- Lint rule, formatter config
- Dev script, README, ADR
- Comment-only code change

### Examples (generic)
- README typo fix
- Add new lint rule yang gak break existing code
- Update CI runner version
- Add inline code comment

### Required discipline
- **Sanity check only** — sufficient.
- **Skip heavy review** — single reviewer, focus on intent clarity.
- **Deploy** — auto-deploy via CI typical.

---

## Tier Boundary Forcing Questions

Ambiguous antara T0 vs T1, atau T1 vs T2? Tanya:

1. **"Kalau bug ini ship ke prod, dan baru ketauan dalam 1 jam — recoverable?"**
   - Yes, no data harm → T1 atau lower
   - No, data harm or financial / reputational → T0

2. **"Sensitive data nyentuh path ini?"**
   - Yes (PII, regulated, financial) → minimum T1, kemungkinan T0
   - No → T1 maksimum

3. **"Cross-service coordination?"**
   - Yes, dengan financial implication → T0
   - Yes, low-stake → T1
   - No → T2 atau lower

4. **"Reversibility — feature flag bisa toggle off?"**
   - Yes, instant → T1 atau T2 (despite blast radius, mitigation cheap)
   - No, must hot-fix → T0 atau T1

5. **"Compliance/regulatory implication?"**
   - Yes → minimum T1, kemungkinan T0
   - No → ignore di calculation

Default ke higher tier kalau ambigu. Promote-down lebih murah daripada upgrade-up setelah incident.

---

## Escalation Triggers

T2 plan yang harus di-promote ke T1 atau T0 kalau:
- Discovery menunjukkan path nyentuh sensitive data yang gak ke-detect awal
- Post-implementation muncul cross-service coordination
- Volume / scale assumption salah, blast radius lebih besar dari awal
- Compliance team flag late-stage

T1 yang harus di-promote ke T0:
- Security review nemu attack surface
- Migration nemu data anomaly yang butuh manual remediation

---

## Integration dengan pm-thinking

`pm-thinking`'s PRD section `## Tech Implications (For Eng Kickoff)` sudah punya **Section 4: Compliance / Privacy / Security**. Section ini natural feed ke risk tier classification di em-plan.

Future cross-reference: pm-thinking bisa explicit suggest tier di PRD ("PM hypothesis: T1, butuh em-plan validate"), em-plan validate atau adjust.
