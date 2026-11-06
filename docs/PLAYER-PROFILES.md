# Saved player profiles

Status: **Implemented; awaiting acceptance**  
Date: 2026-11-05

## Purpose

Saved profiles reduce repeated batter and pitcher entry in the standalone Dice Companion without requiring a lineup, team, game, account, or backend.

## Scope of this increment

- Save the current batter name, handedness, BT, OBT, and batting traits.
- Save the current pitcher name, throwing hand, role, base Pitch Die, and pitcher traits.
- Select a saved profile to load its values into the current play form.
- Use **New profile** to unlink the current selection, clear its name, and retain its ratings as a starting point for another player.
- Update the selected profile with the explicitly labeled **Update profile** action.
- Remove a selected profile after an explicit confirmation.
- Keep all data in the current browser.

Lineups, team assignment, historical identifiers, season selection, import/export, and cross-device synchronization remain outside this increment.

## Data boundary

The versioned local store keeps two record types separate:

1. **Identity:** a stable local identifier and player name.
2. **Ruleset ratings:** a separate record linked to the identity, labeled for `deadball-2e-modern`, and assigned the batter or pitcher role.

There is no team-assignment record yet. This preserves the project principle that identity, season/ruleset ratings, and league membership must remain distinct.

## Persistence behavior

- Storage key: `oddball.playerProfiles.v1`
- Schema version: `1`
- Invalid or unknown stored data falls back safely to an empty profile list.
- A player name is required to save, even though names remain optional when resolving an unsaved play.
- Batter BT and OBT must be valid before saving.
- Removing a rating record also removes its identity when no other saved rating refers to that identity.

## Acceptance checks

1. Saving a named batter creates one identity and one Deadball batter-rating record.
2. Saving a named pitcher creates one identity and one Deadball pitcher-rating record.
3. Selecting a saved profile restores all fields represented by that profile.
4. After saving, the action changes to **Update profile** so editing the selected record is explicit.
5. **New profile** clears the name and selection, after which saving creates a second record instead of overwriting the first.
6. Batter and pitcher lists remain separate and alphabetical.
7. Removing a profile requires confirmation.
8. Reloading the page retains saved profiles in that browser.
9. Resolving a play without saving a profile continues to work exactly as before.
