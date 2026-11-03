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
  "styles.css",
  "app.js",
  "README.md",
  "CHANGELOG.md",
  "docs/PROJECT-BRIEF.md",
  "docs/DEVELOPMENT-WORKFLOW.md",
  "docs/FIRST-PLAYABLE-SLICE.md",
  "docs/RULES-DECISIONS.md",
  "docs/ROADMAP.md",
  "rules/deadball/modern.mjs",
  "tests/modern-possible-error.test.mjs",
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
  "Next rule path active",
  "Replay a neutral-trait critical hit",
  "MSS 2",
  "upgrades it to a double",
  "requires no DEF roll",
  'href="./prototype.css"',
  'src="./companion.mjs"',
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

