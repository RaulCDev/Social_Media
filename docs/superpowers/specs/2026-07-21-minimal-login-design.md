# Minimal Login Page Design

## Objective

Refresh the existing login page so it feels deliberate and polished while
remaining visually minimal. The page continues to serve one primary purpose:
starting the existing GitHub OAuth login flow.

## Scope

The change is limited to the Next.js login page and its presentation styles.
It does not alter the Flask API, OAuth flow, session handling, application
routes, or the authenticated interface.

The page contains only these existing product elements:

- the `Social Media` title;
- the GitHub authentication action;
- personal LinkedIn and GitHub links;
- the existing OAuth failure message when an error is present.

The unused X link is removed. The rejected three-node triangle and short blue
line are not included. No posts, profiles, cards, slogans, technology labels,
author biography, or other fictional content is introduced.

## Visual Design

The page uses a full-viewport near-black background and a single centered
content column. Generous negative space supplies most of the visual character.

The hierarchy is:

1. `Social Media` as a large, high-contrast heading.
2. `Sign in with GitHub` as the dominant action.
3. LinkedIn and GitHub as smaller, muted external links separated by a quiet
   vertical divider.
4. The OAuth error message directly below the login action when needed.

The primary button uses the interface's established green (`rgb(1, 147, 89)`)
with white text and the GitHub icon. Its hover, active, loading, disabled, and
keyboard-focus states remain clearly distinguishable within the same green
family. External links brighten on hover and expose a visible keyboard-focus
state without competing with the login action.

Typography remains system-based so the change does not add a font dependency.
Spacing, weight, line height, border radius, and muted colors provide the
refinement shown in the approved mockup.

## Responsive Behaviour

The content remains centered on desktop and mobile. The column has a bounded
width with horizontal padding so the button never touches the viewport edges.
The title scales down with `clamp()`. Personal links may remain on one row on
normal mobile widths; spacing compresses without reducing the interactive
target size below a usable level.

## Component and Interaction Behaviour

The existing login component remains responsible for:

- detecting `oauth_error` in the query string;
- disabling the login action while navigation starts;
- redirecting to the backend-owned `/auth/github/start` endpoint;
- opening personal LinkedIn and GitHub destinations in a new tab with safe
  `rel` attributes.

The external links are direct anchors rather than anchors nested inside
buttons. Decorative icons are hidden from assistive technology when their text
already supplies the accessible name.

## Error Handling

The OAuth error condition is preserved. Its message appears in a reserved area
beneath the primary action so showing the error does not cause a large layout
shift. Known cancellation, expired-request, verified-email, identity-conflict,
and provider failures receive specific actionable copy; unknown codes use a
safe generic fallback. The error uses semantic `role="alert"` and sufficient
color contrast against the dark background.

## Verification

Implementation is complete when:

- the frontend source-contract tests confirm the GitHub OAuth label, icon, and
  backend start route are preserved;
- layout tests confirm the title and real LinkedIn/GitHub links remain while
  the X icon is absent;
- lint and the production frontend build succeed;
- a desktop and mobile visual check confirms the approved hierarchy, centered
  layout, focus visibility, and absence of the removed decorations.
