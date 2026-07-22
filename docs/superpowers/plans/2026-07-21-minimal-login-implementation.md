# Minimal Login Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public landing page to match the approved minimal login mockup while preserving the backend-owned GitHub OAuth flow.

**Architecture:** Keep the existing client component and its OAuth state/redirect behavior, but replace the invalid nested social controls with semantic external anchors and dedicated login-page class names. Add narrowly scoped CSS for the centered full-viewport composition, interactive states, responsive sizing, and reserved error area without changing shared authenticated-page styles.

**Tech Stack:** Next.js 14, React 18, TypeScript, NextUI Button, Tabler icons, CSS, Node test runner, Docker Compose.

## Global Constraints

- Change only `front/src/app/page.tsx`, `front/src/app/style/globals.css`, and the relevant frontend source-contract tests.
- Preserve `GET /auth/github/start`, `oauth_error` handling, the loading/disabled state, and safe new-tab link attributes.
- Render only the `Social Media` title, GitHub login action, LinkedIn/GitHub links, and conditional OAuth error.
- Do not add a font dependency, fictional content, the X link, a triangle, or a short blue line.
- Keep the layout centered and usable on desktop and mobile, including visible focus and reduced-motion behavior.

---

### Task 1: Implement and verify the approved minimal login surface

**Files:**
- Modify: `front/tests/task-5-auth-flow.test.mjs`
- Modify: `front/tests/layout-behavior.test.mjs`
- Modify: `front/src/app/page.tsx`
- Modify: `front/src/app/style/globals.css`

**Interfaces:**
- Consumes: `apiUrl(path: string): string`, NextUI `Button`, and Tabler brand icon components.
- Produces: the existing default `LoginContent` React component, still redirecting through `apiUrl("/auth/github/start")`.

- [x] **Step 1: Write failing source-contract tests**

Update the OAuth assertion to require `Continue with GitHub`. Add layout assertions requiring `loginPanel`, `loginButton`, `loginLinks`, direct LinkedIn/GitHub anchors with `target="_blank"` and `rel="noopener noreferrer"`, an accessible divider, and no `IconBrandX`. Add CSS assertions for a near-black full-viewport container, bounded panel width, responsive title, blue action, reserved error slot, visible `:focus-visible`, and a mobile media query.

- [x] **Step 2: Run the tests to verify the intended failure**

Run: `npm test -- --test-name-pattern="login"`

Expected: FAIL because the old source still contains `LogIn with GitHub`, `IconBrandX`, nested anchors/buttons, and lacks the new class contracts.

- [x] **Step 3: Implement the semantic component markup**

Keep the existing state, effect, and `handleLogin`. Render one `main.bigLoginContainer`, a `section.loginPanel`, the title, a `Button.loginButton` labeled `Continue with GitHub`, a persistent `div.loginErrorSlot` containing the conditional `role="alert"` message, and a `nav.loginLinks` with direct LinkedIn/GitHub anchors plus an `aria-hidden` separator.

- [x] **Step 4: Implement the approved visual system**

Use a `#07080b` page field, `#f7f8fb` title, `#4f7df3` action, `#aeb4c0` secondary text, and `#3a3f49` divider. Center a `min(100%, 26.75rem)` stack inside `100svh`, size the title with `clamp()`, keep a 48px minimum interactive target, and implement hover, active, loading/disabled, focus-visible, mobile, and reduced-motion rules with selectors scoped to login classes.

- [x] **Step 5: Run frontend verification**

Run from `front/`: `npm test`, `npm run lint`, and `npm run build`.

Expected: all Node tests pass, ESLint reports no errors, and the Next.js production build exits 0.

- [x] **Step 6: Validate and start Docker**

Run from the repository root: `docker compose config --quiet`, followed by `docker compose up --build -d` and `docker compose ps`.

Expected: Compose validation exits 0 and the database, backend, and frontend services report running, with the frontend available at `http://localhost:3000`.

- [ ] **Step 7: Perform desktop and mobile visual checks**

Open `http://localhost:3000` at desktop and mobile widths. Confirm the title/action/link hierarchy, centered composition, real external links, error-slot stability using `/?oauth_error=1`, visible keyboard focus, responsive spacing, and absence of the X and rejected decorations.

### Task 2: Align the login action with the interface green

**Files:**
- Modify: `docs/superpowers/specs/2026-07-21-minimal-login-design.md`
- Modify: `front/tests/layout-behavior.test.mjs`
- Modify: `front/src/app/style/globals.css`

**Interfaces:**
- Consumes: the existing `.loginButton` interaction states and the established `.leftPostButton` color `rgb(1, 147, 89)`.
- Produces: a login action whose default, hover, active, focus, and shadow colors belong to the existing green interface palette.

- [x] **Step 1: Require the shared interface green in the layout contract**

Change the `.loginButton` assertion to require `background: rgb(1, 147, 89)` and add assertions for green hover, active, focus, and shadow declarations.

- [x] **Step 2: Verify the contract fails against the blue button**

Run: `npm.cmd test -- --test-name-pattern="login matches"`

Expected: FAIL because `.loginButton` still uses `#4f7df3` and blue interaction colors.

- [x] **Step 3: Apply the established green palette**

Set the default background to `rgb(1, 147, 89)`, hover to `rgb(2, 166, 100)`, active to `rgb(1, 126, 76)`, focus to `#8ee8bd`, and both shadows to green-tinted `rgba(1, 147, 89, ...)` values. Keep layout, typography, and behavior unchanged.

- [x] **Step 4: Verify the focused and complete frontend suites**

Run from `front/`: `npm.cmd test -- --test-name-pattern="login matches"`, `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build`.

Expected: the focused test and all frontend tests pass, ESLint reports no errors, and the production build exits 0.

- [x] **Step 5: Rebuild the running frontend container**

Run from the repository root: `docker compose up --build -d front` and `docker compose ps front`.

Expected: the frontend image rebuilds, the container reports running, and `http://localhost:3000` returns HTTP 200.

### Task 3: Clarify sign-in copy and OAuth recovery

**Files:**
- Modify: `docs/superpowers/specs/2026-07-21-minimal-login-design.md`
- Modify: `front/tests/task-5-auth-flow.test.mjs`
- Modify: `front/src/app/page.tsx`

**Interfaces:**
- Consumes: the backend `oauth_error` query codes produced by `backend/app.py` and `backend/github_oauth.py`.
- Produces: the unchanged default `LoginContent` component with an explicit `Sign in with GitHub` label and actionable error copy selected from the query-code value.

- [ ] **Step 1: Require explicit sign-in and error mappings**

Update the auth-flow source contract to require `Sign in with GitHub`, query parsing with `.get("oauth_error")`, mappings for `access_denied`, `invalid_request`, `invalid_state`, `verified_email_required`, `identity_conflict`, provider failures, and a generic fallback.

- [ ] **Step 2: Verify the contract fails against the boolean error state**

Run from `front/`: `npm.cmd test -- --test-name-pattern="login button"`.

Expected: FAIL because the current component says `Continue with GitHub` and checks only whether `oauth_error` exists.

- [ ] **Step 3: Implement the minimal query-code mapping**

Add a module-level `Record<string, string>` for known codes, retain a generic fallback, change state to `string | null`, store `URLSearchParams.get("oauth_error")`, and render the selected message inside the existing reserved alert area. Do not modify CSS or responsive behavior.

- [ ] **Step 4: Run frontend verification**

Run from `front/`: `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build`.

Expected: all frontend tests pass, ESLint reports no errors, and the production build exits 0.

- [ ] **Step 5: Rebuild the frontend container**

Run from the repository root: `docker compose up --build -d front`, `docker compose ps front`, and confirm `http://localhost:3000/?oauth_error=access_denied` returns HTTP 200.

Expected: the frontend container reports running and the error-state URL returns HTTP 200.
