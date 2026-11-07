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

## Slice 4 — Back up and restore saved players

The player-library bar reports how many batters and pitchers are saved in the current browser. **Back up or restore** opens one focused dialog for the complete library.

The exported JSON file contains a versioned ODDBALL player-profile backup. Before an import can run, ODDBALL validates the file type, backup version, profile schema, player identities, rating records, and their relationships. Invalid files leave browser storage unchanged.

Import offers two explicit choices:

- **Merge with this browser** keeps current profiles, adds new records, and updates records with matching saved IDs.
- **Replace this browser** uses only the backup and requires confirmation when profiles already exist.

Importing updates the saved-player selectors but deliberately leaves the batter and pitcher ratings currently in use unchanged.

### Acceptance checks

1. Save at least one batter and one pitcher. Confirm the player-library bar reports the correct counts.
2. Open **Back up or restore** and download a backup. Confirm the filename begins with `oddball-player-profiles-` and ends in `.json`.
3. Add another saved profile after downloading. Import the backup using **Merge** and confirm all profiles remain available.
4. Change a profile that came from the backup, then merge the same backup again. Confirm the matching saved record returns to the backed-up values rather than creating another copy.
5. Import the backup using **Replace**, confirm the warning, and verify profiles created after the backup are removed.
6. Start another Replace import and cancel the warning. Confirm the current library is unchanged.
7. Select a plain-text or malformed JSON file. Confirm ODDBALL rejects it and no profiles change.
8. Select a valid backup, then switch the file selection to an invalid file. Confirm **Import profiles** becomes unavailable.
9. Before importing, note the batter and pitcher currently shown on the rolling screen. Confirm those current-play ratings remain unchanged afterward and the selectors return to manual ratings.
10. Reload the page and confirm the imported profile library persists.
11. Inspect the player-library bar and backup dialog at desktop and narrow mobile widths, including keyboard focus and Escape-to-close behavior.

## Slice 5 — Deadball welcome and persistent credits

On first entry to the Dice Companion, a modal welcome displays the supplied **Based on Akers Games** mark, credits **W. M. Akers**, links to [Akers Games](https://akersgames.com), and explains that ODDBALL supports the original tabletop game.

The user must select the honor-system statement **“I own a copy of Deadball: Baseball With Dice, Second Edition.”** before entering. The acknowledgment is versioned and remembered only in that browser. If browser storage is unavailable, the user may continue after being told the welcome will appear again next time.

After acknowledgment, **About & credits** in the Dice Companion header keeps the licensing mark, creator credit, and purchase link available without showing the ownership gate again.

### Acceptance checks

1. Open the Dice Companion in a browser that has not previously acknowledged ownership. Confirm the welcome appears before the rolling interface can be used.
2. Confirm the welcome displays the supplied **Based on Akers Games** image without alteration, credits W. M. Akers, and links to `https://akersgames.com` in a new tab.
3. Confirm **Enter Dice Companion** is disabled until the ownership checkbox is selected.
4. Try Escape before acknowledging ownership and confirm the welcome remains open.
5. Select **“I own a copy of Deadball: Baseball With Dice, Second Edition.”**, enter the companion, and reload the page. Confirm the welcome does not return.
6. Select **About & credits** in the header. Confirm the same mark, creator credit, and purchase link remain available without another checkbox requirement.
7. Close the About/Credits dialog using its close button, its **Close** action, and Escape.
8. Inspect the first-entry and About/Credits layouts at desktop and narrow mobile widths. Confirm the image remains readable and no horizontal scrolling appears.
