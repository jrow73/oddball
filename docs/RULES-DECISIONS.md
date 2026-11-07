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

## RD-003 — Walks and forced advancement

Status: **Approved**
Date: 2026-11-02

### Verified source rules

- Page 26: MSS above BT and less than or equal to OBT is a walk; the batter advances to first.
- Page 27: The Swing Result Table defines the walk band as BT+1 through OBT and again states that the batter advances to first.

### Implementation decisions

- A walk adds no out and uses score notation **BB**.
- The batter always takes first. Existing runners advance only when forced by an unbroken chain of occupied bases beginning at first.
- A bases-loaded walk scores exactly one run and leaves all three bases occupied.
- Runners on second or third hold when first base is empty. This is ordinary baseball forced-advancement behavior, not an additional Deadball table instruction.
- The DEF roll and defensive trait are ignored for a walk because no possible-error check occurs.

## RD-004 — Ordinary Hit Table results without DEF checks

Status: **Approved**
Date: 2026-11-02

### Verified source rules

- Page 26: MSS at or below BT is a hit and requires a d20 Hit Table roll.
- Page 26 Hit Table: 1-2 and 7-9 are singles; 10-14 are singles with runners advancing two bases; 18 is a double with runners advancing three bases; 19-20 are home runs.
- Page 27: MSS 6 through BT is an ordinary hit. MSS 2-5 is a critical hit and remains outside this increment.

### Implementation decisions

- A standard single advances existing runners one base and places the batter on first.
- Hit Table 10-14 places the batter on first while existing runners advance two bases.
- Hit Table 18 places the batter on second while existing runners advance three bases.
- A home run scores the batter and every occupied runner, then clears the bases.
- Hit Table 3-6 and 15-17 are identified with their named fielder but pause before resolution because they require a defensive-hit check. That check will be implemented as its own reviewed increment.
- The ordinary-hit path requires a valid d20 result. Dice that are not required by the resulting rule path do not affect the ruling.

## RD-005 — Defensive Hit Table checks

Status: **Approved**
Date: 2026-11-02

### Verified source rules

- Page 28: A Hit Table result marked DEF uses d12 for the named fielder. D+ adds 1 and D- subtracts 1.
- Page 28 Defense Table: modified 0-2 is an error with the batter safe and runners advancing one base; 3-9 leaves the hit unchanged; 10-11 reduces the hit one level; 12+ turns the hit into an out.
- Page 28 worked example: a defensive single with an unmodified DEF 11 still reaches first. A D+ modifier raises it to 12 and turns it into an out.

### Implementation decisions

- A defensive single error uses the named fielder's scorekeeping number, puts the batter on first, and advances every existing runner one base.
- A defensive double remains a double before the error is applied. The batter takes the additional error base to third, and existing runners take one extra base beyond the double's normal advancement. This preserves the established Hit Table result rather than making an error less favorable than an unchanged DEF result.
- Modified DEF 3-9 preserves the original single or double and its ordinary advancement.
- Modified DEF 10-11 reduces a double to a standard single. A single remains a single, following the worked example; it is removed only at modified DEF 12+.
- Modified DEF 12+ adds one out and holds existing runners. When it is the third out, the suggested next context clears the bases.
- The result is displayed as **OUT** rather than inventing a detailed scorekeeping sequence that the Defense Table does not supply.

## RD-006 — Productive outs and ordinary outs

Status: **Approved**
Date: 2026-11-02

### Verified source rules

- Page 27: The final MSS digit selects the Out Table result. MSS below 70 may allow advancement on a ball to the outfield or right side; MSS 50-69 can produce a fielder's choice; MSS 70+ can produce an infield double play; MSS 100+ can produce an infield triple play.
- Page 29 Out Table: endings 0-2 are strikeouts, 3-6 are infield groundballs, and 7-9 are outfield pop-ups.
- Page 30: With fewer than two outs and MSS below 70, runners on second or third may advance one base on a ball to the outfield or right side. With a runner on first, MSS below 50 advances that runner while the batter is out; 50-69 is a fielder's choice; 70+ is a double play.
- Page 30: With runners on first and second, no outs, an infield MSS of 100+ is a triple play.

### Implementation decisions

- Strikeouts add one out and hold all runners.
- Eligible outfield and right-side productive outs automatically suggest the source-rule advancement; the user can retain paper authority through the existing override flow.
- On an MSS below 50 groundball with an occupied chain beginning at first, runners advance together as needed to maintain a legal base state. A loaded chain therefore scores the runner from third while the batter is retired.
- A third-out result clears the suggested bases and suppresses runner advancement or runs.
- Double- and triple-play outs are capped by the outs remaining in the inning.
- When an outfield out does not permit advancement, the explanation names every occupied-base runner as holding rather than mentioning only the runner on first.
- Result presentation uses a consistent hierarchy: the large heading names the play, while the smaller detail line lists batter and runner consequences.

## RD-007 — Neutral-trait critical hits

Status: **Approved**
Date: 2026-11-02

### Verified source rules

- Page 27: MSS 2-5 is a critical hit. Roll on the Hit Table and increase the hit one level: single to double, double to triple, and triple to home run.
- Page 28: Existing runners always take one extra base on a critical hit, and defense cannot take away the hit.
- Page 28 worked example: Hit Table 6 normally gives a defensive single to shortstop; on a critical hit it becomes a double and no DEF roll is made.
- Page 28: Bonus batting traits apply before the critical-hit upgrade.

### Implementation decisions

- This increment supports neutral batting traits only. P+, P++, S+, and other batting-trait transformations remain outside the slice because they must be applied before the critical upgrade.
- A critical single becomes a double, a critical double becomes a triple, and a Hit Table home run remains a home run.
- Existing runners receive the Hit Table entry's ordinary advancement plus one base, capped at scoring from any occupied base.
- DEF-marked Hit Table entries retain their named underlying result in the explanation but never request or apply a DEF roll.

## RD-008 — Hit Table batting traits

Status: **Approved**
Date: 2026-11-02

### Verified source rules

- Page 24: P+ adds 1 and P++ adds 2 to the Hit Table roll; P- subtracts 1 and P-- subtracts 2.
- Page 24: C+ turns Hit Table rolls of 1-2 into doubles with runners advancing two bases and no DEF roll.
- Page 24: S+ turns a Hit Table roll of 1 into a double with runners advancing two bases, and a roll of 2 into a triple; neither result uses DEF.
- Page 28: Batting traits apply before the critical-hit upgrade. The worked examples turn a critical P+ natural 14 into a triple and a critical S+ natural 2 into an inside-the-park home run.

### Implementation decisions

- Power is a tiered single-choice trait, while C+ and S+ are independent traits that may coexist with it and with each other.
- Power and weak-hitter modifiers are allowed to produce effective values outside 1-20; the outer Hit Table bands continue naturally, so 21-22 remain home runs and -1-0 remain singles.
- Apply the P+/P++/P-/P-- modifier first. C+ and S+ then evaluate the modified Hit Table value, per the user-selected interaction rule recorded on 2026-11-03.
- C+ and S+ special results replace the modified Hit Table entry before any critical upgrade and suppress DEF as directed.
- If C+ and S+ both match a modified value of 2, S+ supplies the stronger triple result; at modified value 1, both specify the same double result.
- An ordinary S+ triple advances every existing runner three bases, which follows the hit's base value because the trait table does not state a separate runner rule for that result.

## RD-009 — Optional oddities: first play-state subset

Status: **Approved**
Date: 2026-11-03

### Verified source rules

- Page 42: Oddities are optional. When enabled, MSS 1 or 99 rolls 2d10 on the Oddities Table. If an oddity resolves the at-bat, proceed to the next batter; otherwise roll a new MSS for the current batter.
- Page 43: Result 11 is hit by pitch and the batter goes to first; 12 is a wild pitch and all runners advance one base; 15 is a passed ball and all runners advance one base.
- Page 43: Result 18 is a pitcher error, with the batter reaching first and every runner advancing one base; 19 is a balk and all runners advance one base; 20 is catcher interference and the batter goes to first.
- Pages 43-44: The other Oddities Table results require information or procedures involving game location, Pitch Die parity, recent outs, injuries, stealing, video replay, temporary ratings, or other state beyond the current play form.

### Implementation decisions

- Oddities are controlled by an explicit optional-rule checkbox. Disabling them makes MSS 99 an ordinary out and MSS 1 a critical hit.
- Hit by pitch and catcher interference use ordinary forced-advancement behavior when the batter is awarded first; unforced runners hold.
- Wild pitch, passed ball, and balk advance existing runners one base but leave the current at-bat in progress and instruct the user to roll a new MSS.
- Pitcher error uses score notation E-1 and advances the batter and all existing runners one base.
- Every other 2d10 total is named from the Oddities Table but deliberately pauses for manual handling rather than inventing missing game state.
- MSS 1 cannot yet be entered through the current positive Pitch Die controls; support for negative Pitch Die values remains a separate future rules decision.

## RD-010 — Effective BT/OBT trait modifiers

Status: **Approved**
Date: 2026-11-03

### Verified source rules

- Page 24: C- reduces both BT and OBT by 3 when the batter has a runner on second or third.
- Page 24: K+ reduces the opposing batter's BT by 1 without changing OBT. It also records a strikeout on Out Table result 3.
- Page 24: CN+ reduces the opposing batter's OBT by 2 without changing BT; CN- increases OBT by 3.

### Implementation decisions

- The form retains the player's base BT and OBT. Situational and pitcher modifiers produce effective targets for the current play without rewriting the displayed ratings.
- C- is a separate checkbox from the existing Hit Table trait selector because it can coexist with a power, contact, or speed trait and operates before Hit Table resolution.
- K+ and CN traits may be selected together. Their changes combine with an active C- modifier, and the full arithmetic appears in the calculation trail.
- C- is inactive when only first base is occupied. It activates when either second or third is occupied.
- Modified targets may cross. Classification continues in rule order: critical/ordinary hit first, then walk, possible error, and outs.
- GB+, stamina, fatigue, bunt, Hit & Run, and stolen-base trait effects remain outside this increment.

## RD-011 — Compatible hitter traits and Hit Table ordering

Status: **Approved**
Date: 2026-11-03

### Verified source rules

- Page 57: a fictional top prospect who earns a trait rolls again for a possible second trait.
- Page 58: aging can remove one positive trait or all positive traits, confirming that a player may possess multiple traits.
- Page 61: real-player power, contact, speed, defense, and toughness traits use independent qualification guidelines.

### User-selected interaction rule

- Calculate the P Hit Table modifier first to determine the modified Hit Table value.
- Evaluate C+ and S+ against that modified value, not the unmodified d20 roll.

### Implementation decisions

- The prototype separates the mutually exclusive P tier into a dropdown and represents C+ and S+ as independent checkboxes.
- P+ and C+, P+ and S+, or all three may coexist. The calculation trail shows the P adjustment before any C+ or S+ transformation.
- When C+ and S+ both apply to modified value 2, the S+ triple takes precedence over the C+ double. At modified value 1, both lead to the same double.

## RD-012 — GB+ Groundball Machine

Status: **Approved**
Date: 2026-11-03

### Verified source rules

- Page 24: GB+ records a 6-3 groundball on Out Table result 2.
- Page 24: on that GB+ result, a runner on first makes the double play automatic.
- Page 24: GB+ increases the Pitch Die one level with the bases loaded, with d20 as the maximum.
- Page 60: the positive Modern Pitch Die levels are d4, d8, d12, and d20. The Modern table does not use d6 or d10.

### Implementation decisions

- The selected Pitch Die remains the pitcher's base rating. A visible current-play indicator shows the one-level GB+ increase when all three bases are occupied.
- Automatic rolling uses the effective die. Manual entry validates against the effective die, so a base d8 pitcher may enter a roll of 9 through 12 only when GB+ is active with the bases loaded.
- The Out Table result 2 conversion applies whenever GB+ is active. With a runner on first, it overrides the ordinary MSS-based groundball branches and records the automatic double play.
- User clarification: when a groundball begins with a force chain, every forced runner is running. On a loaded-base double play with no outs, the runner on third scores, the runner on second advances to third, and the runner on first and batter are retired.
- The same forced-runner advancement applies to ordinary infield double plays and fielder's choices, not only the GB+ conversion.
- If the double play makes the third out, the forced run does not score and the bases clear for the next inning.
- GB+ uses the complete Modern Pitch Die ladder, including negative dice, as recorded in RD-013.

## RD-013 — Negative Modern Pitch Dice

Status: **Approved**
Date: 2026-11-03

### Verified source rules

- Page 23: a Pitch Die can range from d20 to -d20.
- Page 26: the Pitch Die result combines with the Swing Score to produce MSS; a negative Pitch Die therefore reduces the Swing Score.
- Page 34: the Modern Pitch Die ladder is d20, d12, d8, d4, -d4, -d8, -d12, and -d20. The handedness example explicitly increases -d4 one level to d4.
- Page 35: Pitch Die gains and losses move along that ladder; the fatigue example drops d4 one level to -d4.
- Page 60: the Modern real-player table assigns all four negative levels according to ERA.
- Page 27 lists critical hits at MSS 2-5, while the glossary on page 111 describes a critical hit as MSS 5 or less. MSS 1 remains the explicit Oddities trigger when that optional rule is enabled.

### Implementation decisions

- The Pitch Die selector includes every Modern level. Modern rules have no neutral “No Dice” level between -d4 and d4.
- A user with a negative die enters the ordinary physical face shown on the die. ODDBALL subtracts that face from the Swing Score and displays the subtraction in the calculation trail.
- Automatic rolling also rolls the positive face range and then applies the negative rating. For example, a -d8 face of 6 contributes -6 to MSS.
- GB+ moves negative ratings up the same ladder: -d8 becomes -d4, and -d4 becomes d4.
- Exact MSS 1 triggers Oddities when enabled. MSS values of 0 or less use the glossary’s “5 or less” definition and resolve as critical hits rather than being left unsupported.
- Handedness is implemented separately in RD-014. Fatigue, in-game performance changes, and pitcher-rest effects remain outside this increment.

## RD-014 — Righty and lefty matchup adjustment

Status: **Approved**
Date: 2026-11-03

### Verified source rules

- Page 34: a right-handed pitcher facing a right-handed batter, or a left-handed pitcher facing a left-handed batter, increases the Pitch Die one level.
- Page 34: the same-handed matchup advantage cannot raise a starter above d12, while a reliever may reach d20.
- Page 34: the Pitch Die ladder crosses directly from -d4 to d4; the source uses that exact increase as an example.

### Implementation decisions

- Batter handedness offers right, left, switch, or not set. Pitcher handedness offers right, left, or not set. Leaving either unset preserves the base Pitch Die.
- Switch hitters do not trigger the same-handed bonus because they can bat from the opposite side of the pitcher.
- Pitcher role is limited to starter or reliever for this increment and determines the matchup cap.
- The handedness adjustment is calculated before GB+. Both effects are independent one-level increases and may stack; the starter's d12 limit applies only to the handedness advantage, while GB+ retains its own d20 maximum.
- The selected Pitch Die remains the base rating. The current-play indicator and calculation trail show the effective die without rewriting that rating.
- Broader handedness strategy, lineup platooning, pitcher fatigue, rest, and automatic substitutions remain outside this increment.

## RD-015 — Ordinary stolen-base attempts

Status: **Approved**
Date: 2026-11-04

### Verified source rules

- Page 31: roll d8 to steal second and d8-1 to steal third. Modified results 1-3 retire the runner; 4-8 are safe.
- Page 24: S+ adds 1 to a steal roll and S- subtracts 2.
- Page 24: a D+ catcher subtracts 1 from every opposing stolen-base roll, while a D- catcher adds 1.

### Implementation decisions

- Stolen base is a separate play type from a plate appearance. The app uses the existing outs and occupied-base context while hiding unrelated batter, pitcher, MSS, Hit Table, DEF, and Oddities controls.
- This increment supports one runner attempting second or third. The origin base must be occupied and the target base empty.
- Runner and catcher modifiers combine with the steal-third penalty before applying the safe/out threshold. Modified values may fall below 1 or rise above 8; the outer result bands continue naturally.
- A successful attempt moves only the stealing runner. A caught runner is removed and adds one out. A third-out caught stealing clears the suggested bases for the next inning.
- Both app-generated and manual d8 rolls are supported, with the full arithmetic shown in the explanation trail.
- Double steals and stealing home were deferred from this increment because they use distinct procedures.

## RD-016 — Double-steal attempts

Status: **Approved**
Date: 2026-11-04

### Verified source rules

- Page 31: roll d8 for a double steal. Modified results 1-3 retire the lead runner, 4-5 retire the trailing runner, and 6-8 leave both runners safe.
- Page 31: add 1 when the lead runner is S+ and subtract 1 when that runner is slow.
- Page 24: a D+ catcher subtracts 1 from every opposing stolen-base roll, while a D- catcher adds 1.

### Implementation decisions

- A double steal requires runners on first and second with third base empty. The runner on second is the lead runner and the runner on first is the trailing runner.
- The dedicated page 31 double-steal instruction is treated as the specific rule for the lead runner: S+ adds 1 and S- subtracts 1. The ordinary page 24 S- modifier of -2 remains unchanged for single-runner attempts.
- Catcher D+ and D- modifiers apply because the trait description covers all opposing stolen-base rolls.
- Both runners always attempt to advance. On a modified 1-3, the lead runner is out attempting third and the trailing runner reaches second. On 4-5, the lead runner reaches third and the trailing runner is out attempting second. On 6 or higher, both runners advance safely.
- A caught runner adds one out. If that is the third out, the suggested next context clears all bases.
- Both app-generated and manual d8 rolls are supported, and the result names the action of each runner.
- Stealing home was deferred from this increment for its own rule interpretation and acceptance check.

## RD-017 — Stealing home

Status: **Approved**
Date: 2026-11-05

### Verified source rules

- Page 24: only an S+ Speedy Runner may attempt to steal home from third base. Roll d8; a result of 8 steals home.
- Page 24: S+ adds 1 when rolling to steal a base.
- Page 24: a D+ catcher subtracts 1 from every opposing stolen-base roll, while a D- catcher adds 1.
- Page 31: only Speedy Runners may steal home, and steal attempts occur before the batting roll.

### Implementation decisions

- Stealing home is a single-runner target within the stolen-base play type. Third base must be occupied and the runner trait must be S+.
- The S+ and catcher modifiers apply to the d8 because their trait descriptions cover stolen-base rolls. A modified result of 8 or higher succeeds; 7 or lower retires the runner.
- The steal-third -1 does not apply to home because the source assigns it specifically to attempts to steal third and gives stealing home its own d8 procedure.
- A successful attempt removes the runner from third and records one run without adding an out. Other occupied bases are unchanged.
- A failed attempt removes the runner from third and adds one out. If that is the third out, all suggested bases clear for the next inning.
- Both app-generated and manual d8 rolls are supported, with the S+ and catcher arithmetic shown in the explanation trail.

## RD-018 — Bunt Table

Status: **Approved**
Date: 2026-11-05

### Verified source rules

- Page 31: a bunt replaces the ordinary batting roll. Roll d6 on the Bunt Table and follow the result from left to right.
- Page 33: results 1-2 retire the lead runner and leave the batter safe.
- Page 33: on a 3, a lead runner at first or second advances and the batter is out; a lead runner at third is out and the batter is safe.
- Page 33: results 4-5 advance the lead runner and retire the batter.
- Page 33: on a 6 with an S+ hitter, resolve a single with a DEF check by the third baseman. All other hitters advance the lead runner while the batter is out.
- Page 24: C+ adds 1 to the bunt roll and C- subtracts 1.

### Implementation decisions

- Bunt is a separate play type from an ordinary plate appearance. At least one base must be occupied, and the occupied runner closest to home is the lead runner.
- C+ and C- are independent trait inputs and may cancel. Modified rolls below 1 continue in the 1-2 band; modified rolls above 6 continue in the 6 band.
- When the lead runner is out and the batter is safe, trailing runners advance only as required to make room for the batter at first. This preserves a legal base state without inventing optional advancement.
- When the lead runner advances and the batter is out, every runner who was forced when the bunt was put in play also advances one base. Other unforced runners hold. A runner advancing from third scores unless the batter's out is the third out; in that case the inning ends and the run does not count.
- The S+ top result reuses the established defensive-single procedure with the third baseman as the fielder, including D+/D- effects, errors, and outstanding-play conversion.
- Both app-generated and manual d6 rolls are supported. A d12 DEF roll is generated or required only when the S+ top result calls for it.

## RD-019 — Hit & Run Table

Status: **Approved**
Date: 2026-11-05

### Verified source rules

- Page 32: roll for a stolen base with all normal modifiers at the same time as the MSS.
- Pages 24 and 32: add 5 to BT and OBT for the play, add 10 instead for a C+ batter, and give a C- batter no Hit & Run target bonus.
- Page 33: a hit with a successful steal puts runners at first and third; a hit with a failed steal puts runners at first and second.
- Page 33: a pop-up or strikeout with a successful steal retires the batter and returns the runner safely to first; a failed steal produces a double play.
- Page 33: a groundball with a successful steal retires the batter and advances the runner to second; a failed steal produces a double play.
- Pages 24 and 31: the normal d8 stolen-base threshold and the runner S+/S- and catcher D+/D- modifiers apply.
- Page 29: an MSS from OBT+1 through OBT+5 is a possible error. Endings 0-1 become groundballs to shortstop, ending 2 becomes a groundball to second, and the other endings use their normal Out Table fielder.
- Page 28: modified DEF 0-2 is an error, 3-9 makes no change, 10-11 lowers a hit one level, and 12+ turns a hit into an out.

### Implementation decisions

- This first Hit & Run increment requires exactly one runner on first because every explicit result in the table describes that starting situation.
- Pitch Die, handedness, K+, GB+, and control-trait effects are applied before classifying the batting result. The Hit & Run target bonus is then added to both effective targets.
- C+ and C- cannot both be selected for this play because the source gives them conflicting Hit & Run target bonuses.
- The table's Hit row is authoritative for runner placement and does not request a Hit Table or DEF roll. Both ordinary and critical-hit MSS classifications therefore use the Hit row directly.
- K+ Out Table result 3 and GB+ Out Table result 2 retain their established strikeout and groundball conversions before choosing the Hit & Run row.
- A walk reverts to the standard walk rules: the batter takes first and the runner is forced from first to second. The simultaneous stolen-base result does not change that final placement.
- With two outs, an out by the batter ends the inning and only one out is recorded; the bases clear before a second out can occur.
- A possible error during Hit & Run continues through a DEF check. This combines the page 29 possible-error play with the applicable Hit & Run groundball, pop-up, or hit row.
- On modified DEF 0-2, the error places the batter at first and advances the original runner one base to second.
- On modified DEF 3-9, the play is unchanged: use the applicable Hit & Run groundball or pop-up result.
- On modified DEF 10-11, treat the lowered result as a single and use the Hit & Run hit placement: first and third after a successful steal, or first and second after a failed steal.
- On modified DEF 12+, the batter is out and the applicable Hit & Run groundball or pop-up result determines the runner.
- Oddities remain manual because their interaction with the simultaneous steal is not specified and can require broader game state.
- Both app-generated and manual Swing, Pitch Die, and stolen-base d8 rolls are supported.

## RD-020 — Release-candidate citation and manual-boundary audit

Status: **Ready for acceptance testing**
Date: 2026-11-06

### Verified source rules

- Page 23 defines the Pitch Die range, including negative dice.
- Page 24 collects the implemented batter and pitcher trait effects.
- Pages 26-30 cover MSS classification, hits, walks, possible errors, the Out Table, and ordinary runner advancement.
- Pages 31-33 cover stolen bases, bunts, and Hit & Run play.
- Page 34 covers the same-handed matchup adjustment.
- Pages 42-44 contain the Oddities Table and its result instructions.

### Implementation decisions

- A result that begins with a negative Pitch Die cites page 23 even when no handedness adjustment occurs.
- A result affected by the same-handed matchup rule separately cites page 34.
- Core plate-appearance and Hit & Run citations include the batting-classification pages used to reach the displayed result, not only the final movement table.
- Hit & Run possible errors combine the DEF procedure with the applicable Hit & Run result; only oddity interactions remain manual.
- Oddities requiring game, roster, injury, strategy, or era state remain manual until the corresponding state is part of ODDBALL.
- The full audit and coverage boundary are recorded in `RULES-CITATION-AUDIT.md`.

