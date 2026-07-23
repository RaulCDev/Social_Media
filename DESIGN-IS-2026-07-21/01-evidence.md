# Evidence

## Structural

- Three interactive elements: one OAuth button and two external links (`front/src/app/page.tsx:27-59`).
- Maximum authored JSX depth is five from `main` to icon/text (`front/src/app/page.tsx:22-60`).
- No unused imports or props were found (`front/src/app/page.tsx:3-19`).

## Visual

- The screenshot shows a centered title, one green CTA, and one subdued link row on a near-black field.
- Desktop type scale is approximately 72/24/18px (`front/src/app/style/globals.css:63-72,74-92,142-164`).
- The green button with white text measures about 3.95:1 contrast; it passes for the 24px desktop label but needs care when the responsive label reaches 18px (`front/src/app/style/globals.css:84-87`).
- Loading, error, focus, disabled, mobile, and reduced-motion treatments are present (`front/src/app/page.tsx:9-40`; `front/src/app/style/globals.css:94-140,174-178,624-662`).

## Copy and honesty

- Visible strings are `Social Media`, `Continue with GitHub`, `LinkedIn`, and `GitHub`; an OAuth error appears conditionally (`front/src/app/page.tsx:24-59`).
- `Continue with GitHub` starts sign-in and can create a first-use local profile, so `Sign in with GitHub` names the action more directly (`front/src/app/page.tsx:16-34`; `backend/github_oauth.py:153-184`).
- No inflated claims or dark-pattern copy are present (`front/src/app/page.tsx:21-62`).
- Distinct OAuth failures currently collapse to one generic message (`front/src/app/page.tsx:12-14,35-40`; `backend/app.py:261-287`).

## Weight and friction

- The last production build reported 146kB first-load JavaScript for `/`; this is below 500kB but above the audit's 100kB top threshold.
- There are no idle animations, video, raster hero assets, initial modals, badges, or notifications (`front/src/app/page.tsx:21-63`; `front/src/app/style/globals.css:657-662`).
- Live network-request count and time-to-interactive were not measured because no browser backend was available.

## Accessibility

- Inferred focus order is login button, LinkedIn, GitHub (`front/src/app/page.tsx:27-59`). All are native keyboard-reachable elements.
- Landmarks include `main` and labelled `nav`; the content section is tied to its heading (`front/src/app/page.tsx:22-23,42`).
- Focus-visible rules exist for primary and secondary actions (`front/src/app/style/globals.css:106-110,174-178`).
- No skip link exists; for this three-control landing surface that is not a material blocker.
- Runtime focus order and generated NextUI markup were not browser-tested.
