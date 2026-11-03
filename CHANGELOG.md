# Changelog

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

