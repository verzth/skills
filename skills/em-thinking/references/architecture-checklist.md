# Architecture Checklist

Detail untuk `/em-plan` Phase 3 (Architecture Design). **Bukan to fill out blindly** — gunakan sebagai trigger forcing questions.

ASCII diagram conventions, what makes good invariant, failure mode enumeration approach, dll.

---

## 1. Component Boundaries

### Tujuan
State explicit apa yang **di dalam scope perubahan** dan apa yang **di luar**. Boundary = kontrak yang gak boleh dilanggar.

### ASCII box convention

```
┌─────────────────────┐
│   PaymentService    │
│  ┌───────────────┐  │
│  │  Idempotency  │  │  ← dipisah karena reused
│  │     Cache     │  │
│  └───────────────┘  │
└──────────┬──────────┘
           │ calls
           ▼
┌─────────────────────┐
│ PaymentProviderAPI  │  ← external (out of repo)
└─────────────────────┘
```

### Forcing questions

1. **Apa yang di dalam, apa di luar?** Line yang harus di-draw dengan tegas. Vague boundary = vague responsibility = vague ownership.

2. **External system di sini punya kontrak apa?** SLA, retry policy, error semantics, rate limit. State explicit.

3. **Module ini own oleh siapa?** Conway's Law check. Kalau gak ada owner clear, service akan jadi orphan dalam 6 bulan.

---

## 2. Data Flow

### Tujuan
Trace lifecycle: data masuk dari mana, lewat apa, keluar ke mana. ASCII diagram **wajib** untuk flow > 2 hop.

### ASCII arrow convention

```
[User]
   │ POST /orders
   ▼
[OrderController]
   │ validate + dispatch
   ▼
[OrderService] ──── enqueue ────▶ [OrderQueue]
                                       │
                                       │ consume
                                       ▼
                                  [OrderWorker]
                                       │
                                       ▼
                                  [Database]
```

### Forcing questions

1. **Synchronous vs async di setiap hop?** State explicit. User-facing latency = sum of sync hops only.

2. **Failure di hop X, behaviour-nya apa?** Per hop:
   - Retry?
   - Dead letter?
   - User-facing error?
   - Silent log + retry later?

3. **Backpressure?** Kalau hop downstream slow, upstream apa yang terjadi? (queue accumulate, drop, error?)

4. **Ordering matter?** FIFO, key-based ordering, atau no ordering needed?

5. **Exactly-once / at-least-once / at-most-once?** Be explicit. Vague = future bug.

---

## 3. State Machine

### Tujuan
Wajib draw kalau entity punya state >2. State implicit di kepala = future bug source.

### ASCII state convention

```
                ┌──────────┐
   create  ────▶│  PENDING │
                └────┬─────┘
                     │ approve
                     ▼
                ┌──────────┐         reject       ┌──────────┐
                │ APPROVED │────────────────────▶│ REJECTED │
                └────┬─────┘                      └──────────┘
                     │ ship
                     ▼
                ┌──────────┐
                │ SHIPPED  │
                └──────────┘
```

### Forcing questions

1. **State transitions allowed exhaustive?** Apa yang TIDAK boleh transition? (e.g. SHIPPED → PENDING harus impossible.)

2. **Side effect per transition?** Database write, event emit, notification — listed per transition.

3. **Concurrency on state?** Apa yang terjadi kalau 2 actor coba transition simultaneously? Lock? Optimistic concurrency? Last-write-wins?

4. **Who can transition?** Auth/role check per transition.

---

## 4. Trust Boundaries

### Tujuan
Identify **di mana data validated** vs **di mana data trusted as-is**. Common attack vector = trust boundary yang salah.

### Common boundaries

- **HTTP request → Server** — input must be validated. Schema check, sanitization, auth check.
- **Database → Application** — usually trusted (data writer-controlled), tapi check kalau ada user-input fields.
- **External API → Application** — semi-trusted. Validate response schema.
- **Service A → Service B (internal)** — trusted di shared cluster, **gak trusted** kalau cross-tenant.
- **User session → Authorization** — never trust user-supplied role/identity. Always re-derive from session.

### Forcing questions

1. **Setiap data point — di mana di-validate?** Trust boundary harus eksplisit. Validation duplicate (di multiple boundary) = OK; missing validation = bug.

2. **Authorization check di mana?** Pre-controller (middleware), per-endpoint, atau per-record? Be explicit.

3. **Secret yang lewat boundary?** API key, token, password. Storage encrypted? Transport encrypted?

---

## 5. Invariants

### Tujuan
"What must always be true." Statement yang lebih spesifik dari prose, tapi gak harus formal logic.

### Good invariant characteristics
- **Specific** — bukan abstract
- **Testable** — bisa di-write sebagai assert
- **Stateful** — about data/state, bukan code style
- **Falsifiable** — clear violation criteria

### Examples

✅ **Good:**
- "Account balance can never be negative."
- "Once an order is shipped, it cannot transition back to pending."
- "Session tokens are never logged or persisted in plaintext."
- "Every webhook event is acknowledged exactly once (idempotent processing by event ID)."
- "User can only access records owned by their tenant."

❌ **Bad:**
- "TBD" — kalau gak bisa state, plan belum ready
- "Code is clean" — bukan invariant, itu aspirasi
- "No bugs" — bukan invariant, itu impossible
- "Performance is good" — bukan invariant, kalau yes — quantify (e.g. "P99 latency < 200ms")

---

## 6. Failure Modes

### Tujuan
Enumerate apa yang bisa salah, plus bagaimana sistem react. Table form mandatory.

### Format

| # | Scenario | Test? | Handling? | Visible to user? | Severity |
|---|----------|-------|-----------|-------------------|----------|
| 1 | Network timeout to upstream | ✓ | ✓ retry | Loud retry message | Med |
| 2 | Race condition in concurrent write | ✗ | ✗ | Silent corruption | **Critical** |
| 3 | Invalid input from user | ✓ | ✓ validate | Error message | Low |

### Critical gap definition
**No test + no handling + silent** = **critical gap**. Block sebelum em-works handoff.

### Forcing questions per row

1. "Failure scenario [X] — covered by test? Path: [test name / location]"
2. "Failure handling — graceful degrade, retry, hard fail? Choice rationale?"
3. "User-visible — error visible immediately, atau silent until detected later?"
4. "Severity — kalau happen di prod, blast radius?"

### Common scenarios to enumerate (checklist)

- Network: timeout, connection refused, DNS fail
- Concurrency: race, deadlock, double-submit
- Data: empty, max size, malformed, NULL
- External: rate limit, partial failure, schema mismatch
- Resource: out of memory, disk full, file handle exhausted
- Auth: expired token, missing permission, invalid signature

---

## 7. Single Points of Failure

### Tujuan
Identify SPOFs. Untuk setiap, decide: **accept** (with rationale) atau **mitigate**.

### Common SPOFs

- Database master (mitigate: replica, failover)
- Single message queue cluster (mitigate: multi-region)
- Single deployment region (accept: SLA permits, business decision)
- Single external API dependency (mitigate: cached fallback, queue retry)
- Single team / engineer that owns domain (mitigate: pair, document, rotate)

### Forcing questions

1. "SPOF [X] — accept atau mitigate?"
2. "Kalau accept — apa SLA implication, dan stakeholder agree?"
3. "Kalau mitigate — cost vs benefit reasonable?"

---

## ASCII Diagram Anti-Patterns

❌ **Diagram inaccurate vs code** — stale diagram lebih buruk dari no diagram. Update sebagai bagian dari change.

❌ **Diagram terlalu busy** — kalau ada >10 box atau >15 arrow, split jadi multiple diagrams (component view + data flow view + state view).

❌ **Diagram gak label-ed arrows** — arrow tanpa label = guesswork. Label dengan: action ("calls", "writes"), payload ("event"), atau condition ("if invalid").

❌ **Skip diagram untuk flow > 2 hop** — non-trivial flow, prose alone gak cukup. Diagram mandatory.
