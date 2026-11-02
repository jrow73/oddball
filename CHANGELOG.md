# Changelog

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

