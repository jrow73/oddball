# Dice Companion usability pass

This pass reorganizes the completed Modern-rules Dice Companion around its most common task: resolve the next play while keeping score on paper.

## Slice 1 — Essential setup first (accepted)

The initial participant view keeps these controls visible:

- Saved batter and pitcher selection
- Batter BT and OBT
- Pitch Die and its effective value

Names, handedness, pitcher role, traits, and profile-management actions remain available under expandable detail sections. No rules behavior, stored profile fields, or supported play types are removed.

The developer acceptance fixture is collapsed by default so it remains available for regression testing without becoming part of the normal rolling path.

## Acceptance checks

1. With both detail sections closed, select saved players or enter BT, OBT, and Pitch Die manually.
2. Resolve an automatic plate appearance without opening either detail section.
3. Expand **Player details & traits** and confirm that batter name, profile actions, handedness, and every batter trait remain available.
4. Expand **Pitcher details & traits** and confirm that pitcher name, profile actions, handedness, role, and every pitcher trait remain available.
5. Load saved batter and pitcher profiles and confirm their hidden detail values still affect the ruling.
6. Select **Enter ratings manually**, expand the relevant detail section, and confirm a second profile can still be created without overwriting the first.
7. Confirm the developer acceptance fixture is collapsed initially and can still be expanded and replayed.
8. Check the layout at desktop and narrow mobile widths, including keyboard focus on both expandable summaries.

## Slice 2 — Focused player setup dialogs

The accepted expandable sections reduced visual noise but still left the rolling page too tall. They are replaced by compact participant summaries and dedicated setup dialogs.

Each participant card now provides:

- A saved-player selector
- A summary of the current ratings and active traits
- **New batter/pitcher** and **Edit current** actions

The setup dialog includes every rating, trait, and profile-management field. **Use for this play** applies the values without requiring a saved profile. **Save new profile** or **Update profile** writes the values to browser storage. Cancel, the close button, and Escape restore the values that were active before the dialog opened.

### Acceptance checks

1. Confirm both participant cards are substantially shorter and display accurate rating and trait summaries.
2. Select a saved batter and pitcher and confirm each summary updates immediately.
3. Select **New batter**, complete the dialog, and use the player for one play without saving.
4. Repeat the new-player flow and save the player; confirm it appears in the selector.
5. Select a saved player, edit it, and choose **Update profile**; reload it and confirm the changes persist.
6. Edit a saved player and choose **Use for this play**; confirm the saved profile is not overwritten and the selector changes to manual ratings.
7. Change several fields, then Cancel or press Escape; confirm the previous values and selection return.
8. Confirm profile removal still requires confirmation and removes only the selected profile.
9. Resolve automatic and manual plays without opening either setup dialog after players are selected.
10. Inspect both dialogs and the compact participant cards at desktop and narrow mobile widths.

## Slice 3 — Show dice only when they are needed

Automatic rolling no longer displays disabled physical-dice inputs. Choosing **Enter my dice** reveals only the roll controls used by the selected play type:

- Plate appearance: Swing, Pitch Die, Hit Table, and optional Oddities dice
- Stolen base: stolen-base d8
- Bunt: Bunt Table d6
- Hit & Run: Swing, Pitch Die, and stolen-base d8

The selected optional rules and strategic choices remain visible in automatic mode because they still affect resolution. When a play actually requires a DEF check, the result panel pauses on a focused defense checkpoint that identifies the fielder. Automatic mode supplies the d12; manual mode asks for it. The defender trait is always visible and defaults to **None**, so ODDBALL never silently assumes D+ or D−. Finishing the checkpoint preserves the play's original rolls.

On wide desktop layouts, the calculated-result panel remains in view while the setup column scrolls.

### Acceptance checks

1. Select **Roll for me** and confirm no disabled physical-dice inputs are displayed for a plate appearance.
2. Resolve the automatic plate appearance and confirm its calculation trail includes the generated dice.
3. Select **Enter my dice** and confirm the plate-appearance dice panels appear.
4. Switch among Stolen base, Bunt, and Hit & Run in automatic mode; confirm their strategy controls remain but physical-roll fields stay hidden.
5. Repeat those play types with **Enter my dice** and confirm only their relevant dice controls appear.
6. Resolve one automatic and one manual example of each play type.
7. At a wide desktop width, scroll the setup and confirm the result panel remains visible without overlapping the page.
8. At tablet and mobile widths, confirm the result panel returns to normal document flow and no horizontal scrolling appears.
9. In manual Plate appearance mode, use BT 29, OBT 35, Swing 35, Pitch Die 4, and no occupied bases. Resolve the MSS 39 possible-error play and confirm the result pauses for the right fielder's DEF check.
10. Confirm the checkpoint initially selects **None**. Enter DEF 1, finish the ruling, and confirm the trail says `DEF 1 + 0 = modified DEF 1`.
11. Resolve the same play again with DEF 1 and D+. Confirm the original Swing and Pitch Die remain unchanged and the trail says `DEF 1 + 1 = modified DEF 2`.
12. In automatic mode, resolve a play that calls for DEF and confirm ODDBALL supplies the DEF d12 but still waits for the visible fielder-trait choice.
13. In manual Bunt mode, select S+, enter a Bunt Table roll of 6, and confirm the checkpoint identifies the third baseman and asks for the physical DEF d12.
