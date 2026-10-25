#!/usr/bin/env node

/** Run: node validate_findings.test.cjs  (plain assert, no test framework) */

const assert = require("assert");
const { validate } = require("./validate_findings.cjs");

const confirmed = (over = {}) => ({
  id: "F-001", status: "confirmed", severity: "medium", category: "vulnerability",
  profile: "backend", title: "Missing rate limit on login",
  location: { file: "internal/http/login.go", line: 12, snippet: "mux.Post(\"/login\", h.Login)" },
  source: { type: "checklist", name: "checklist:backend", rule_id: "B-2.3" },
  standard: ["OWASP API4:2023"],
  why_it_matters: "Credential stuffing is unthrottled on the only login route.",
  remediation: { summary: "Add limiter.", prompt: "Open internal/http/login.go and wrap the /login route with the existing limiter middleware; verify with go test ./internal/http." },
  fix_effort: "small", references: [],
  ...over,
});

const exploit = {
  actor: "anonymous visitor", input: "POST /search q=' OR 1=1--", control: "parameterised query",
  boundary: "web client → database", affected: "users table", result: "all emails returned",
};

const high = (over = {}) => confirmed({
  id: "F-002", severity: "high", title: "SQL injection in search",
  exploit_path: exploit, verification: { mode: "independent", verdict: "confirmed" }, ...over,
});

const needsValidation = (over = {}) => ({
  id: "F-003", status: "needs_validation", profile: "infrastructure", title: "Edge may expose /internal",
  location: { file: "Caddyfile", snippet: "reverse_proxy localhost:8081" },
  unresolved_fact: "Whether the edge strips /internal/*.", if_confirmed: "Unauthenticated read of exports.",
  validation_plan: "From outside the tailnet, request /internal/health; expect 404.", ...over,
});

const rejected = (over = {}) => ({
  id: "F-004", status: "rejected", profile: "backend", title: "Unauthenticated /admin route",
  location: { file: "internal/http/router.go", line: 88 },
  reason: "Auth middleware at internal/http/router.go:90 wraps the route.", ...over,
});

function doc(findings, over = {}) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0, needs_validation: 0, rejected: 0 };
  let penalty = 0;
  const w = { critical: 15, high: 7, medium: 3, low: 1, info: 0 };
  for (const f of findings) {
    if (f.status === "confirmed") { counts[f.severity]++; penalty += w[f.severity]; }
    else counts[f.status]++;
  }
  const value = Math.max(0, 100 - penalty);
  const grade = value >= 97 ? "A+" : value >= 93 ? "A" : value >= 90 ? "A-" : value >= 87 ? "B+"
    : value >= 83 ? "B" : value >= 80 ? "B-" : value >= 77 ? "C+" : value >= 73 ? "C" : value >= 70 ? "C-"
    : value >= 67 ? "D+" : value >= 63 ? "D" : value >= 60 ? "D-" : "F";
  return {
    schema_version: 1, generated_at: "2026-10-26T09:30:00Z",
    score: { value, grade, capped: false, penalty_multiplier: 1 },
    scope: { profiles: ["generic", "backend"], partial: false },
    tools_run: ["semgrep 1.45.0"], tools_missing: [], counts, findings, ...over,
  };
}

let passed = 0;
function ok(name, d) {
  const { errors } = validate(d);
  assert.deepStrictEqual(errors, [], `${name}: expected valid, got ${JSON.stringify(errors)}`);
  passed++;
}
function fails(name, d, pattern) {
  const { errors } = validate(d);
  assert.ok(errors.some((e) => pattern.test(e)), `${name}: expected error matching ${pattern}, got ${JSON.stringify(errors)}`);
  passed++;
}

// --- valid documents
ok("empty audit", doc([]));
ok("medium + high + needs_validation + rejected", doc([confirmed(), high(), needsValidation(), rejected()]));
ok("trailing severity audit trail",
  doc([high({ severity_changed_by: { source: "verification", rule: "partly mitigated", original_severity: "critical", downgraded_to: "high" } })]));

// --- status / severity consistency
fails("needs_validation with severity", doc([needsValidation({ severity: "high" })]), /must not carry a severity/);
fails("needs_validation without unresolved_fact", doc([needsValidation({ unresolved_fact: "" })]), /unresolved_fact is required/);
fails("needs_validation with exploit_path", doc([needsValidation({ exploit_path: exploit })]), /exploit_path/);
fails("rejected without reason", doc([rejected({ reason: "" })]), /reason is required/);
fails("rejected with severity", doc([rejected({ severity: "low" })]), /must not carry a severity/);
fails("unknown status", doc([confirmed({ status: "maybe" })]), /status must be one of/);

// --- boundary and result
fails("high without exploit_path", doc([high({ exploit_path: undefined })]), /requires exploit_path/);
fails("critical with partial exploit_path",
  doc([confirmed({ severity: "critical", exploit_path: { ...exploit, result: "" }, verification: { mode: "self", verdict: "confirmed" } })]),
  /exploit_path\.result/);
fails("high without verification", doc([high({ verification: undefined })]), /requires a verification block/);
fails("verification verdict not confirmed", doc([high({ verification: { mode: "independent", verdict: "rejected" } })]), /verdict must be 'confirmed'/);
fails("bad verification mode", doc([high({ verification: { mode: "vibes", verdict: "confirmed" } })]), /verification\.mode/);

// --- anti-patterns encoded
fails("hardening above low", doc([confirmed({ category: "hardening", severity: "medium" })]), /hardening findings are capped/);
ok("hardening at low", doc([confirmed({ category: "hardening", severity: "low" })]));

// --- evidence and fix-readiness
fails("missing snippet", doc([confirmed({ location: { file: "a.go" } })]), /snippet is required/);
fails("short remediation prompt", doc([confirmed({ remediation: { summary: "Fix.", prompt: "Sanitize input." } })]), /self-contained/);
fails("missing why_it_matters", doc([confirmed({ why_it_matters: "" })]), /why_it_matters/);

// --- ids and counts
fails("duplicate id", doc([confirmed(), confirmed()]), /duplicate id/);
fails("bad id", doc([confirmed({ id: "X1" })]), /id must match/);
{
  const d = doc([confirmed()]); d.counts.medium = 5;
  fails("counts mismatch", d, /counts\.medium is 5/);
}

// --- score arithmetic
{
  const d = doc([confirmed()]); d.score.value = 99;
  fails("wrong score value", d, /score\.value is 99/);
}
{
  const d = doc([confirmed()]); d.score.penalty_multiplier = 1.5; d.score.value = 96; d.score.grade = "A"; // 100 − 3×1.5 = 95.5 → 96
  ok("multiplier rounds half up", d);
}
{
  // Critical cap: 1 Critical = 85 raw = B, which is better than C+ → displayed C+, capped true
  const crit = confirmed({ id: "F-001", severity: "critical", exploit_path: exploit, verification: { mode: "independent", verdict: "confirmed" } });
  const d = doc([crit]);
  d.score.grade = "C+"; d.score.capped = true;
  ok("critical cap applied", d);
  const wrong = doc([crit]); // grade B, capped false
  fails("critical cap missing", wrong, /expected C\+/);
}
{
  // Many Criticals drive raw score below C+; cap has no effect and must not be flagged capped
  const crits = ["F-001", "F-002", "F-003", "F-004", "F-005"].map((id) =>
    confirmed({ id, severity: "critical", exploit_path: exploit, verification: { mode: "self", verdict: "confirmed" } }));
  const d = doc(crits); // 100 − 75 = 25 → F
  ok("cap not applied when raw already worse", d);
}
{
  // Unicode minus in grade is accepted
  const d = doc([confirmed(), confirmed({ id: "F-002" }), confirmed({ id: "F-003" }), confirmed({ id: "F-004" })]); // 88 → B+
  d.score.grade = "B+";
  ok("plain grade", d);
  const e = doc([high(), confirmed({ id: "F-005", severity: "low", title: "x" })]); // 100−8 = 92 → A−
  e.score.grade = "A−";
  ok("unicode minus grade", e);
}

// --- top level
fails("wrong schema_version", doc([], { schema_version: 2 }), /schema_version/);
fails("empty profiles", doc([], { scope: { profiles: [], partial: false } }), /scope\.profiles/);
fails("non-object", null, /top level/);

console.log(`validate_findings: ${passed} checks passed`);
