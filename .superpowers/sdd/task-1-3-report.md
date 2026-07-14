# Tasks 1-3 implementation report

## Status

**DONE_WITH_CONCERNS**

The anonymous identity, cookie JWT session, revocation, configuration, migration,
and focused backend tests are implemented. The frontend was intentionally not
changed in this wave, so UI integration remains for a later wave.

## Base and head

- Base commit: `817c9a26f54a29131539b083f739b38ea8030e09`
- Base subject: `fix(front): repair production build baseline`
- Head branch: `feature/anonymous-jwt`
- Final head: the local task commit containing this report (no push performed)

## Files

- Created `.env.example` with placeholders and non-secret auth defaults.
- Created `backend/auth.py` with `issue_guest_session()`,
  `decode_jwt_from_request()`, and `require_jwt`.
- Modified `backend/app.py` with `/auth/guest`, `/auth/me`, `/auth/logout`,
  credentialed CORS, cookie handling, and revocation. Existing application
  endpoints remain unchanged until the separately scoped authorization wave.
- Modified `backend/SQL/models.py` with guest fields and `RevokedToken`.
- Created `backend/migrations/001_add_guest_fields.sql`.
- Created `backend/seed_guest_policy.py`.
- Modified `backend/requirements.txt`: active PyJWT and pytest; conflicting
  `jwt`, PyGithub, and GitHub-only requests retained only as visually separated
  historical disabled references.
- Modified `docker-compose.yml` with JWT duration, frontend origin, and secure
  cookie configuration; GitHub variables are historical disabled comments.
  The frontend no longer imports the repository `.env` and receives only its
  explicitly listed public runtime variables.
- Added `backend/tests/conftest.py`, `test_auth_contract.py`,
  `test_guest_user.py`, and `test_guest_auth.py`.
- No frontend file was changed.

## RED evidence

Tests were run before production implementation in the exclusive Compose
project `social-media-anon-test`, with `--no-deps` and SQLite in memory. The
temporary PyGithub install was only used in that initial container so the
untouched historical import would not prevent test collection; it is not an
active final dependency.

```powershell
docker compose -p social-media-anon-test run --rm --no-deps `
  -e DATABASE_URL=sqlite:///:memory: `
  -e JWT_SECRET_KEY=[test-only-value] `
  -e JWT_ALGORITHM=HS256 `
  -e JWT_ACCESS_MINUTES=60 `
  -e FRONTEND_ORIGIN=http://localhost:3000 `
  -e COOKIE_SECURE=false `
  backend sh -c "python -m pip install PyGithub==2.2.0 --quiet && python -m pytest tests/test_auth_contract.py tests/test_guest_user.py tests/test_guest_auth.py -q"
```

Observed result: **13 failed**. Expected missing-feature failures included:

- `POST /auth/guest`: expected `201`, received `404`.
- `GET /auth/me`: expected `401` or `200` by scenario, received `404`.
- `ModuleNotFoundError: No module named 'seed_guest_policy'`.
- `AttributeError: 'User' object has no attribute 'is_guest'`.
- `ImportError: cannot import name 'RevokedToken' from 'SQL.models'`.

## GREEN evidence

The final image was rebuilt from the final requirements, without active GitHub
login dependencies. The focused verification used the same exclusive Compose
project, `--no-deps`, SQLite in memory, and disabled bytecode writes:

```powershell
docker compose -p social-media-anon-test run --rm --no-deps `
  -e PYTHONDONTWRITEBYTECODE=1 `
  -e DATABASE_URL=sqlite:///:memory: `
  -e JWT_SECRET_KEY=[test-only-value] `
  -e JWT_ALGORITHM=HS256 `
  -e JWT_ACCESS_MINUTES=60 `
  -e FRONTEND_ORIGIN=http://localhost:3000 `
  -e COOKIE_SECURE=false `
  backend python -m pytest tests/test_auth_contract.py tests/test_guest_user.py tests/test_guest_auth.py -q
```

Final output:

```text
.............                                                            [100%]
13 passed in 0.19s
```

## Review fixes after the initial Tasks 1-3 commit

### Guest identity boundary (RED -> GREEN)

The review found that a correctly signed token could claim `is_guest=True` for
an existing historical non-guest user. A focused regression test was added
before changing production code:

```powershell
docker compose -p social-media-anon-test run --rm --no-deps `
  -e PYTHONDONTWRITEBYTECODE=1 `
  -e DATABASE_URL=sqlite:///:memory: `
  -e JWT_SECRET_KEY=[test-only-value] `
  -e JWT_ALGORITHM=HS256 `
  -e JWT_ACCESS_MINUTES=60 `
  -e FRONTEND_ORIGIN=http://localhost:3000 `
  -e COOKIE_SECURE=false `
  backend python -m pytest tests/test_guest_auth.py::test_auth_me_rejects_non_guest_user_with_guest_claim -q
```

- RED: expected `401`, received `200` (`1 failed in 0.13s`).
- GREEN after validating `user.is_guest is True`: `1 passed in 0.09s`.
- The authenticated `User` row is now loaded once, validated against the claim,
  and reused by `require_jwt` through request-local `flask.g` state.

The complete focused suite then produced:

```text
..............                                                           [100%]
14 passed in 0.20s
```

### Compose secret boundary

The `front` service no longer has `env_file: .env`. Fresh rendered-config
verification reported only these frontend environment key names:

```text
CHOKIDAR_USEPOLLING,NODE_ENV,WATCHPACK_POLLING
```

The rendered frontend configuration contained zero keys named
`JWT_SECRET_KEY`, `FLASK_SECRET_KEY`, `DATABASE_URL`, or matching `MYSQL_*`.
No secret values were printed during this verification.

Additional verification:

- `docker compose -p social-media-anon-test config --quiet`: exit `0`.
- The MySQL 8 migration ran twice against a standalone temporary container
  named `social-media-anon-migration-test`, with no mounted volume and test-only
  credentials.
- After both runs: the historical fixture counts remained user `1`, post `1`,
  like `1`; both guest columns existed; the unique public-name index existed;
  the revocation table existed; and the historical user had `is_guest=0` and
  `guest_public_name IS NULL`.
- The temporary MySQL container was stopped and auto-removed. No historical
  database was contacted or migrated.
- A scope guard confirmed that Tasks 1-3 add exactly two `@require_jwt` route
  decorators (`/auth/me` and `/auth/logout`); partial Task 4 endpoint changes
  found during final review were removed before this commit.
- `git diff --check` produced no whitespace errors.
- All seven tracked `.pyc` files, including the two touched by the first Docker
  run, match the base, index, and working tree exactly and remain outside the
  task diff.

## Decisions

- The cookie named `access_token` is primary, `HttpOnly`, `SameSite=Lax`, and
  has configurable `Secure`; bearer authentication remains transition-only.
- JWTs contain `sub` as the numeric user ID encoded as a string, `jti`,
  `is_guest`, `iat`, and `exp`; JSON responses and active logs never contain the
  token.
- Validation requires the configured algorithm and all required claims, checks
  expiration, numeric subject, guest identity, existing user, and revocation.
- Guest email addresses use a unique `@anonymous.invalid` technical value and
  are never exposed by the new public identity responses.
- Existing GitHub code, variables, and dependency references were preserved as
  disabled historical comments rather than deleted.
- The SQL migration uses `information_schema` guards plus `CREATE TABLE IF NOT
  EXISTS`, so it can run repeatedly without deleting or rewriting existing
  user, post, or like data.

## Risks and follow-up concerns

- The frontend still contains the historical login flow and was deliberately
  out of scope. A later UI wave must call `/auth/guest` with credentials and use
  the cookie session.
- Applying `require_jwt` and `g.current_user` to existing write operations is
  Task 4 and still requires its dedicated validation and authorization tests.
- The legacy `User.access_token` column and disabled GitHub source remain for
  history/non-destructive compatibility; removal requires a separate migration.
- Revoked JWT rows need an eventual cleanup policy after their corresponding
  expiration time if the table grows materially.
- The isolated Compose project may leave its test-only named network/volume
  metadata because `down -v` was explicitly prohibited; no historical or
  `social_media-*` container was touched.
- Minor follow-up: decide whether `pytest` should move out of production runtime
  requirements into a dedicated development/test dependency file.
- Minor follow-up: add an explicit negative CORS test for disallowed origins.
