# Changelog

## 2026-11-03 — Negative Pitch Die increment

### Added

- Complete Modern Pitch Die ladder from -d20 through d20
- Negative-die subtraction for both manual and automatic rolling
- Dynamic plus/minus presentation and die-face validation
- GB+ movement across negative levels, including -d4 to d4
- Five focused tests for the ladder, subtraction, oddities, low critical hits, and validation
- Rules decision RD-013 documenting the negative-die behavior and remaining pitching boundaries

### Changed

- Marked the GB+ increment as approved
- Replaced the acceptance fixture with an MSS 1 example produced by a -d4 pitcher
- Corrected defensive-double errors so the batter reaches third and existing runners receive the extra error base

## 2026-11-03 — GB+ Groundball Machine increment

### Added

- Bases-loaded Pitch Die increase by one level, capped at d20
- Visible current-play Pitch Die indicator for manual rolling
- GB+ conversion of Out Table result 2 to a 6-3 groundball
- Automatic double play when GB+ result 2 occurs with a runner on first
- Six focused tests for activation, the d20 cap, validation, groundballs, and automatic double plays
- Rules decision RD-012 documenting GB+ behavior and current positive-die boundary

### Changed

- Marked compatible hitter-trait ordering as approved
- Corrected the Modern Pitch Die sequence to d4, d8, d12, and d20; GB+ now raises d8 directly to d12
- Corrected loaded groundballs so every forced lead runner advances; inning-ending double plays suppress the run

## 2026-11-03 — Compatible hitter-trait ordering

### Added

- Independent C+ and S+ controls that can coexist with a P trait
- Explicit P-modifier-first calculation before C+ or S+ evaluates the modified Hit Table value
- Combined-trait tests, including P+/C+, P-/S+, and simultaneous C+/S+
- Rules decision RD-011 documenting multiple-trait support and ordering

### Changed

- Replaced the single all-purpose Hit Table trait dropdown with a P-tier dropdown and independent C+ and S+ checkboxes
- Marked the effective-target trait increment as approved

## 2026-11-03 — Effective-target trait increment

### Added

- C- situational BT/OBT reduction with runners on second or third
- K+ opposing-BT reduction and Out Table result 3 strikeout conversion
- CN+ and CN- opposing-OBT adjustments
- Effective target arithmetic in every affected result explanation
- Seven focused tests for activation, combined modifiers, classification changes, and K+ outs
- Rules decision RD-010 documenting modifier ordering and boundaries

### Changed

- Marked the first play-state oddities increment as approved

## 2026-11-03 — Play-state oddities increment

### Added

- Optional Oddities toggle and manual or automatic 2d10 rolls
- Hit by pitch, wild pitch, passed ball, pitcher error, balk, and catcher interference resolution
- Clear continuation guidance for oddities that do not finish the at-bat
- Identification and manual-handling boundary for oddities requiring broader game state
- Eight focused tests for the optional toggle, supported outcomes, unsupported outcomes, and validation
- Rules decision RD-009 documenting the first Oddities Table boundary

### Changed

- Marked the Hit Table batting-trait increment as approved

## 2026-11-02 — Hit Table batting-trait increment

### Added

- Hitter-trait control for P+, P++, P-, P--, C+, and S+
- Power and weak-hitter adjustment before Hit Table lookup
- C+ doubles and S+ doubles/triples with their no-DEF behavior
- Critical-trait ordering, including the S+ inside-the-park home run
- Seven focused tests for ordinary, defensive, and critical trait paths
- Rules decision RD-008 documenting source rules and boundary interpretations

### Changed

- Automatic mode now determines whether DEF is needed after applying the hitter trait
- Marked the neutral-trait critical-hit increment as approved

## 2026-11-02 — Neutral-trait critical-hit increment

### Added

- MSS 2-5 critical-hit resolution for neutral batting traits
- One-level Hit Table upgrades from single to double and double to triple
- The required extra base for every existing runner
- Critical handling of DEF-marked entries without a defensive roll
- Six focused tests for upgrades, runner advancement, home runs, and validation
- Rules decision RD-007 separating this increment from batting bonus traits

### Changed

- Automatic mode now rolls the Hit Table for critical hits but never rolls DEF for them
- Marked the common out-resolution increment as approved

## 2026-11-02 — Common out-resolution increment

### Added

- Full Out Table mapping for strikeouts, infield groundballs, and outfield pop-ups
- Productive-out advancement below MSS 70
- Fielder's choices, double plays, and eligible triple plays
- Third-out cleanup and run suppression
- Seven focused tests for common out paths and multi-runner advancement
- Rules decision RD-006 documenting advancement and inning-ending behavior

### Changed

- Corrected the shared out helper to preserve legal base states with multiple runners
- Expanded MSS 70+ outfield-out explanations to name every occupied runner who holds
- Standardized result headings as concise play rulings and moved individual runner actions to the detail line
- Marked the defensive Hit Table increment as approved

## 2026-11-02 — Defensive Hit Table increment

### Added

- Defensive Hit Table resolution for named infielders and outfielders
- D+ and D- modification for defensive-hit checks
- Error, unchanged-hit, reduced-hit, and hit-turned-out result bands
- Six focused tests for every defensive band and third-out cleanup
- Rules decision RD-005 documenting the single-at-10-11 interpretation from the worked example

### Changed

- Automatic mode now rolls DEF only when the resulting hit or possible-error path requires it
- Marked the ordinary Hit Table increment as approved

## 2026-11-02 — Ordinary Hit Table increment

### Added

- d20 Hit Table input and path-specific automatic rolling
- Standard singles, runner-advancing singles, the runner-advancing double, and home runs
- Structured baserunner movement and scoring for supported ordinary hits
- Six focused tests for hit advancement, scoring, defensive boundaries, and input validation
- Rules decision RD-004 documenting the deliberately deferred defensive-hit results

### Changed

- Expanded the Dice Companion acceptance fixtures to include an ordinary hit
- Marked the walk and forced-advancement increment as approved

## 2026-11-02 — Walk and forced-advancement increment

### Added

- Walk resolution for the BT+1 through OBT result band
- Forced advancement for every occupied-base combination, including a bases-loaded walk
- Five focused walk tests covering empty, partially occupied, and loaded bases
- Rules decision RD-003 distinguishing source text from ordinary baseball force behavior

### Changed

- Generalized the rules entry point from a possible-error-only resolver to an at-bat resolver
- Updated the Dice Companion copy and acceptance fixtures to cover both supported paths

## 2026-11-02 — Functional possible-error vertical slice

### Added

- Pure Modern-rules module for possible-error resolution
- App-generated and manual dice modes
- BT and OBT batter inputs with optional participant names
- Structured result explanations and source references
- Suggested context confirmation
- Manual override retention
- Automated tests for MSS bands, successful DEF checks, errors, special fielder mappings, unsupported outcomes, and missing dice
- Rules decision log based on verified rulebook pages 26–30

### Changed

- Converted the review wireframe into a functional Dice Companion slice
- Corrected the MSS 47 wording from generic “flyout” to the Out Table’s “pop-up to LF” (F-7)
- Marked the approved planning defaults and Milestone 1 as complete

## 2026-11-02 — First playable slice planning

### Added

- Draft Dice Companion slice specification
- Responsive, nonfunctional review wireframe
- Fourteen proposed acceptance checks
- Five explicit workflow questions for user approval

### Changed

- Foundation page now links to the first-slice review
- Roadmap marks Milestone 1 as drafted for review
- Project check now validates the wireframe and specification files

## 2026-11-02 — Source cleanup and purchase link

### Changed

- Replaced the pending purchase-link placeholder with `https://akersgames.com`
- Updated project documentation and checks to reflect how the rulebook is supplied

### Removed

- Local copy of the Deadball Second Edition rulebook; it remains available through the project materials

## 2026-11-01 — Foundation build

### Added

- Responsive ODDBALL project landing page
- Browser storage capability indicator
- Product brief, workflow, and proposed roadmap
- Dependency-free project validation script
- Initial `.gitignore` and package metadata

### Preserved

- Supplied Akers Games licensing image
- Supplied Deadball Second Edition rulebook

### Not yet implemented

- Play resolution or rules engine
- Ownership acknowledgment gate
- Player, game, or league persistence
- Historical-data pipeline

