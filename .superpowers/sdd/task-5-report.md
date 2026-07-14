# Task 5 implementation report

## Status

**DONE_WITH_CONCERNS**

The active Next.js flow now uses anonymous cookie sessions through one API
client and one auth provider. Public reads do not create sessions. Existing
post, comment, like, and unlike actions acquire a guest session on demand.
No visible logout, form, panel, extra text, or extra button was added.

## Base and branch

- Base: `c26eaad066aac307c91196cacdca77d55536c9c6`
- Branch: `feature/anonymous-jwt`
- Implementation: `1662bcd5` (`feat(frontend): use anonymous cookie sessions`)
- Review remediation: `c24b9c1f` (`fix(frontend): verify anonymous session races`)
- The implementation and this report are committed separately.

## RED evidence

The repository had no frontend test runner. Before production changes,
`front/tests/task-5-auth-flow.test.mjs` and a minimal `npm test` script were
added with Node's built-in runner and no dependency upgrade.

```powershell
cd front
npm.cmd test
```

Initial result: **0 passed, 5 failed**. Expected failures covered the missing
API client/provider, old login/callback, active browser token storage, and the
missing exact historical heading.

The first production build exposed `useState(null)` rejecting the typed numeric
profile count. A sixth regression was observed RED (**5 passed, 1 failed**)
before the state became `number | null`.

Independent review then found that the historical GitHub source had been
rewritten and that the restoration/guest and stale-cookie regressions only
searched source text instead of executing behavior. Before the review fix, the
replacement tests were observed RED with **5 passed, 4 failed**: the historical
test failed on its missing `catch`, while the three behavioral tests failed
because the testable session-flow functions did not exist yet.

## GREEN and build evidence

Fresh final tests:

```text
> npm.cmd test
tests 9
pass 9
fail 0
duration_ms 64.9741
```

Clean install:

```text
> npm.cmd ci --cache C:\tmp\npm-cache-task5
added 581 packages, and audited 582 packages in 1m
```

The sandbox consistently returned `EPERM` unlinking
`front/node_modules/.package-lock.json`. The file was not read-only and its ACL
allowed modification; no unidentified Node process was stopped. The same
command completed with approved execution outside the sandbox.

Fresh final production build, also outside the sandbox after the sandboxed
process stalled after the Next.js banner:

```text
> npm.cmd run build
Compiled successfully
Linting and checking validity of types ...
Generating static pages (7/7)
Exit code: 0
Wall time: 29.1 seconds
```

`git diff --check` exited `0` before commit.

## Files and decisions

- `front/src/lib/api-client.ts`: JSON headers, `credentials: "include"`, typed
  failures, and one shared session-expired event for 401.
- `front/src/lib/session-flow.mjs`: pure runtime session coordinator shared by
  `AuthProvider` and Node tests. Controlled promises prove restoration and guest
  creation are ordered and deduplicated, concurrent calls create one guest, and
  an expired cookie causes exactly one renewal and one retry without a loop.
- `front/src/components/AuthProvider.tsx`, `front/src/app/layout.tsx`: restore
  `/auth/me` without redirecting readers; expose `user`, `loading`,
  `startGuestSession()` and `logout()`; serialize restoration and deduplicate
  guest creation. The internal mutation hook retries once after a 401 with a
  fresh guest, and does not retry other failures.
- `front/src/app/page.tsx`: preserves existing containers, classes, social
  links, and the one login button. Only button text/loading state changed. It
  reads `LogIn (No credentials)`, forces `POST /auth/guest`, then routes home.
- Home, feed, profile, post-preview, and sidebar components use `apiFetch`.
  Public reads never call `startGuestSession`; existing mutations do so only
  through the session mutation hook.
- `front/src/app/components/Token_button.tsx`: renders nothing and never reads
  or prints browser storage.
- `front/src/app/github_login/page.tsx`: renders nothing. The complete source
  from `c26eaad0` is preserved byte-for-byte inside the comment under exact
  heading `HISTORICAL GITHUB LOGIN (DISABLED)`, with no active OAuth imports,
  route logic, variables, or client ID.
- `front/tests/task-5-auth-flow.test.mjs`: nine reproducible checks using only
  Node's standard runner; session race and retry coverage imports and executes
  the same pure module used by `AuthProvider` rather than duplicating its logic
  or searching implementation names.

## Search review

```powershell
rg -n -S "localStorage|access_token|Authorization|Bearer|/login|/github_callback|client_id|Github|GitHub|GITHUB" front/src
rg -n -S "fetch\(" front/src --glob '*.ts' --glob '*.tsx'
```

- `localStorage`, `access_token`, and `/github_callback` occur only in the
  disabled historical block.
- `Authorization`, `Bearer`, `/login`, `client_id`, and active `GITHUB`
  configuration have no active source matches.
- Active `Github` matches are presentation-only existing portfolio icons and
  avatar URLs, not login routes/imports/variables.
- The only active native `fetch()` is inside `api-client.ts`; the other textual
  match is the disabled callback.
- A direct comparison of the disabled block with
  `git show c26eaad0:front/src/app/github_login/page.tsx` reported
  `HISTORICAL_EXACT_MATCH=true`.

## Concerns

- `npm ci` reports 22 advisories (8 moderate, 13 high, 1 critical) in the
  existing dependency graph. No audit fix or unrelated upgrade was performed.
- The build retains pre-existing warnings: hook dependencies in
  `useScreenHeight.tsx` and `PostCards.tsx`, two `<img>` warnings in `Icons.tsx`,
  and outdated `caniuse-lite`. They are outside this focused migration.
- API wiring and UI constraints still use source-contract checks because the
  repo had no frontend test framework. Session races and retry limits are now
  executable behavioral tests. No browser E2E run against a live Flask service
  is claimed.
