# Proposed roadmap

This roadmap is a planning draft. Milestones after the foundation build are not approved specifications.

## Milestone 0 — Foundation

Status: **Initial baseline created**

- Establish local direct-edit workflow
- Preserve supplied source materials
- Create the browser-app shell
- Record product decisions and guardrails
- Add a dependency-free project check

## Milestone 1 — First playable slice definition

Goal: agree on a narrow Dice Companion workflow before rules implementation.

Decisions to make:

- Minimum player and lineup information
- Required play context: outs, bases, pitcher, batter, fielders, and strategy
- Manual dice entry versus app-generated rolls
- Initial subset of outcomes and rules
- Explanation format and correction flow
- Optional state retained between plays
- Exact licensing gate wording and behavior; the purchase URL is confirmed as `https://akersgames.com`

Deliverable: a written interaction specification, wireframe, and acceptance checks.

## Milestone 2 — Dice Companion vertical slice

Goal: resolve a deliberately limited set of Modern-rule plate appearances end to end.

Likely components:

- Rules data separated from engine code
- Seedable or injectable dice rolls for tests
- Play context form
- Result explanation
- Manual override
- Focused automated rules tests

Candidate acceptance example: resolve the documented MSS 47 possible-error scenario with a runner on first and explain why a successful left-field catch leaves the runner at first.

## Milestone 3 — Complete standalone Dice Companion

Goal: cover the agreed Modern-rule play-resolution scope while preserving paper scorekeeping.

- Full supported tables and modifiers
- Player and lineup management
- Save, export, and import
- Rules citations and decision log
- Licensing welcome and persistent credits

## Milestone 4 — Exhibition Game

Goal: add complete digital game state and optional scorekeeping using the same rules engine.

- Inning, score, outs, and baserunners
- Lineups and substitutions
- Pitcher fatigue and availability
- Manual and computer control
- Step, inning, and game simulation controls

## Milestone 5 — League foundation

Goal: support a single-season league without requiring a backend.

- League and team creation
- Schedules and standings
- Roster snapshots
- Results and accumulated statistics
- Mixed manual and automated control per game

## Later exploration

- Historical player data pipeline and trait generation
- Multi-season universes
- Optional remote multiplayer
- Additional or custom rulesets
- Scorecard Studio relationship

