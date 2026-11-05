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

Status: **Approved**

Goal: agree on a narrow Dice Companion workflow before rules implementation.

Decisions to make:

- Minimum player and lineup information
- Required play context: outs, bases, pitcher, batter, fielders, and strategy
- Manual dice entry versus app-generated rolls
- Initial subset of outcomes and rules
- Explanation format and correction flow
- Optional state retained between plays
- Exact licensing gate wording and behavior; the purchase URL is confirmed as `https://akersgames.com`

Deliverables:

- [First playable slice specification](FIRST-PLAYABLE-SLICE.md)
- Functional browser slice at `prototype.html`
- Fourteen acceptance checks covering workflow, deterministic rules behavior, explanation, correction, missing data, and accessibility

## Milestone 2 — Dice Companion vertical slice

Status: **Core plate-appearance and baserunning increments accepted; bunting awaiting user acceptance**

Goal: resolve a deliberately limited set of Modern-rule plate appearances end to end.

Implemented components:

- Rules data separated from engine code
- Cryptographically unbiased browser dice plus manual deterministic entry
- Play context form
- Result explanation
- Manual override
- Focused automated rules tests
- Walk resolution with forced baserunner advancement
- Ordinary Hit Table results that do not require a DEF check
- Defensive Hit Table checks with D+/D- modifiers
- Strikeouts, productive outs, fielder's choices, double plays, and triple plays
- Neutral-trait critical hits with upgraded Hit Table results, extra runner advancement, and no DEF check
- Compatible P, C+, and S+ Hit Table transformations, with P modifiers applied before C+/S+ and before critical-hit upgrades
- Optional Oddities toggle and six state-resolvable outcomes; broader oddities identified for manual handling
- C-, K+, CN+, and CN- effective BT/OBT modifiers with visible arithmetic
- K+ Out Table result 3 strikeout conversion
- GB+ bases-loaded Pitch Die increase, Out Table result 2 conversion, and automatic double play
- Full Modern Pitch Die ladder from -d20 through d20, including negative-roll subtraction
- Same-handed batter/pitcher Pitch Die adjustment with starter and reliever caps
- Single-runner steals of second and third with runner and catcher trait modifiers
- Double steals with separate lead-runner, trailing-runner, and both-safe result bands
- S+ steal-home attempts with catcher modifiers, scoring, and caught-stealing outcomes
- Full Bunt Table with C+/C- modifiers, lead-runner movement, and the S+ defensive-single result

Acceptance examples now cover the documented MSS 47 possible-error scenario, walks, hits, outs, critical and trait-modified results, plus wild-pitch and pitcher-error oddities.

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

