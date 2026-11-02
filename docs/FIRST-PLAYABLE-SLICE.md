# First playable slice: Dice Companion

Status: **Approved and implemented as the first vertical slice**  
Prepared: 2026-11-02

## Purpose

The first playable slice should prove the core ODDBALL promise with one transparent plate-appearance workflow:

> Supply only the context needed for one play, resolve it with visible dice and modifiers, understand the ruling, and continue keeping score on paper.

This slice is intentionally smaller than a digital game. It should validate the shared rules-engine approach without requiring lineups, innings, substitutions, statistics, or a league.

## Selected rule boundary

The draft slice covers the Modern-rules **possible-error path** described in the project handoff. This is a useful starting boundary because it touches all of the following:

- Batter and pitcher inputs
- A calculated MSS
- OBT-relative lookup logic
- Fielder selection
- A defensive roll and trait modifier
- Outs and occupied bases
- Runner advancement
- A clear explanation trail
- User correction or override

Before implementation, the applicable rulebook pages must be reviewed from the project-provided source. The handoff notes are sufficient for planning, but they are not a substitute for source verification.

## Representative scenario

The acceptance fixture uses this deterministic example:

- No outs
- Runner on first
- Batter OBT: 42
- Swing roll: 39
- Pitch Die result: 8
- MSS: 47
- Possible-error range: 43–47
- Last digit 7: left field
- DEF roll: 2
- D+ modifier: +1
- Modified DEF: 3
- Result: pop-up to left (F-7); runner on first holds

This is not a hard-coded production outcome. It is the first acceptance fixture for the future rules engine.

## User flow

1. **Open Dice Companion.** The user enters without creating a league or game.
2. **Set play context.** Choose outs and occupied bases.
3. **Set participants.** Enter optional names plus only the ratings and traits needed for this play.
4. **Choose dice mode.** “Roll for me” is the normal default; “Enter my dice” supports physical dice, replay, and deterministic testing.
5. **Resolve.** The engine validates the inputs and returns one outcome.
6. **Read the explanation.** The primary result, state change, calculations, modifiers, and rule path are visible together.
7. **Correct if needed.** The user can edit an input and resolve again or override the displayed ruling with a note.
8. **Continue on paper.** ODDBALL may suggest the next context, but it does not require the user to maintain a complete digital game state.

## Screen anatomy

The first screen is a single responsive workspace with four regions:

### 1. Play context

- Outs: 0, 1, or 2
- First, second, and third base occupied toggles
- Optional runner labels are deferred; occupancy is sufficient for this slice

### 2. Participants and ratings

- Optional batter name
- Batter OBT
- Batter traits relevant to the selected play path
- Optional pitcher name
- Pitch Die size
- Relevant pitcher traits
- Fielder name or position
- Fielder DEF rating and D+/D− trait

The interface should reveal fields progressively. A user resolving one play should not be asked for a complete roster.

### 3. Dice

- Dice mode: app-generated or manually entered
- Swing roll
- Pitch Die result
- DEF roll when the result path requires it

Manual entry is always available. The calculation should be reproducible from the displayed values.

### 4. Result and explanation

- Plain-language outcome
- Immediate state delta: outs, runners, and runs
- Ordered calculation trail
- Applied traits and modifiers
- Rule-path label
- Edit-and-resolve action
- Manual override with optional note

## Result model

The future engine should return structured data rather than a preformatted sentence. A draft shape is:

```js
{
  outcomeCode: "popup",
  summary: "Pop-up to left; runner on first holds.",
  fielder: "LF",
  stateDelta: {
    outsAdded: 1,
    runnerMoves: []
  },
  calculations: [
    "Swing 39 + Pitch Die 8 = MSS 47",
    "OBT 42 → possible-error range 43–47",
    "Last digit 7 → left field",
    "DEF 2 + D+ 1 = modified DEF 3",
    "Modified DEF 3 completes the out"
  ],
  warnings: [],
  sourceRefs: []
}
```

`sourceRefs` stays empty until exact rulebook citations are verified. Display wording belongs in the interface layer; game logic should operate on structured codes and state changes.

## Corrections and overrides

Two different actions are required:

- **Correct input:** return to the existing values, change one or more, and resolve again.
- **Override ruling:** preserve the engine result, record the user-selected outcome and optional note, and visibly mark the result as overridden.

Keeping both the calculated and overridden outcomes will make future debugging and game logs understandable.

## Validation behavior

- Reject impossible outs values and dice results outside the selected die range.
- Require only fields reached by the current rule path.
- Do not interpret a blank historical or player value as zero.
- Focus the first invalid field and explain the problem in plain language.
- Never silently add a missing trait or modifier.

## Explicit non-goals

This slice does not include:

- Full batting or out tables
- Complete runner-advancement coverage
- Strikeouts, walks, hits, steals, bunts, or hit-and-run
- Lineups, substitutions, fatigue, or pitcher availability
- Inning, score, or game persistence
- Player database or historical-data import
- Statistics or league records
- Computer-manager decisions
- Remote multiplayer

Those systems should not be stubbed into the first rules implementation unless the approved slice requires them.

## Acceptance checks

### Workflow

1. A user can reach the Dice Companion without creating a league or complete game.
2. A user can set zero outs and a runner on first without entering runner identity.
3. A user can enter only the ratings, traits, and dice needed for the possible-error path.
4. Both app-generated and manually entered dice are supported.

### Deterministic example

5. Given OBT 42, swing 39, and Pitch Die result 8, the engine calculates MSS 47.
6. The engine identifies MSS 47 as within the possible-error range 43–47.
7. The engine maps last digit 7 to left field after source verification.
8. Given DEF 2 and D+ +1, the engine calculates modified DEF 3.
9. With no outs and a runner on first, the result is a pop-up to left (F-7), one out added, and the runner remaining on first.

### Explanation and control

10. The result shows every calculation and applied modifier in order.
11. The user can correct an input and resolve again without re-entering unrelated context.
12. The user can override the ruling and add a note while retaining the calculated result.
13. Missing values are reported as missing rather than treated as zero.
14. The workflow is keyboard usable and readable at phone and desktop widths.

## Approved defaults

- Default dice mode: **Roll for me**, with manual entry always available
- Participant names: **Optional**
- State tracking: **Show a suggested next context but require user confirmation**
- Override history: **Keep calculated result, override, and note**
- Persistence: **None for the first vertical slice**; add saved profiles after the engine boundary is proven

## Approved decisions

The user approved all recommended defaults on 2026-11-02. The implementation therefore defaults to app-generated dice, keeps manual dice available, requires confirmation before changing context, includes optional names, limits the first rule boundary to possible errors, and retains calculated results alongside overrides.

