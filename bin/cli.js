#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// ── Config ──────────────────────────────────────────────
const PACKAGE_ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(PACKAGE_ROOT, "skills");
const VERSION = require(path.join(PACKAGE_ROOT, "package.json")).version;

// ── Colors (no dependencies) ────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

// ── Helpers ─────────────────────────────────────────────

// Detect skill type:
//   "single"  → folder with SKILL.md at top level (humanoid-thinking, golang-developer)
//   "bundle"  → folder with .claude-plugin/plugin.json (multi-skill plugin like pm-thinking)
//   null      → not a recognized skill
function detectSkillType(skillName) {
  const skillRoot = path.join(SKILLS_DIR, skillName);
  if (!fs.existsSync(skillRoot)) return null;

  const hasSkillMd = fs.existsSync(path.join(skillRoot, "SKILL.md"));
  const hasPluginManifest = fs.existsSync(
    path.join(skillRoot, ".claude-plugin", "plugin.json")
  );

  if (hasSkillMd) return "single";
  if (hasPluginManifest) return "bundle";
  return null;
}

function getAvailableSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR)
    .filter((name) => detectSkillType(name) !== null)
    .sort();
}

function getSkillDescription(skillName) {
  const type = detectSkillType(skillName);

  if (type === "single") {
    const skillMd = path.join(SKILLS_DIR, skillName, "SKILL.md");
    const content = fs.readFileSync(skillMd, "utf-8");
    const match = content.match(/description:\s*>?\s*\n?([\s\S]*?)(?=\n---|\n\w+:)/);
    if (match) {
      return match[1].trim().split("\n")[0].trim().slice(0, 80);
    }
    return "";
  }

  if (type === "bundle") {
    // Bundle: read description from .claude-plugin/plugin.json
    const pluginJson = path.join(
      SKILLS_DIR,
      skillName,
      ".claude-plugin",
      "plugin.json"
    );
    try {
      const manifest = JSON.parse(fs.readFileSync(pluginJson, "utf-8"));
      // Count sub-skills inside bundle's skills/ subfolder
      const subSkillsDir = path.join(SKILLS_DIR, skillName, "skills");
      let subSkillCount = 0;
      if (fs.existsSync(subSkillsDir)) {
        subSkillCount = fs
          .readdirSync(subSkillsDir)
          .filter((sub) =>
            fs.existsSync(path.join(subSkillsDir, sub, "SKILL.md"))
          ).length;
      }
      const bundleSuffix = subSkillCount > 0 ? ` [bundle: ${subSkillCount} skills]` : " [bundle]";
      return (manifest.description || "").slice(0, 80 - bundleSuffix.length) + bundleSuffix;
    } catch {
      return "[bundle]";
    }
  }

  return "";
}

function getGlobalDir() {
  return path.join(
    process.env.HOME || process.env.USERPROFILE || "~",
    ".claude",
    "skills"
  );
}

function getProjectDir() {
  return path.join(process.cwd(), ".claude", "skills");
}

function resolveTargetDir(args) {
  // Explicit flags take priority
  if (args.includes("-g") || args.includes("--global")) {
    return { target: getGlobalDir(), scope: "global" };
  }
  if (args.includes("-p") || args.includes("--project")) {
    return { target: getProjectDir(), scope: "project" };
  }

  // Interactive prompt if stdin is TTY and no flag given
  if (process.stdin.isTTY) {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      console.log(`${c.bold}Where do you want to install?${c.reset}`);
      console.log(`  ${c.cyan}1)${c.reset} ${c.bold}Global${c.reset}  → ~/.claude/skills/ ${c.dim}(available in all projects)${c.reset}`);
      console.log(`  ${c.cyan}2)${c.reset} ${c.bold}Project${c.reset} → ./.claude/skills/ ${c.dim}(current project only)${c.reset}`);
      console.log();
      rl.question(`${c.bold}Choose [1/2]:${c.reset} `, (answer) => {
        rl.close();
        const trimmed = answer.trim();
        if (trimmed === "1" || trimmed.toLowerCase() === "g" || trimmed.toLowerCase() === "global") {
          resolve({ target: getGlobalDir(), scope: "global" });
        } else {
          resolve({ target: getProjectDir(), scope: "project" });
        }
      });
    });
  }

  // Non-interactive fallback: auto-detect
  if (fs.existsSync(path.join(process.cwd(), ".claude"))) {
    return { target: getProjectDir(), scope: "project" };
  }
  return { target: getGlobalDir(), scope: "global" };
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.name === "MANIFEST") continue;
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function backupPersonality(targetSkillDir) {
  const personalityPath = path.join(targetSkillDir, "personality.md");
  if (!fs.existsSync(personalityPath)) return null;

  const content = fs.readFileSync(personalityPath, "utf-8");
  if (content.includes("status: configured")) {
    const backupPath = path.join(
      require("os").tmpdir(),
      `personality-backup-${Date.now()}.md`
    );
    fs.copyFileSync(personalityPath, backupPath);
    return backupPath;
  }
  return null;
}

function restorePersonality(targetSkillDir, backupPath) {
  if (backupPath && fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, path.join(targetSkillDir, "personality.md"));
    fs.unlinkSync(backupPath);
    return true;
  }
  return false;
}

// ── Commands ────────────────────────────────────────────

async function cmdInstall(args) {
  const available = getAvailableSkills();
  const skillArgs = args.filter((a) => !a.startsWith("-"));
  let toInstall = [];

  if (skillArgs.length === 0 || args.includes("--all")) {
    toInstall = available;
    console.log(
      `\n${c.cyan}${c.bold}📦 Installing ALL skills...${c.reset}\n`
    );
  } else {
    toInstall = skillArgs;
    const invalid = toInstall.filter((s) => !available.includes(s));
    if (invalid.length > 0) {
      console.log(
        `\n${c.red}❌ Unknown skill(s): ${invalid.join(", ")}${c.reset}`
      );
      console.log(`\nAvailable: ${available.join(", ")}`);
      process.exit(1);
    }
    console.log(
      `\n${c.cyan}${c.bold}📦 Installing: ${toInstall.join(", ")}${c.reset}\n`
    );
  }

  // Resolve target directory (may prompt user interactively)
  const result = await resolveTargetDir(args);
  const targetBase = result.target;
  const scope = result.scope;

  fs.mkdirSync(targetBase, { recursive: true });
  console.log(
    `\n${c.dim}   Scope:  ${scope}${c.reset}`
  );
  console.log(
    `${c.dim}   Target: ${targetBase}/${c.reset}\n`
  );

  let success = 0;
  let fail = 0;

  for (const skill of toInstall) {
    const src = path.join(SKILLS_DIR, skill);
    const dest = path.join(targetBase, skill);

    process.stdout.write(`   ${c.bold}${skill}${c.reset} `);

    try {
      const backup = backupPersonality(dest);

      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }

      copyDirSync(src, dest);

      if (restorePersonality(dest, backup)) {
        console.log(`${c.green}✅ installed${c.reset} ${c.dim}(personality restored)${c.reset}`);
      } else {
        console.log(`${c.green}✅ installed${c.reset}`);
      }
      success++;
    } catch (err) {
      console.log(`${c.red}❌ failed: ${err.message}${c.reset}`);
      fail++;
    }
  }

  console.log(`\n${"═".repeat(40)}`);
  console.log(`  ${c.green}✅ Installed: ${success}${c.reset}`);
  if (fail > 0) console.log(`  ${c.red}❌ Failed: ${fail}${c.reset}`);
  console.log(`  ${c.dim}📁 ${scope === "global" ? "Global" : "Project"}: ${targetBase}/${c.reset}`);
  console.log(`${"═".repeat(40)}\n`);
}

function cmdList() {
  const available = getAvailableSkills();
  console.log(
    `\n${c.cyan}${c.bold}📋 Available Skills (v${VERSION})${c.reset}\n`
  );
  if (available.length === 0) {
    console.log("   No skills found.");
  } else {
    for (const skill of available) {
      const desc = getSkillDescription(skill);
      console.log(`   ${c.bold}${skill}${c.reset}`);
      if (desc) console.log(`   ${c.dim}${desc}${c.reset}`);
      console.log();
    }
  }
  console.log(
    `${c.dim}Install with: npx @verzth/skills install <name>${c.reset}\n`
  );
}

function cmdHelp() {
  console.log(`
${c.cyan}${c.bold}@verzth/skills${c.reset} v${VERSION}
Custom Claude skills by verzth

${c.bold}USAGE${c.reset}
  npx @verzth/skills <command> [options]

${c.bold}COMMANDS${c.reset}
  install [skill...]    Install skills (interactive scope picker)
  install --all         Install all available skills
  list                  Show available skills
  help                  Show this help

${c.bold}FLAGS${c.reset}
  -g, --global          Install to ~/.claude/skills/ (all projects)
  -p, --project         Install to ./.claude/skills/ (current project)
  ${c.dim}If no flag given, you'll be prompted to choose.${c.reset}

${c.bold}EXAMPLES${c.reset}
  npx @verzth/skills install humanoid-thinking
  npx @verzth/skills install humanoid-thinking --global
  npx @verzth/skills install --all --project
  npx @verzth/skills list

${c.bold}NOTES${c.reset}
  - Personality settings are preserved on upgrade
  - Global skills apply to all Claude Code / Cowork projects
  - Project skills only apply to the current project
`);
}

// ── Main ────────────────────────────────────────────────
async function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "install":
    case "i":
    case "add":
      await cmdInstall(args);
      break;
    case "list":
    case "ls":
      cmdList();
      break;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      cmdHelp();
      break;
    default:
      await cmdInstall([command, ...args]);
      break;
  }
}

main().catch((err) => {
  console.error(`${c.red}❌ ${err.message}${c.reset}`);
  process.exit(1);
});
