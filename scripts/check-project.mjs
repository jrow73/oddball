import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredFiles = [
  "index.html",
  "prototype.html",
  "prototype.css",
  "companion.mjs",
  "licensing.mjs",
  "profiles.mjs",
  "styles.css",
  "app.js",
  "README.md",
  "CHANGELOG.md",
  "docs/PROJECT-BRIEF.md",
  "docs/DEVELOPMENT-WORKFLOW.md",
  "docs/DICE-COMPANION-USABILITY.md",
  "docs/FIRST-PLAYABLE-SLICE.md",
  "docs/PLAYER-PROFILES.md",
  "docs/RULES-DECISIONS.md",
  "docs/ROADMAP.md",
  "rules/deadball/modern.mjs",
  "tests/modern-possible-error.test.mjs",
  "tests/licensing.test.mjs",
  "tests/profiles.test.mjs",
  "Based on Akers Games logo.png",
];

const failures = [];

for (const relativePath of requiredFiles) {
  try {
    await access(path.join(projectRoot, relativePath), constants.R_OK);
  } catch {
    failures.push(`Missing or unreadable: ${relativePath}`);
  }
}

const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
const prototype = await readFile(path.join(projectRoot, "prototype.html"), "utf8");

for (const expected of [
  "Online Dice-Driven Baseball And League Lab",
  "Roll a game.",
  "Based%20on%20Akers%20Games%20logo.png",
  "https://akersgames.com",
  'href="./styles.css"',
  'src="./app.js"',
]) {
  if (!html.includes(expected)) {
    failures.push(`index.html is missing: ${expected}`);
  }
}

for (const expected of [
  "Paper-scorekeeping companion",
  'id="batter-profile-dialog"',
  'id="pitcher-profile-dialog"',
  'id="steal-manual-roll"',
  'id="bunt-manual-rolls"',
  'id="hit-run-manual-roll"',
  'id="oddity-manual-rolls"',
  'id="defense-checkpoint"',
  'id="defense-fielder"',
  'id="def-roll"',
  'id="def-modifier"',
  'id="finish-defense"',
  'id="manage-profile-library"',
  'id="profile-library-dialog"',
  'id="export-profiles"',
  'id="profile-backup-file"',
  'id="import-profiles"',
  'id="open-deadball-credits"',
  'id="deadball-credits-dialog"',
  'id="owns-deadball"',
  'id="continue-to-companion"',
  "I own a copy of Deadball: Baseball With Dice, Second Edition.",
  "Based%20on%20Akers%20Games%20logo.png",
  "https://akersgames.com",
  "Use for this play",
  "Edit current",
  "Enter ratings manually",
  "Developer acceptance fixture",
  "Replay the C+ Hit &amp; Run fixture",
  "successful steal puts the runner on third",
  '<option value="-20">−d20</option>',
  'id="pitch-operator"',
  'id="batter-hand"',
  'id="pitcher-hand"',
  'id="pitcher-role"',
  'id="steal-controls"',
  'id="steal-target"',
  'id="steal-runner-trait"',
  'id="catcher-steal-modifier"',
  'id="steal-roll"',
  'id="bunt-controls"',
  'id="bunt-contact-plus"',
  'id="bunt-free-swinger"',
  'id="bunt-speed-plus"',
  'id="bunt-roll"',
  'id="hit-run-controls"',
  'id="hit-run-runner-trait"',
  'id="hit-run-catcher-modifier"',
  'id="hit-run-steal-roll"',
  'id="batter-profile-select"',
  'id="new-batter-profile"',
  'id="save-batter-profile"',
  'id="remove-batter-profile"',
  'id="pitcher-profile-select"',
  'id="new-pitcher-profile"',
  'id="save-pitcher-profile"',
  'id="remove-pitcher-profile"',
  'id="hitter-power-trait"',
  'id="hitter-contact-plus"',
  'id="hitter-speed-plus"',
  'id="pitcher-groundball-plus"',
  'id="effective-pitch-die"',
  'href="./prototype.css?v=0.27"',
  'src="./companion.mjs?v=0.27"',
]) {
  if (!prototype.includes(expected)) {
    failures.push(`prototype.html is missing: ${expected}`);
  }
}

if (failures.length > 0) {
  console.error("ODDBALL project check failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`ODDBALL project check passed (${requiredFiles.length} required files).`);
}

