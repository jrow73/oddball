# Changelog

## 2026-11-07 — Hit & Run possible-error resolution

### Added

- A conditional DEF checkpoint when a Hit & Run MSS lands in the possible-error range
- Complete Hit & Run possible-error outcomes for the DEF 0-2, 3-9, 10-11, and 12+ bands
- Special possible-error groundball mapping for MSS endings 0-2, plus the normal infield and outfield positions for endings 3-9
- Focused automated coverage for every DEF band and both groundball and pop-up placement

### Changed

- Replaced the Hit & Run possible-error manual-ruling boundary with a page 28-29 DEF resolution combined with the applicable Hit & Run row
- Retained oddities as the only unresolved Hit & Run interaction
- Reserved “modified” in calculation trails for rolls that actually received a nonzero trait, target, or defensive modifier
- Moved the manual Hit & Run stolen-base d8 onto its own row so the input remains visible at every layout width
- Updated the manual-dice MSS display before a required DEF checkpoint so it always reflects the play being resolved

## 2026-11-06 — Dice Companion usability pass, slice 1

### Added

- Expandable player-detail and trait sections that keep optional controls out of the common roll path
- A collapsed developer acceptance fixture that remains available without interrupting ordinary use
- Focused usability acceptance notes for the first public-release interface pass
- Focused batter and pitcher setup dialogs with explicit create, edit, apply-without-saving, save/update, cancel, and remove actions
- Compact participant summaries showing the ratings and active traits used by the next play
- Mode-aware dice entry that hides physical-roll controls until **Enter my dice** is selected
- A conditional defense checkpoint that identifies the fielder and exposes the DEF roll and trait only when the play requires them
- Versioned player-profile JSON export with strict validation before import
- Merge and confirmed-replace restore choices for the complete browser-local player library
- A first-entry Deadball ownership acknowledgment using the supplied Akers Games licensing mark
- Persistent Dice Companion About/Credits access with W. M. Akers credit and the confirmed purchase link

### Changed

- Promoted saved-player selection, BT, OBT, and Pitch Die as the immediately visible participant controls
- Reframed the page introduction around resolving the next play without creating a lineup or digital game
- Replaced the ambiguous unsaved-player option with the clearer “Enter ratings manually” choice
- Replaced the accepted expandable player sections with modal setup dialogs to reduce page height and scrolling
- Made Cancel and Escape restore the participant values that were active before the dialog opened
- Kept the calculated-result panel visible while scrolling the setup on wide desktop layouts
- Changed the default defender trait from an implied D+ to **None** and preserve the original play rolls while the user confirms defense
- Kept current-play batter and pitcher ratings unchanged when the saved player library is imported
- Remembered the ownership acknowledgment per browser while allowing a clear fallback when storage is unavailable

## 2026-11-05 — Saved player-profile foundation

### Added

- Browser-local saved batter and pitcher profiles in the Dice Companion
- Versioned profile storage separating player identity from Deadball Modern rating records
- Save, load, update, and confirmed removal controls in each participant card
- Explicit New profile, Save new profile, and Update profile states so adding a second player cannot be mistaken for editing the selected one
- Safe fallback when stored profile data is invalid or uses an unknown schema version
- Six focused profile-store tests covering creation, updates, role filtering, removal, persistence, and invalid data
- Player-profile scope and acceptance documentation

### Changed

- Marked the Hit & Run increment as approved
- Began Milestone 3 with saved profiles while leaving lineups and team assignment for later increments

## 2026-11-05 — Hit & Run increment

### Added

- Hit & Run as a separate play type combining an MSS with a simultaneous stolen-base d8
- Standard +5 BT/OBT bonus, C+ +10 bonus, and C- no-bonus behavior
- Normal runner S+/S- and catcher D+/D- stolen-base modifiers with visible arithmetic
- Complete table-defined outcomes for hits, pop-ups or strikeouts, groundballs, and double plays
- Standard walk resolution with the batter at first and the original runner forced to second
- Explicit manual-ruling boundary for possible errors and oddities not covered by the Hit & Run table
- Ten focused tests for all table rows, target and steal modifiers, validation, and third-out behavior
- Rules decision RD-019 documenting source behavior and the intentionally unresolved interactions

### Changed

- Marked the bunting increment as approved
- Replaced the acceptance fixture with a C+ Hit & Run boundary example

## 2026-11-05 — Bunting increment

### Added

- Bunt as a separate play type using the complete d6 Bunt Table
- C+ and C- bunt modifiers with visible arithmetic
- Lead-runner identification, sacrifice movement, forced trailing-runner movement, and squeeze scoring
- S+ top result as a defensive single to the third baseman using the existing DEF engine
- Eight focused tests for every table branch, traits, force movement, third-out scoring, and validation
- Rules decision RD-018 documenting table behavior and base-state interpretations

### Changed

- Marked the stealing-home increment as approved
- Replaced the acceptance fixture with a C+ squeeze-bunt boundary example

## 2026-11-05 — Stealing-home increment

### Added

- Home-plate target limited to S+ runners occupying third base
- Modified d8 threshold using the mandatory S+ bonus and catcher D+/D- effects
- Successful steal-home scoring and caught-stealing state changes
- Third-out cleanup while preserving other runners on non-inning-ending attempts
- Five focused tests for success, failure, traits, validation, and inning-ending behavior
- Rules decision RD-017 documenting the source procedure and modifier interpretation

### Changed

- Marked the double-steal increment as approved
- Replaced the acceptance fixture with a steal-home boundary example

## 2026-11-04 — Double-steal increment

### Added

- Double-steal target for runners on first and second with third base empty
- Separate result bands for the lead runner out, trailing runner out, and both runners safe
- Dedicated lead-runner S+1 and S-1 modifiers plus catcher D+/D- modifiers
- Explicit runner-by-runner advancement explanations and third-out base cleanup
- Seven focused tests for table bands, modifiers, validation, and inning-ending behavior
- Rules decision RD-016 documenting the page 31-specific S- treatment and remaining boundary

### Changed

- Marked the ordinary stolen-base increment as approved
- Replaced the acceptance fixture with a double-steal boundary example

## 2026-11-04 — Ordinary stolen-base increment

### Added

- Play-type choice between a plate appearance and stolen-base attempt
- Single-runner steals of second and third
- S+, S-, catcher D+, catcher D-, and steal-third roll modifiers
- Automatic and manual stolen-base d8 rolling
- Safe, caught-stealing, and inning-ending suggested state changes
- Seven focused tests for thresholds, modifiers, validation, and third-out cleanup
- Rules decision RD-015 documenting the supported boundary and deferred double/home steals

### Changed

- Marked the handedness matchup increment as approved
- Replaced the acceptance fixture with a stolen-base modifier example

## 2026-11-03 — Handedness matchup increment

### Added

- Batter batting-hand and pitcher throwing-hand controls
- Starter and reliever role selection for the matchup maximum
- Same-handed R/R and L/L Pitch Die increases
- d12 starter cap and d20 reliever cap
- Stacking between the handedness adjustment and GB+
- Six focused tests for activation, exclusions, caps, stacking, validation, and the acceptance fixture
- Rules decision RD-014 documenting matchup behavior and remaining boundaries

### Changed

- Marked the negative Pitch Die increment as approved
- Replaced the acceptance fixture with a same-handed -d4 to d4 matchup

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

