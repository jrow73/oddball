# Rules decisions

This document separates source rules from implementation interpretations and product decisions. Page references use the printed page numbers in *Deadball: Baseball With Dice, Second Edition*.

## RD-001 — First vertical slice boundary

Status: **Approved**  
Date: 2026-11-02

The first functional Dice Companion slice resolves only the Modern-rules possible-error path. Outcomes outside that path are classified when possible but explicitly reported as unsupported. The application does not invent a partial resolution.

### Verified source rules

- Page 26: MSS equals the d100 Swing Score plus the Pitch Die result. MSS at or below BT is a hit; MSS above BT through OBT is a walk.
- Page 27: OBT+1 through OBT+5 is a possible error. The Swing Result Table also defines the adjacent hit, walk, productive-out, out, and oddity bands.
- Page 28: DEF uses d12 with D+ adding 1 and D− subtracting 1. Any MSS above OBT should be an out determined by the final MSS digit.
- Page 29: For a possible error, endings 0 or 1 become a groundball to shortstop and ending 2 becomes a groundball to second base. Modified DEF 2 or less is an error; the batter reaches first and every runner advances one base. Modified DEF 3 or more makes the out normally.
- Page 29 Out Table: endings 7, 8, and 9 are pop-ups to left, center, and right field, recorded F-7, F-8, and F-9.
- Page 30: With fewer than two outs and MSS below 70, runners on second or third may advance on an out to the outfield or right side. On an infield ball with a runner on first, MSS below 50 advances that runner while the batter is out; 50–69 is a fielder’s choice; 70+ is a double play.

### Implementation decisions

- Display both BT and OBT in the batter card. BT helps the profile remain recognizable but does not affect a play already classified as OBT+1 through OBT+5.
- Use the source term **pop-up** for endings 7–9. Earlier handoff language called MSS 47 a flyout; the scorekeeping result remains F-7 and the runner-on-first ruling is unchanged.
- Apply the possible-error instruction directly: DEF 3+ makes the out normally. The Defense Table’s hit-reduction rows do not apply because this path did not begin with a hit.
- Keep rules output structured: outcome code, score notation, state delta, calculations, warnings, and source references.
- If a roll lands outside the supported path, show its broad classification and the supported possible-error range rather than fabricating a result.

## RD-002 — Approved Dice Companion defaults

Status: **Approved**  
Date: 2026-11-02

- Default dice mode: Roll for me
- Manual dice entry: Always available
- Context changes: Suggested after a play and applied only after user confirmation
- First rule boundary: Possible-error path
- Player names: Optional
- Overrides: Preserve both the calculated result and the user override note
- Persistence: None in this vertical slice

