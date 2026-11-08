# ODDBALL

**Online Dice-Driven Baseball And League Lab**  
**Roll a game. Build a league.**

ODDBALL is a browser-based baseball dice companion with exhibition-game and league-simulation modes planned for later milestones. The first supported ruleset is *Deadball: Baseball With Dice, Second Edition* using Modern rules.

## Current status

This repository contains the Modern-rules Dice Companion release candidate. It resolves compatible hitter and pitcher traits, hits, defensive checks, walks, possible errors, outs, six play-state oddities, stolen-base attempts, the Bunt Table, and table-defined Hit & Run outcomes with explainable calculations, suggested state changes, and retained manual overrides. Batter and pitcher profiles can be saved locally and backed up or restored as a validated JSON file without creating a lineup or league. The public-release usability pass is complete. Saved games, trait generation, digital scorekeeping, and league simulation are not yet implemented.

## Run locally

Open this folder in VS Code and use Live Server on `index.html`. The project is plain HTML, CSS, and JavaScript and does not require a build step.

To run the project check, use:

```text
npm run check
```

The check uses Node.js built-ins only; no package installation is required.

## Project structure

```text
ODDBALL/
├── index.html
├── dice-companion.html
├── dice-companion.css
├── companion.mjs
├── licensing.mjs
├── profiles.mjs
├── styles.css
├── app.js
├── docs/
│   ├── DEVELOPMENT-WORKFLOW.md
│   ├── DICE-COMPANION-USABILITY.md
│   ├── FIRST-PLAYABLE-SLICE.md
│   ├── PLAYER-PROFILES.md
│   ├── PROJECT-BRIEF.md
│   ├── RELEASE-CHECKLIST.md
│   ├── RULES-CITATION-AUDIT.md
│   ├── RULES-DECISIONS.md
│   └── ROADMAP.md
├── rules/
│   └── deadball/modern.mjs
├── scripts/
│   └── check-project.mjs
├── tests/
│   ├── modern-possible-error.test.mjs
│   ├── licensing.test.mjs
│   └── profiles.test.mjs
└── Based on Akers Games logo.png
```

The supplied Akers Games image remains unchanged in the project root. The rulebook is available through the project materials and is intentionally not stored in the local app folder or eventual repository.

## Guardrails

- Keep the Dice Companion useful as a standalone experience for paper scorekeeping.
- Keep Deadball-specific rules separate from reusable team, schedule, league, and dice-presentation code.
- Show dice, modifiers, and reasoning for resolved plays; allow corrections or overrides.
- Treat missing historical data as unknown, never automatically as zero.
- Use `https://akersgames.com` for the Akers Games purchase link.
- Keep the exact ownership acknowledgment, supplied Akers Games mark, W. M. Akers credit, and confirmed purchase link available in the first-entry and About/Credits experiences.
- Do not add backend services or paid dependencies without an explicit decision.
- Do not assume Scorecard Studio code or data is available for reuse.

## Next decision

Review the public release-candidate homepage and complete the local checks in [docs/RELEASE-CHECKLIST.md](docs/RELEASE-CHECKLIST.md). After acceptance, merge `develop` into `main`, enable GitHub Pages from the repository root, and verify the published homepage and Dice Companion before sharing the URL.

