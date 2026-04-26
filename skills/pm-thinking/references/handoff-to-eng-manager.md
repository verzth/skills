# Handoff Contract: pm-thinking → engineer-manager

Dokumen ini ngedefine kontrak antara `pm-thinking` skill bundle dan `engineer-manager` skill (terpisah, dibangun setelah pm-thinking).

**Tujuan:** PM stop nge-tres-pass ke engineering territory, eng gak surprise pas kickoff.

---

## What pm-thinking writes (PRD section "Handoff to Engineer Manager")

Setiap PRD yang dihasilkan `/pm-works` punya section **wajib**:

```markdown
## Handoff to Engineer Manager

**Hypothesis to validate:**
[Dari discovery.md hypothesis statement]

**Constraints (locked by PM):**
- [User-facing constraint, e.g., "harus support SSO via SAML 2.0"]
- [Business constraint, e.g., "ship sebelum Q3 review"]
- [Compliance constraint, e.g., "data residency US-only"]

**Decisions delegated to eng:**
- [Decision area — e.g., "tech stack untuk SSO library"]
- [Decision area — e.g., "session storage strategy"]
- [Decision area — e.g., "rollout architecture"]

**Don't decide engineering:**
- Specific library / framework choice
- Service boundary
- Performance trade-off
- Deployment strategy
```

---

## What engineer-manager skill picks up

`engineer-manager` skill akan baca section ini dan otomatis:

1. **Honor constraints** — gak override apa yang PM lock
2. **Take delegated decisions** — pilih tech stack, library, dll. dengan rationale
3. **Surface hidden trade-offs** — kalau ada tension antar constraint, flag balik ke PM
4. **Generate technical design doc** — turunan dari PRD, bukan ulang dari nol

---

## Boundary rules

### PM **boleh** specify (di PRD):
- User outcome / behavior change
- Success metric (target + time window)
- Compliance / legal constraint
- Hard deadline / dependency
- User-facing API contract (input/output user perspective)
- Audience / segment

### PM **tidak boleh** specify (delegate ke eng):
- Tech stack pilihan (DB, framework, language)
- Internal API design
- Service boundary
- Caching strategy
- Performance optimization choice
- Deployment / infra strategy
- Test framework

### PM **boleh observe** (Tech Implications section):
- "Schema baru di table X" (observation, bukan how)
- "API contract berubah, breaking" (flag, bukan strategy)
- "Touches PII" (compliance flag)
- "Effort ballpark: 2-3 weeks (PM guess)"

---

## Conflict resolution

Kalau eng (via engineer-manager skill) detect bahwa constraint PM **gak bisa di-honor** (e.g., deadline gak realistic, tech approach yang PM lock gak feasible), eng wajib:

1. Flag kembali ke PM via `engineer-manager` skill output
2. Propose 2-3 alternatif (relax constraint, extend deadline, reduce scope)
3. PM run `/pm-decide --review` lagi atau `/pm-works` revision
4. Loop until alignment

PM gak boleh override eng technical assessment tanpa rationale tertulis.

---

## Iteration loop

```
/pm-discover → /pm-works → /pm-decide --review → engineer-manager (technical design)
                                                          ↓
                                              [eng flags constraint conflict]
                                                          ↓
                                              PM revisit /pm-works → /pm-decide --review
                                                          ↓
                                              engineer-manager (re-design)
                                                          ↓
                                                       [SHIP]
                                                          ↓
                                              /pm-decide --retro
```

---

## Status saat ini

- ✅ pm-thinking: built, di-host di `verzth/skills/pm-thinking`
- ⏳ engineer-manager: planned, akan dibangun terpisah di `verzth/skills/engineer-manager`

Sampai engineer-manager skill ada, **section "Handoff to Engineer Manager" di PRD bisa di-baca manual oleh tech lead lo**. Format-nya dirancang biar human-readable juga.
