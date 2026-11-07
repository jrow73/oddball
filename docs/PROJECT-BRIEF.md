# ODDBALL project brief

Last updated: 2026-11-01

## Product identity

- **Name:** ODDBALL
- **Expansion:** Online Dice-Driven Baseball And League Lab
- **Tagline:** Roll a game. Build a league.
- **Platform:** Vanilla browser application
- **Hosting direction:** GitHub Pages
- **Persistence direction:** Local browser storage with export/import backups

## Product vision

ODDBALL should support three complementary experiences over time:

1. **Dice Companion:** A complete standalone tool for resolving plays while the user keeps score on paper.
2. **Exhibition Game:** A digitally tracked game with human, computer, or mixed control.
3. **League Simulator:** Schedules, standings, rosters, statistics, availability, and flexible manual or automated control.

The Dice Companion is not merely a stepping stone. It must remain independently useful even after larger game and league systems exist.

## First ruleset

- *Deadball: Baseball With Dice, Second Edition*
- Modern rules first
- Built-in tables and rules rather than user table upload
- Transparent roll and modifier explanations
- Manual corrections and overrides

Rules implementation must distinguish explicit source rules, interpretations, contradictions, and user-selected house rules. The rulebook supplied through the project materials should be cited by page in rules documentation and reviewed before each relevant rule is coded.

## Permission and attribution

The user reports that W. M. Akers permits homebrew companions when his specific licensing image, creator credit, and ideally a purchase link are shown. The supplied image appears to be the required “Based on Akers Games” mark. The confirmed purchase-site URL is [akersgames.com](https://akersgames.com).

The Dice Companion first-entry welcome displays the supplied mark at a readable but secondary size, credits W. M. Akers, and links to Akers Games. The honor-system acknowledgment text is: “I own a copy of Deadball: Baseball With Dice, Second Edition.” It is remembered in that browser, and the same credit, mark, and purchase link remain available through About/Credits afterward.

The broader automated league concept may still warrant a follow-up with Akers once that feature has a concrete description.

## Data principles

Keep these concepts separate:

1. Player identity
2. A player’s ratings for a particular season and ruleset
3. Team assignment within a user-created league

For traded players, preserve both combined season totals and team membership information where available. Missing fields must remain unknown rather than silently becoming zero.

Historical data candidates include the MLB Stats API and a prepared browser-friendly subset of the Lahman database. Coverage, identifiers, licensing, attribution, and required tables still need validation.

## Trait generation

Trait-generation policy remains undecided. The rulebook’s positive and negative population targets are design intent, not a complete annual-percentile algorithm for every trait. Open questions include:

- Fixed book thresholds versus season-adjusted thresholds
- P+ versus P++ treatment
- Ties and small populations
- Career fallback for limited playing time
- Pitcher batting
- Position-specific defense
- Missing historical statistics

Users should be able to inspect and override generated traits.

## Architecture principles

- Use a common rules engine for Dice Companion, Exhibition Game, and League Simulator.
- Have human and computer managers submit the same legal action types.
- Separate ruleset-specific resolution from reusable league functions.
- Prefer deterministic, testable JavaScript manager logic over an external AI service.
- Record explanations and decision logs for debugging and trust.
- Keep local play independent from any future optional multiplayer backend.

## Explicitly out of scope for the foundation build

- Rules resolution
- Full digital scorekeeping
- League creation or simulation
- Historical-data downloads
- Backend services or accounts
- Remote multiplayer
- General custom-ruleset authoring
- Scorecard Studio integration

