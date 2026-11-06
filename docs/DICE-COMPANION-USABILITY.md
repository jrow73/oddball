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
