# GitHub OAuth Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the active anonymous Guest login with required GitHub OAuth while preserving the current HttpOnly application session, authorization boundary, UI layout, demo data, and Docker workflow.

**Architecture:** Flask owns the complete OAuth Authorization Code flow, including state, PKCE, GitHub API calls, local-user association, and application JWT issuance. The browser only follows redirects and receives the existing `access_token` HttpOnly cookie; React restores the session through `/auth/me` and redirects unauthenticated users to the login page.

**Tech Stack:** Flask 3, SQLAlchemy, PyJWT, requests, GitHub OAuth, Next.js 14, React 18, TypeScript, Docker Compose, pytest, Node test runner.

## Global Constraints

- Do not restore the historical frontend token exchange, `localStorage`, browser Bearer tokens, or stored GitHub access tokens.
- Keep all write authorization based exclusively on `g.current_user`.
- Keep `front/`, `backend/`, `db-mysql`, demo users/posts, layout fixes, moderation, and rate limits.
- Keep `.env` untracked and expose GitHub credentials only to the backend.
- Execute this plan inline in the main agent; do not dispatch subagents.

---

### Task 1: GitHub identity schema

**Files:**
- Modify: `backend/SQL/models.py`
- Create: `backend/migrations/005_add_github_id.sql`
- Test: `backend/tests/test_github_oauth.py`

**Interfaces:**
- Produces: nullable unique `User.github_id: int | None` used as the stable external identity.
- Preserves: historical/demo users whose `github_id` remains null.

- [ ] **Step 1: Write the failing model test**

```python
def test_user_accepts_unique_github_identity(db_session):
    first = User(email="one@example.com", username="one", accountname="One", github_id=101)
    db_session.add(first)
    db_session.commit()
    assert User.query.filter_by(github_id=101).one().id == first.id
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `docker compose -p social-media-oauth-test run --rm --no-deps -e DATABASE_URL=sqlite:///:memory: backend pytest -q tests/test_github_oauth.py`

Expected: failure because `github_id` is not a `User` field.

- [ ] **Step 3: Add the model column and additive MySQL migration**

Add `github_id = db.Column(db.BigInteger, unique=True, nullable=True, index=True)` to `User`. Migration `005` must check `information_schema.COLUMNS` and `information_schema.STATISTICS` before adding the column and unique index so a second execution is harmless.

- [ ] **Step 4: Re-run the focused test**

Expected: PASS.

---

### Task 2: GitHub OAuth service and application JWT

**Files:**
- Create: `backend/github_oauth.py`
- Modify: `backend/auth.py`
- Modify: `backend/app.py`
- Modify: `backend/requirements.txt`
- Modify: `backend/tests/conftest.py`
- Test: `backend/tests/test_github_oauth.py`
- Test: `backend/tests/test_guest_auth.py`

**Interfaces:**
- Produces: `build_authorization_request() -> tuple[str, str, str]` containing authorization URL, state, and PKCE verifier.
- Produces: `exchange_code(code: str, verifier: str) -> str`, returning the temporary GitHub token.
- Produces: `fetch_github_identity(token: str) -> GitHubIdentity` with `github_id`, `login`, `name`, `avatar_url`, and verified email.
- Produces: `upsert_github_user(identity: GitHubIdentity) -> User`.
- Produces: `issue_user_session(user: User) -> str` with `auth_provider=github`.
- Removes: active `POST /auth/guest`.

- [ ] **Step 1: Write failing OAuth start tests**

Cover missing configuration (`503`), redirect to `https://github.com/login/oauth/authorize`, `client_id`, `redirect_uri`, `scope=user:email`, random `state`, S256 challenge, and two short-lived HttpOnly cookies.

- [ ] **Step 2: Write failing callback tests**

Mock `requests.post` and `requests.get`; cover state mismatch, access denied, missing code, GitHub HTTP failure, absent verified email, new user, existing `github_id`, safe verified-email association, username collision, discarded GitHub token, application cookie, temporary-cookie deletion, and redirect to `/home`.

- [ ] **Step 3: Run the OAuth tests and confirm endpoint-not-found failures**

Run: `docker compose -p social-media-oauth-test run --rm --no-deps -e DATABASE_URL=sqlite:///:memory: backend pytest -q tests/test_github_oauth.py`

Expected: failures for missing routes and helpers.

- [ ] **Step 4: Implement the OAuth service**

Use `secrets.token_urlsafe`, SHA-256/base64url PKCE, constant-time state comparison, `requests` timeouts, JSON validation, and the `/user` plus `/user/emails` endpoints. Select the primary verified email first, then any verified email. Never log or persist the OAuth token.

- [ ] **Step 5: Generalize JWT issuance and validation**

Replace `issue_guest_session()` with `issue_user_session(user)`. Require claims `sub`, `jti`, `auth_provider`, `iat`, and `exp`; require `auth_provider == "github"`, `user.github_id is not None`, `user.is_guest is False`, active status, and non-revoked `jti`. Remove active Bearer fallback so the cookie is the only browser boundary.

- [ ] **Step 6: Implement Flask routes**

Add `GET /auth/github/start` and `GET /auth/github/callback`; keep `/auth/me` and `/auth/logout`; remove `/auth/guest`. Clear OAuth temporary cookies on every callback outcome and redirect failures to `/?oauth_error=<stable-code>` without sensitive detail.

- [ ] **Step 7: Run authentication and authorization suites**

Run: `docker compose -p social-media-oauth-test run --rm --no-deps -e DATABASE_URL=sqlite:///:memory: backend pytest -q`

Expected: all tests pass after replacing Guest-oriented test setup with a helper that creates a GitHub user and signs the same application cookie.

---

### Task 3: Required GitHub login in the frontend

**Files:**
- Modify: `front/src/lib/api-client.ts`
- Replace: `front/src/lib/session-flow.mjs`
- Modify: `front/src/components/AuthProvider.tsx`
- Modify: `front/src/app/page.tsx`
- Modify: `front/src/app/home/page.tsx`
- Replace: `front/src/app/github_login/page.tsx`
- Modify: `front/tests/task-5-auth-flow.test.mjs`

**Interfaces:**
- Produces: `apiUrl(path: string): string` for backend navigation.
- `AuthProvider` exposes `{user, loading, logout}` and restores only `/auth/me`.
- `useSessionMutation()` performs the requested write once; a `401` clears the session and is propagated.

- [ ] **Step 1: Replace Guest contract assertions with failing GitHub assertions**

Assert `LogIn with GitHub`, an active GitHub icon, navigation to `/auth/github/start`, no `/auth/guest`, no `startGuestSession`, no `localStorage`, and no browser OAuth callback exchange.

- [ ] **Step 2: Run frontend tests and confirm they fail against Guest code**

Run: `npm test` from `front/`.

Expected: Guest-flow assertions fail.

- [ ] **Step 3: Simplify session state**

Keep one `/auth/me` restoration. Remove Guest creation/renewal and retry behavior. Preserve cookie-based `apiFetch`; on `401`, emit the existing expiration event and let protected UI redirect.

- [ ] **Step 4: Restore the requested login button**

Keep the current centered layout and social icons. The button content becomes `LogIn with GitHub` plus `IconBrandGithub`; clicking calls `window.location.assign(apiUrl("/auth/github/start"))` and disables the button immediately.

- [ ] **Step 5: Protect `/home` and neutralize the historical callback page**

While restoration is loading, render the existing dark background without feed content. If restoration finishes without a user, call `router.replace("/")`. Make `/github_login` redirect to `/` because Flask now owns the callback.

- [ ] **Step 6: Run frontend tests and build**

Run: `npm test` and `npm run build` from `front/`.

Expected: all tests and the production build pass.

---

### Task 4: Reproducible Docker configuration

**Files:**
- Modify: `.env.example`
- Modify: `docker-compose.yml`
- Test: Compose configuration and service startup.

**Interfaces:**
- Backend consumes `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL`.
- Frontend consumes only `NEXT_PUBLIC_API_URL` when explicitly configured; it never receives the GitHub secret.

- [ ] **Step 1: Document OAuth variables**

Add placeholders and the local callback `http://localhost:5000/auth/github/callback` to `.env.example`.

- [ ] **Step 2: Pass OAuth configuration only to Flask**

Remove the disabled historical block and add active backend environment mappings. Preserve MySQL health waiting and idempotent `seed-demo` startup.

- [ ] **Step 3: Validate Compose**

Run: `docker compose config --quiet`.

Expected: exit code `0` without exposing secret values in tracked files.

- [ ] **Step 4: Rebuild and inspect services**

Run: `docker compose up -d --build` followed by `docker compose ps` and `docker compose logs --tail 50 backend front`.

Expected: MySQL healthy, frontend on `3000`, backend on `5000`, and a clear `503` from OAuth start until real GitHub credentials replace the placeholders.

---

### Task 5: Final verification and focused documentation update

**Files:**
- Modify: `docs/superpowers/specs/2026-07-16-github-oauth-local-documentation-design.md` only if implementation details require correction.
- Later plan: root README and visual documentation remain a separate deliverable after real OAuth login is manually verified.

**Interfaces:**
- Produces: a tested GitHub-only authentication baseline ready for documentation screenshots.

- [ ] **Step 1: Search for forbidden active Guest flow**

Run: `rg -n "auth/guest|startGuestSession|LogIn \(No credentials\)" backend front/src docker-compose.yml`.

Expected: no active matches; historical documentation may mention the removed design only as project history.

- [ ] **Step 2: Run complete automated verification**

Run backend pytest, frontend tests/build, and `docker compose config --quiet`.

Expected: every command exits `0`.

- [ ] **Step 3: Inspect Git scope**

Run: `git status --short` and `git diff --check`.

Expected: only OAuth, configuration, migration, tests, and this plan are changed; `.env`, caches, and generated artifacts are absent.

