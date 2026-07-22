# Handoff

```text
/make-plan Refine the Social Media login landing page based on a Dieter Rams audit (total 22/30).

Verdict paragraph:
> The landing page has strong, coherent bones and needs only small copy, responsive-contrast, and recovery-state refinements—not a redesign.

Keep (already strong, do NOT touch in this pass):
- Principle #2 (useful) scored 3 — Evidence: `front/src/app/page.tsx:16-34`. Regression check: the GitHub OAuth flow still starts with one button activation.
- Principle #5 (unobtrusive) scored 3 — Evidence: `front/src/app/page.tsx:21-60`. Regression check: no new promotional or decorative content is added.
- Principle #7 (long-lasting) scored 3 — Evidence: `front/src/app/style/globals.css:44-190`. Regression check: preserve solid colors, system typography, and simple geometry.

Fix in priority order:
1. Principle #4 — Understandable: rename `Continue with GitHub` to `Sign in with GitHub` so the control states its actual action. Evidence: `front/src/app/page.tsx:32`.
2. Principles #3/#8 — Aesthetic and thorough: preserve the exact green, but ensure the smallest responsive CTA label remains large/bold enough for its 3.95:1 contrast. Evidence: `front/src/app/style/globals.css:84-87,637-640`.
3. Principle #8 — Thorough: map known `oauth_error` codes to actionable messages instead of one generic failure. Evidence: `front/src/app/page.tsx:12-14,35-40`; `backend/app.py:261-287`.
4. Principle #6 — Honest: consider one quiet first-use disclosure if creating a local profile must be explicit. Evidence: `backend/github_oauth.py:153-184`.

Out of scope: changing the centered layout, green brand color, OAuth architecture, external profile links, or authenticated interface.

Deliverables:
- Per-fix target files, exact change, and verification step.
- Consolidated copy and responsive type changes.
- Regression checks for one-click OAuth, minimal structure, solid palette, focus, loading, disabled, error, mobile, and reduced-motion states.

Anti-patterns:
- Adding abstractions where direct changes suffice.
- Restyling areas that already scored 3.
- Expanding this refine into structural redesign.
- Mutating the established green or centered composition.
```
