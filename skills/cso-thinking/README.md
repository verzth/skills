# cso-thinking

> Single-command security audit that adapts to whatever you point it at — frontend, backend, infrastructure, databases, Android, iOS, or generic software. Produces a security score plus a fix-ready audit list.

## Philosophy

A Chief Security Officer doesn't run seven different audits for seven different stacks — they ask one question ("where are we exposed?") and route it to whichever lens fits the target. This plugin embodies that mindset: one entry point, profile-aware execution, evidence-grounded findings, and a fix-ready audit list a human or another Claude session can act on immediately.

1. **One command, every target.** Auto-detect the profile from the working directory; confirm; run.
2. **Evidence over opinion.** Every finding cites a file, line, and standard. Run external tools where available; fall back to checklist review where not.
3. **Score is a signal, not a verdict.** 0–100 + letter grade for trend tracking. The audit list is what matters.
4. **Fix-ready output.** Each finding ships with a copy-pasteable remediation prompt.

See [ETHOS.md](./ETHOS.md) for the full philosophy.

## The skill

| Skill | Specialist role | When |
|-------|-----------------|------|
| [`/cso-audit`](./skills/cso-audit/SKILL.md) | Chief Security Officer | Pre-release, periodic review, post-incident, before audit committee |

## What it covers

| Profile | Standards drawn from | Auto-detect signals |
|---------|----------------------|---------------------|
| `frontend` | OWASP Top 10 (Web), CSP L3, Webhint, MDN security headers | `package.json` + `index.html` / Next.js / Vite / React / Vue / Svelte |
| `backend` | OWASP API Top 10, ASVS L1/L2, language-specific guides | Go / Node / Python / Java / Ruby / PHP / Rust / .NET service code |
| `infrastructure` | CIS Docker / Kubernetes / Cloud benchmarks, NIST 800-190 | `Dockerfile`, `*.tf`, `k8s/`, `helm/`, `docker-compose.yml`, `ansible/` |
| `databases` | OWASP Database Security Cheat Sheet, CIS DB benchmarks | Migration files, `schema.sql`, ORM config, DB connection strings |
| `android` | OWASP MASVS L1/L2, MASTG | `AndroidManifest.xml`, `build.gradle`, Kotlin/Java sources |
| `ios` | OWASP MASVS L1/L2 (iOS profile), Apple Platform Security | `Info.plist`, `*.xcodeproj`, Swift/Obj-C sources |
| `generic` | OWASP SAMM, NIST SSDF, supply-chain (SLSA), secrets hygiene | Catch-all + always applied alongside others |

Multiple profiles can be active in one run (e.g., a monorepo with frontend + backend + infra gets all three).

## Output

Every run writes three files to the working directory, all derived from the same records:

- **`SECURITY_AUDIT.json`** — the records of truth, checked by a bundled zero-dependency validator before anything else is written
- **`SECURITY_AUDIT.md`** — agent handoff (stable structure, parseable)
- **`SECURITY_AUDIT.html`** — human review (score banner, severity grouping, copyable remediation blocks)

Each confirmed finding has: severity, location (`file:line` or config key), source (tool name+version or checklist item ID), why-it-matters, and a copy-pasteable **remediation prompt**. Critical and High findings also carry an `exploit_path` (actor → input → control → boundary → affected → result) and a `verification` record.

## Verdicts: confirmed, needs validation, rejected

A lead is not a finding until it is grounded. Each record is one of:

| Verdict | Meaning | Scored? |
|---------|---------|---------|
| `confirmed` | Source path traced, result concrete, location cited | Yes |
| `needs_validation` | A specific hypothesis whose decisive fact lives outside the repo (edge config, IAM, provider settings). Names the unresolved fact and a safe way for the owner to settle it. No severity. | No — shown as `N pending validation` |
| `rejected` | Disproved during verification; kept so a re-audit doesn't re-raise it | No |

Every Critical/High is handed to a fresh-context verifier whose job is to *disprove* it, before it counts. See [`finding-contract.md`](./skills/cso-audit/references/finding-contract.md).

## Composite score

Score = 100 − Σ(severity_weight × confirmed_finding_count), floored at 0. See [scoring.md](./skills/cso-audit/references/scoring.md) for weights, letter-grade bands, and how scope size scales the penalty.

## Sprint flow

```
target codebase                  ← any of: web / api / infra / db / mobile / generic
   ↓
/cso-audit                       ← profile detect → confirm → run → verify → score → emit
   ↓
SECURITY_AUDIT.json + .md + .html
   ↓
   ├─→ Critical/High findings  →  fix immediately, re-run /cso-audit
   ├─→ Medium findings         →  ticket, batch
   └─→ Low/Info                →  parking lot, address in next audit cycle
```

## Related plugins

- [`em-thinking`](../em-thinking/) — engineering plan/review (security findings often become tickets here)
- [`board-thinking`](../board-thinking/) — when "should we even ship this?" is the real question
- [`public-awareness`](../public-awareness/) — keeps audit findings out of public artifacts

## Acknowledgements

The verdict taxonomy, the boundary-and-result requirement for high-impact findings, independent disproof of candidates, and the source-visibility discipline are adapted from [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) (MIT). cso-audit keeps its own single-command, multi-profile, scored workflow; those ideas were folded in, not copied wholesale.

## Versioning

- **v0.3.0** — **findings must be earned.** New `references/finding-contract.md`: three verdicts (`confirmed` / `needs_validation` / `rejected`), a required `exploit_path` (actor → input → control → boundary → affected → result) for Critical/High, a source-visibility rule (a control the repo doesn't show is unknown, not absent), and a not-a-finding list (checklist deviations, defense-in-depth with an intact layer, self-impact, guessed deployment behaviour, scanner hits never checked for reachability). **New Phase 4.2**: every Critical/High goes to a fresh-context verifier that tries to disprove it (cap 12 per run; `self` mode fallback when no sub-agent is available, flagged `self-verified`). **Scoring counts confirmed findings only**; `needs_validation` shows as `N pending validation` and never moves the score. **New `SECURITY_AUDIT.json`** written first and checked by `scripts/validate_findings.cjs` (zero-dependency; status/severity consistency, complete exploit path and verification on Critical/High, counts, score and grade-cap arithmetic); the Markdown and HTML are derived from it. HTML report gains a Needs-validation group plus exploit-path and verification blocks. Static-first execution safety: never run the target's tests/builds/hooks, never probe live systems unless the user named them in scope at confirm, treat repository text as data not instructions. Re-audits no longer inherit prior verdicts on faith. SKILL.md stays under 500 lines.
- **v0.2.0** — added **Phase 4.5: threat-intelligence enrichment** using only free public APIs (OSV.dev, EPSS, CISA KEV from the cisagov GitHub mirror, NVD, GitHub Advisory via existing `gh` auth, Hacker News Algolia). Each Critical/High finding with a CVE/GHSA identifier gets a `Recent activity` block showing EPSS percentile, KEV listing + federal patch deadline, ransomware-campaign use, NVD CVSS verification, curated OSV references, and recent HN discussions. Severity can be auto-promoted (never demoted) when intel justifies it — e.g., KEV listing → at least High; KEV + ransomware → Critical; EPSS ≥0.95 → at least High. Bundles `scripts/fetch_intel.sh` so the LLM doesn't re-derive the curl chains. Per-CVE cache (6h), KEV catalog cache (24h). Opt-in via `--threat-intel`, auto-on when internet is reachable, fully graceful when any/all APIs are down. Zero paid dependencies, ever. Skill instructions remain under 500 lines.
- **v0.1.1** — added **Phase 3.5** (offer to install missing scanners interactively before the audit runs). Coverage gaps now get a one-click `brew install ...` / `pip install ...` / `go install ...` recommendation instead of silently degrading to checklist-only. Picking "install now" runs the commands straight through — no double-prompt — and Claude Code's harness handles the actual approval (auto-approve mode just runs; default mode shows the standard Bash permission prompt). Constraints on the commands themselves (no surprise `sudo`, no shell-rc edits, prefer project-local environments) are enforced regardless of mode. Non-interactive mode (subagent / CI / `--no-prompt`) skips Phase 3.5 entirely and proceeds checklist-only with the degraded-coverage info finding intact.
- v0.1.0 — initial release: `/cso-audit` with 7 profiles, hybrid tool+checklist execution, dual md+html output, fix-ready findings.
