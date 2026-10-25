#!/usr/bin/env node

/**
 * Validates a /cso-audit SECURITY_AUDIT.json.
 * Usage: node validate_findings.cjs <path-to-SECURITY_AUDIT.json>
 *
 * Zero dependencies. Exit 0 = valid (warnings may print); exit 1 = invalid;
 * exit 2 = could not read the file. Rules mirror references/finding-contract.md
 * and references/scoring.md.
 */

const fs = require("fs");

const SEVERITIES = ["critical", "high", "medium", "low", "info"];
const WEIGHTS = { critical: 15, high: 7, medium: 3, low: 1, info: 0 };
const STATUSES = ["confirmed", "needs_validation", "rejected"];
const CATEGORIES = ["vulnerability", "hardening"];
const SOURCE_TYPES = ["tool", "checklist"];
const EFFORTS = ["trivial", "small", "medium", "large"];
const VERIFY_MODES = ["independent", "self"];
const EXPLOIT_FIELDS = ["actor", "input", "control", "boundary", "affected", "result"];
const MIN_PROMPT_CHARS = 40;
const MAX_TITLE_CHARS = 80;

const GRADE_BANDS = [
  [97, "A+"], [93, "A"], [90, "A-"], [87, "B+"], [83, "B"], [80, "B-"],
  [77, "C+"], [73, "C"], [70, "C-"], [67, "D+"], [63, "D"], [60, "D-"], [0, "F"],
];
const GRADE_ORDER = GRADE_BANDS.map(([, g]) => g); // best → worst

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isInt = (v) => Number.isInteger(v);
const normGrade = (g) => String(g).replace(/−/g, "-").trim();
const gradeFor = (value) => GRADE_BANDS.find(([min]) => value >= min)[1];

function validate(doc) {
  const errors = [];
  const warnings = [];
  const err = (msg) => errors.push(msg);
  const warn = (msg) => warnings.push(msg);

  if (!isObj(doc)) return { errors: ["top level must be a JSON object"], warnings };

  if (doc.schema_version !== 1) err("schema_version must be 1");
  if (!isStr(doc.generated_at) || Number.isNaN(Date.parse(doc.generated_at))) {
    err("generated_at must be an ISO-8601 timestamp string");
  }
  for (const key of ["tools_run", "tools_missing"]) {
    if (!Array.isArray(doc[key]) || !doc[key].every(isStr)) err(`${key} must be an array of strings`);
  }

  const scope = doc.scope;
  if (!isObj(scope)) err("scope must be an object");
  else {
    if (!Array.isArray(scope.profiles) || scope.profiles.length === 0 || !scope.profiles.every(isStr)) {
      err("scope.profiles must be a non-empty array of strings");
    }
    if (typeof scope.partial !== "boolean") err("scope.partial must be a boolean");
    if (scope.live_targets !== undefined && !(Array.isArray(scope.live_targets) && scope.live_targets.every(isStr))) {
      err("scope.live_targets must be an array of strings when present");
    }
  }

  if (!Array.isArray(doc.findings)) {
    err("findings must be an array");
    return { errors, warnings };
  }

  const seen = new Set();
  const tally = { critical: 0, high: 0, medium: 0, low: 0, info: 0, needs_validation: 0, rejected: 0 };

  doc.findings.forEach((f, i) => {
    const at = isObj(f) && isStr(f.id) ? f.id : `findings[${i}]`;
    const bad = (msg) => err(`${at}: ${msg}`);

    if (!isObj(f)) return err(`${at}: must be an object`);

    if (!isStr(f.id) || !/^F-\d{3,}$/.test(f.id)) bad("id must match F-NNN (e.g. F-001)");
    else if (seen.has(f.id)) bad("duplicate id");
    else seen.add(f.id);

    if (!STATUSES.includes(f.status)) return bad(`status must be one of ${STATUSES.join(", ")}`);
    if (!isStr(f.profile)) bad("profile is required");
    if (!isStr(f.title)) bad("title is required");
    else if (f.title.length > MAX_TITLE_CHARS) warn(`${at}: title is ${f.title.length} chars (target ≤ ${MAX_TITLE_CHARS})`);

    if (!isObj(f.location) || !isStr(f.location.file)) bad("location.file is required (file path, config key, or package name)");

    if (f.status === "confirmed") {
      if (SEVERITIES.includes(f.severity)) tally[f.severity]++;
      validateConfirmed(f, bad, warn, at);
    } else if (f.status === "needs_validation") {
      tally.needs_validation++;
      if (f.severity !== undefined) bad("needs_validation must not carry a severity");
      if (f.exploit_path !== undefined) bad("needs_validation must not carry an exploit_path (it is a hypothesis, not a traced path)");
      for (const key of ["unresolved_fact", "if_confirmed", "validation_plan"]) {
        if (!isStr(f[key])) bad(`${key} is required for needs_validation`);
      }
    } else {
      tally.rejected++;
      if (f.severity !== undefined) bad("rejected must not carry a severity");
      if (!isStr(f.reason)) bad("reason is required for rejected");
    }
  });

  // counts
  if (!isObj(doc.counts)) err("counts must be an object");
  else {
    for (const key of Object.keys(tally)) {
      if (!isInt(doc.counts[key])) err(`counts.${key} must be an integer`);
      else if (doc.counts[key] !== tally[key]) {
        err(`counts.${key} is ${doc.counts[key]} but findings contain ${tally[key]}`);
      }
    }
  }

  validateScore(doc, tally, err);
  return { errors, warnings };
}

function validateConfirmed(f, bad, warn, at) {
  if (!SEVERITIES.includes(f.severity)) bad(`severity must be one of ${SEVERITIES.join(", ")}`);
  if (!CATEGORIES.includes(f.category)) bad(`category must be one of ${CATEGORIES.join(", ")}`);
  else if (f.category === "hardening" && !["low", "info"].includes(f.severity)) {
    bad("hardening findings are capped at low severity (a defense-in-depth gap is not a vulnerability)");
  }

  if (!isObj(f.location) || !isStr(f.location.snippet)) bad("location.snippet is required (1-3 lines of evidence)");

  if (!isObj(f.source) || !SOURCE_TYPES.includes(f.source.type) || !isStr(f.source.name)) {
    bad(`source needs type (${SOURCE_TYPES.join("|")}) and name`);
  }
  if (!Array.isArray(f.standard) || f.standard.length === 0 || !f.standard.every(isStr)) {
    bad("standard must be a non-empty array of strings");
  }
  if (!isStr(f.why_it_matters)) bad("why_it_matters is required");
  if (!EFFORTS.includes(f.fix_effort)) bad(`fix_effort must be one of ${EFFORTS.join(", ")}`);

  if (!isObj(f.remediation) || !isStr(f.remediation.summary)) bad("remediation.summary is required");
  else if (!isStr(f.remediation.prompt) || f.remediation.prompt.trim().length < MIN_PROMPT_CHARS) {
    bad(`remediation.prompt is required and must be self-contained (≥ ${MIN_PROMPT_CHARS} chars)`);
  }

  if (f.severity === "critical" || f.severity === "high") {
    if (!isObj(f.exploit_path)) bad(`${f.severity} requires exploit_path (${EXPLOIT_FIELDS.join(", ")})`);
    else {
      for (const key of EXPLOIT_FIELDS) {
        if (!isStr(f.exploit_path[key])) bad(`exploit_path.${key} is required for ${f.severity}`);
      }
    }
    if (!isObj(f.verification)) bad(`${f.severity} requires a verification block (Phase 4.2)`);
    else {
      if (!VERIFY_MODES.includes(f.verification.mode)) bad(`verification.mode must be one of ${VERIFY_MODES.join(", ")}`);
      if (f.verification.verdict !== "confirmed") bad("verification.verdict must be 'confirmed' for a confirmed finding");
    }
  }

  if (f.severity_changed_by !== undefined) {
    const trail = Array.isArray(f.severity_changed_by) ? f.severity_changed_by : [f.severity_changed_by];
    trail.forEach((entry, n) => {
      if (!isObj(entry) || !isStr(entry.source) || !isStr(entry.rule) || !SEVERITIES.includes(entry.original_severity)
          || !(SEVERITIES.includes(entry.promoted_to) || SEVERITIES.includes(entry.downgraded_to))) {
        bad(`severity_changed_by[${n}] needs source, rule, original_severity and promoted_to|downgraded_to`);
      }
    });
  }
}

function validateScore(doc, tally, err) {
  const s = doc.score;
  if (!isObj(s)) return err("score must be an object");
  if (!isInt(s.value) || s.value < 0 || s.value > 100) return err("score.value must be an integer 0-100");
  if (!isStr(s.grade)) return err("score.grade is required");
  if (typeof s.capped !== "boolean") err("score.capped must be a boolean");
  const mult = s.penalty_multiplier === undefined ? 1 : s.penalty_multiplier;
  if (typeof mult !== "number" || !(mult > 0)) return err("score.penalty_multiplier must be a positive number");

  const penalty = SEVERITIES.reduce((sum, sev) => sum + WEIGHTS[sev] * tally[sev], 0);
  const expected = Math.max(0, Math.round(100 - penalty * mult));
  if (s.value !== expected) {
    err(`score.value is ${s.value} but 100 − (${penalty} × ${mult}) rounds to ${expected}`);
  }

  // Grade: raw band, lowered to C+ when any confirmed Critical exists.
  const rawGrade = gradeFor(s.value);
  const capApplies = tally.critical > 0 && GRADE_ORDER.indexOf(rawGrade) < GRADE_ORDER.indexOf("C+");
  const expectedGrade = capApplies ? "C+" : rawGrade;
  if (normGrade(s.grade) !== expectedGrade) {
    err(`score.grade is ${s.grade} but expected ${expectedGrade}${capApplies ? " (Critical present, capped at C+)" : ""}`);
  }
  if (s.capped !== capApplies) err(`score.capped should be ${capApplies}`);
}

function run(file) {
  if (!file) {
    console.error("usage: node validate_findings.cjs <SECURITY_AUDIT.json>");
    return 2;
  }
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`cannot read ${file}: ${e.message}`);
    return 2;
  }
  const { errors, warnings } = validate(doc);
  warnings.forEach((w) => console.warn(`warning: ${w}`));
  if (errors.length) {
    errors.forEach((e) => console.error(`error: ${e}`));
    console.error(`\n${file}: INVALID (${errors.length} error${errors.length === 1 ? "" : "s"})`);
    return 1;
  }
  console.log(`${file}: valid (${doc.findings.length} records${warnings.length ? `, ${warnings.length} warning(s)` : ""})`);
  return 0;
}

module.exports = { validate };
if (require.main === module) process.exit(run(process.argv[2]));
