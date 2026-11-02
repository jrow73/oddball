# ODDBALL

**Online Dice-Driven Baseball And League Lab**  
**Roll a game. Build a league.**

ODDBALL is a planned browser-based baseball dice companion and league simulator. The first supported ruleset will be *Deadball: Baseball With Dice, Second Edition* using Modern rules.

## Current status

This repository contains the foundation build: a responsive project landing page, planning documents, and a dependency-free project check. It does **not** yet contain a playable rules engine, trait generator, digital scorekeeper, or league simulator.

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
├── styles.css
├── app.js
├── docs/
│   ├── DEVELOPMENT-WORKFLOW.md
│   ├── PROJECT-BRIEF.md
│   └── ROADMAP.md
├── scripts/
│   └── check-project.mjs
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

Define the first playable Dice Companion slice before implementing the rules engine. See [docs/ROADMAP.md](docs/ROADMAP.md).

