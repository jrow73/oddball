# Dice Companion release checklist

Use this checklist when promoting an accepted Dice Companion build from `develop` to the public GitHub Pages site. Publishing remains a deliberate user-controlled step.

## 1. Review on `develop`

- Confirm the working tree contains only the intended release changes.
- Run `npm run check` and confirm every project check and automated test passes.
- Open `index.html` through Live Server and confirm the public homepage accurately describes the current Dice Companion.
- Follow the homepage **Open Dice Companion** link and complete the focused checks below.
- Review the layout at desktop, tablet, and narrow mobile widths with no unexpected horizontal scrolling.

## 2. Focused Dice Companion checks

- Confirm the first-entry ownership welcome, supplied Akers Games mark, W. M. Akers credit, and purchase link appear in a browser that has not acknowledged ownership.
- Confirm the remembered acknowledgment and persistent **About & credits** access.
- Resolve one automatic and one manual plate appearance.
- Resolve a stolen-base attempt, bunt, and Hit & Run attempt.
- Trigger a DEF checkpoint and confirm the fielder, current MSS, DEF roll, and defender trait remain clear.
- Create or edit a player profile, then export a player-library backup.
- Cancel and then approve **Delete all players**; confirm the warning protects the library and the approved deletion leaves current-play ratings unchanged.
- Confirm the result explanation, correction, override, and suggested-context controls remain usable.

## 3. Promote the accepted build

- Commit and sync the accepted work on `develop`.
- Merge `develop` into `main` without creating a second local project folder.
- Sync `main` to GitHub and confirm the repository files match the accepted local build.
- Keep `develop` for subsequent work after the release is verified.

## 4. Publish with GitHub Pages

- Enable GitHub Pages for the repository using the `main` branch and repository root.
- Wait for GitHub to report a successful deployment and provide the public URL.
- Do not add a backend, account service, or additional deployment platform for this release.

## 5. Verify the live site

- Open the published root URL and confirm the ODDBALL homepage loads without missing assets.
- Open the Dice Companion and confirm its stylesheet, JavaScript modules, and Akers Games image load correctly.
- Repeat one automatic roll, one manual roll, and one DEF checkpoint on the published site.
- Confirm browser-local acknowledgment and player profiles remain available after reloading.
- Test the live site at desktop and narrow mobile widths.
- Share the public URL only after these checks pass.

If a live-only problem appears, correct it on `develop`, repeat the checks, and promote the correction through `main` rather than editing separate copies of the site.
