# Design audit scope

- Audited surface: unauthenticated landing/login page shown in the user's screenshot and implemented by `front/src/app/page.tsx` with login styles in `front/src/app/style/globals.css`.
- Primary user: an unauthenticated visitor entering the local social-media application.
- Primary task: start the existing GitHub OAuth flow.
- Constraints: preserve the Next.js 14/React 18 frontend, backend-owned OAuth behavior, dark interface, established green `rgb(1, 147, 89)`, minimal content, responsive layout, and accessible interaction states.
- Reference: the authenticated interface screenshot supplied by the user, especially its black field, white typography, muted secondary controls, and green primary actions.
- Audit boundary: the visible login surface only; the authenticated feed and OAuth provider pages are context, not scored surfaces.
