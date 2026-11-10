# Development workflow

## Working agreement

Development happens directly in `C:\dev\ODDBALL`. The user reviews changes locally in VS Code and owns commits, branch synchronization, merges, and pushes unless that arrangement is explicitly changed.

## Build cycle

Each build should be small enough to understand and test in one sitting.

1. **Agree on scope** — State the user-visible outcome, exclusions, and acceptance checks.
2. **Inspect the baseline** — Read the current files, source rules, and prior decisions before editing.
3. **Implement one coherent slice** — Avoid unrelated cleanup or premature systems.
4. **Run automated checks** — Add tests for rule behavior as soon as rules code exists.
5. **Preview in the browser** — Check desktop and narrow layouts plus keyboard behavior.
6. **Hand off for review** — Summarize changed files, decisions, known limitations, and exact manual checks.
7. **Correct before closing** — Keep the build open until acceptance checks pass.
8. **Record the result** — Update the changelog and relevant decision or rules documentation.

## Proposed documentation set

- `README.md` — Current state and local usage
- `docs/PROJECT-BRIEF.md` — Stable vision, decisions, and constraints
- `docs/ROADMAP.md` — Milestones and next decisions
- `docs/DEVELOPMENT-WORKFLOW.md` — Review and acceptance process
- `CHANGELOG.md` — Completed changes by build
- `docs/RULES-DECISIONS.md` — Source citations, interpretations, contradictions, and house rules
- `docs/RELEASE-CHECKLIST.md` — Review, promotion, publication, and live verification

## Definition of done for a build

- Acceptance checks pass.
- The browser console has no new errors.
- Keyboard navigation works for changed interactions.
- Responsive behavior is checked at desktop and phone widths.
- Relevant automated tests pass.
- Documentation reflects user-visible behavior and unresolved limitations.
- No unrelated files are changed.

## Source-control boundary

The local repository and GitHub remote are established. Active development occurs on `develop`; accepted public releases are promoted to `main`. The user performs commits, synchronization, merges, and GitHub Pages configuration after reviewing each build.

