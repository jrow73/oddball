import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "README.md",
  "CHANGELOG.md",
  "docs/PROJECT-BRIEF.md",
  "docs/DEVELOPMENT-WORKFLOW.md",
  "docs/ROADMAP.md",
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

if (failures.length > 0) {
  console.error("ODDBALL project check failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`ODDBALL project check passed (${requiredFiles.length} required files).`);
}

