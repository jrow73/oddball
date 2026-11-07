# Rules citation and coverage audit

Status: **Complete for the Modern Dice Companion release candidate**  
Audit date: **2026-11-06**

This audit checks the rulebook page references shown with calculated results. It also records the result types that the Dice Companion deliberately leaves for a manual ruling. Detailed interpretations and user-approved rulings remain in `RULES-DECISIONS.md`.

## Citation map

| Resolver area | Rulebook pages shown with results | Audit result |
| --- | --- | --- |
| Pitch Die definition and negative dice | 23 | Added to any plate appearance or Hit & Run result that begins with a negative Pitch Die. |
| Batter and pitcher traits | 24 | Present on results whose resolution can use the implemented traits. |
| MSS, hits, walks, and possible errors | 26-28 | Present on the applicable plate-appearance and Hit & Run result paths. |
| Out Table and runner advancement | 29-30 | Present on ordinary outs, successful possible-error checks, and Hit & Run out paths. |
| Stolen bases and double steals | 24, 31 | Present on all supported steal results. |
| Bunts | 24, 28, 31, 33 | Present on ordinary bunt results; page 28 is included when the S+ result calls for a DEF check. |
| Hit & Run | 24, 26-29, 31-33 | The displayed pages vary by the result. Possible-error paths include the DEF and special fielder-mapping pages; ordinary outs include the Out Table page. |
| Same-handed matchup adjustment | 34 | Added when the matchup changes, or is capped from changing, the current Pitch Die. |
| Oddities | 42-44 | Present on supported oddities and on oddities that require broader game state. |

The displayed references are intentionally concise. They identify the pages needed to verify the resolved path; they are not a substitute for the complete rulebook or the project's decision log.

## Deliberate manual-ruling boundaries

One category remains unresolved by design:

1. **Oddities requiring broader game state.** Fan interference, weather, injuries, pick-offs, disputed calls, distraction, dropped third strikes, and similar results can require roster, strategy, era, or continuing-game state that the current standalone companion does not track. ODDBALL names the table result and directs the user to resolve it manually.

Hit & Run possible errors are supported by combining the page 29 possible-error fielder mapping with the page 28 DEF bands and the applicable page 33 Hit & Run outcome. That combination is recorded as a user-selected interpretation in RD-019.

The currently automated Oddities results are hit by pitch, wild pitch, passed ball, pitcher error, balk, and catcher interference.

## Audit safeguards

- Automated tests verify that a negative Pitch Die adds the page 23 citation in both ordinary plate appearances and Hit & Run plays.
- Automated tests already verify that same-handed matchup handling adds the page 34 citation.
- Automated tests cover all four Hit & Run possible-error DEF bands and the special groundball mapping for MSS endings 0-2.
- Page references are stored on the rules-engine result, so the visible citation follows the resolved rule path instead of being inferred separately by the interface.
- Any future supported play type should add its source pages and acceptance fixtures in the same build slice.

