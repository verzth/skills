# Tech Literacy Checklist (untuk Product PM)

Checklist ini di-pake oleh `/pm-works` saat ngisi section **Technical Implications** di PRD, dan oleh `/pm-decide --review` saat audit PRD.

**Tujuan:** PM **sadar** dampak teknis spec-nya — supaya engineer gak surprise pas kickoff. PM **gak ambil keputusan** engineering — itu domain `engineer-manager`.

---

## 1. Data layer

| Question | Why penting | Decision domain |
|----------|-------------|-----------------|
| Schema baru? | Eng butuh allocate DB work + migration plan | Eng |
| Migration di table existing? | Risk downtime, rollback complexity | Eng |
| Volume data baru — small (<1GB) / medium / large? | Storage cost, query performance | Eng |
| Sensitive data? PII, payment, health, biometric? | Compliance review timeline | PM flag, Legal/Sec decide |
| Retention rule? Berapa lama disimpan? | GDPR / regulatory | PM flag, Legal decide |

**PM output:** observation. e.g., "Add column `sso_enabled` to `organizations` table. ~5K rows. No PII change."

**PM jangan output:** "Pake Postgres / pake DynamoDB" — itu eng decide.

---

## 2. API / Integration

| Question | Why penting | Decision domain |
|----------|-------------|-----------------|
| New endpoint? | API surface area expansion | Eng |
| Existing endpoint changed? | Backward compat strategy | Eng |
| Breaking change? | Deprecation path, client comms | PM flag + Eng strategy |
| External dependency? Vendor / SaaS / 3rd-party API? | Cost, SLA, lock-in | PM evaluate, Eng implement |
| Auth model change? | Security implication | PM flag, Sec decide |

**PM output:** "New endpoint `POST /api/sso/configure`. No breaking change. Auth: existing org-admin scope."

**PM jangan output:** "Pake REST atau gRPC, gimana request body schema-nya."

---

## 3. Existing components affected

| Question | Why penting | Decision domain |
|----------|-------------|-----------------|
| Component A bakal kena? | Regression risk | PM flag, Eng test |
| Reusable component yang bisa di-leverage? | Speed up build, consistency | Eng decide reuse |
| Owned by team lain? | Cross-team coordination needed | PM coordinate |

**PM output:** "Login flow component bakal modifikasi — currently owned by Auth team."

---

## 4. Compliance / Privacy / Security

| Question | Why penting | Decision domain |
|----------|-------------|-----------------|
| Touches PII? | GDPR / CCPA review | Legal / Privacy |
| Touches payment / financial? | PCI-DSS scope | Sec / Legal |
| Touches health / biometric? | HIPAA / regional regulation | Legal |
| Region-specific? Data residency? | Architecture impact | PM flag, Eng decide |
| Audit log requirement? | SOX / SOC2 | Compliance |

**PM output:** "Stores OAuth tokens. Data residency: US-only for v1. Required review: Security team."

---

## 5. Performance / Scale awareness

| Question | Why penting | Decision domain |
|----------|-------------|-----------------|
| Realistic concurrent user? | Capacity planning | Eng |
| Latency-sensitive? (sub-second UX) | Architecture choice | Eng |
| Heavy compute? (ML, video, large query) | Infrastructure cost | Eng |
| Cache-friendly? | Performance / cost optimization | Eng |

**PM output:** "Expected ~500 concurrent SSO logins at peak. Acceptable login latency: <2s."

**PM jangan output:** "Pake Redis atau Memcached untuk session storage."

---

## 6. Effort ballpark

| Range | What it means |
|-------|---------------|
| **Days** | Small change — copy edit, bug fix, minor UI tweak |
| **1-2 weeks** | Single-engineer feature — well-scoped, no major dep |
| **1 month** | Multi-engineer feature — touches 2-3 components |
| **1 quarter** | Cross-team initiative — coordination heavy |
| **>1 quarter** | Strategic bet — needs phased approach |

**PM rule:** Selalu confirmed-by-eng sebelum lock deadline. Ballpark dari PM = guess; ballpark dari engineer-manager skill = commitment-able.

---

## 7. Open technical questions for eng

Section ini di PRD = list pertanyaan yang **PM gak bisa jawab** dan butuh eng input. Examples:

- "Login session — share dengan existing session store atau separate?"
- "SAML 2.0 vs OIDC — recommend yang mana untuk v1?"
- "Backward compat untuk legacy login — gimana strategy?"

Engineer-manager skill bakal pick up section ini saat handoff.

---

## Anti-pattern PM tech-literacy

❌ **Decide engineering:** "Pake Postgres, schema X, index di kolom Y."
❌ **Vague:** "Might affect database. Eng figure out."
❌ **Commitment as PM:** "Eng confirmed it's 2 weeks."
❌ **Skip section:** Tech Implications kosong / "TBD" semua.

✅ **Aware + observe:** "Schema impact: new table. Existing components: Login API. Compliance: PII via OAuth token storage. Effort ballpark: 2-3 weeks (PM guess, pending eng confirm)."
