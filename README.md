# ODDBALL

**Online Dice-Driven Baseball And League Lab**  
**Roll a game. Build a league.**

ODDBALL is a planned browser-based baseball dice companion and league simulator. The first supported ruleset will be *Deadball: Baseball With Dice, Second Edition* using Modern rules.

## Current status

This repository contains the foundation build and the first functional Dice Companion vertical slice. It resolves Hit Table batting traits, hits, defensive checks, walks, possible errors, outs, and six play-state oddities with explainable calculations, suggested state changes, and retained manual overrides. Oddities that require broader game state are identified for manual handling. Saved games, trait generation, digital scorekeeping, and league simulation are not yet implemented.

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
├── prototype.html
├── prototype.css
├── companion.mjs
├── styles.css
├── app.js
├── docs/
│   ├── DEVELOPMENT-WORKFLOW.md
│   ├── FIRST-PLAYABLE-SLICE.md
│   ├── PROJECT-BRIEF.md
│   ├── RULES-DECISIONS.md
│   └── ROADMAP.md
├── rules/
│   └── deadball/modern.mjs
├── scripts/
│   └── check-project.mjs
├── tests/
│   └── modern-possible-error.test.mjs
└── Based on Akers Games logo.png
```

The supplied Akers Games image remains unchanged in the project root. The rulebook is available through the project materials and is intentionally not stored in the local app folder or eventual repository.

## Guardrails

- Keep the Dice Companion useful as a standalone experience for paper scorekeeping.
- Keep Deadball-specific rules separate from reusable team, schedule, league, and dice-presentation code.
- Show dice, modifiers, and reasoning for resolved plays; allow corrections or overrides.
- Treat missing historical data as unknown, never automatically as zero.
- Use `https://akersgames.com` for the Akers Games purchase link.
- Do not enable the first-entry licensing gate until its final wording and behavior are confirmed.
- Do not add backend services or paid dependencies without an explicit decision.
- Do not assume Scorecard Studio code or data is available for reuse.

## Next decision

Review and accept the first play-state oddities increment before expanding the Dice Companion's required context. See [docs/FIRST-PLAYABLE-SLICE.md](docs/FIRST-PLAYABLE-SLICE.md), [docs/RULES-DECISIONS.md](docs/RULES-DECISIONS.md), and open `prototype.html` with Live Server.

