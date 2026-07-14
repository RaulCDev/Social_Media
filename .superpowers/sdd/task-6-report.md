# Task 6 implementation report

## Status

**DONE**

The deployment hardening is implemented and verified. No push or pull request
was made.

## Branch and commits

- Branch: `feature/anonymous-jwt`
- Base at start: `98b693c0` (`docs: record task 5 review remediation`)
- Implementation commit: pending controller; the worktree Git metadata lives
  outside the writable root and the escalation request was denied.
- Report commit: pending controller for the same reason.

## RED evidence

The new cookie and CORS behavior tests were written before the production
changes. The isolated Compose invocation was:

```powershell
docker compose -p social-media-anon-test run --rm --no-deps `
  -e DATABASE_URL=sqlite:///:memory: `
  -e PYTHONDONTWRITEBYTECODE=1 `
  -e PYTHONPATH=/app `
  backend pytest -q tests/test_guest_auth.py tests/test_cors.py
```

Observed result before implementation: **1 failed, 15 passed**. The expected
failure was
`test_guest_cookie_uses_the_jwt_lifetime_and_security_attributes`, because the
`Set-Cookie` header did not contain `Max-Age=3600`. The allowed-origin,
unauthorized-origin, allowed preflight, and unauthorized preflight tests all
executed against Flask and passed.

## Implementation

- `backend/app.py` parses `FRONTEND_ORIGIN` as a comma-separated explicit
  allowlist, rejects `*`, and requires HTTPS entries when
  `APP_ENV=production`. Credentialed CORS is applied only to that allowlist;
  active route-level `@cross_origin` overrides were removed. The disabled
  historical GitHub source remains commented and disabled.
- The stable `access_token` cookie now uses `HttpOnly`, `SameSite=Lax`,
  configurable `Secure`, and `Max-Age` equal to `JWT_ACCESS_MINUTES * 60`.
- Demo data is no longer inserted by application startup. `flask --app app
  seed-demo` is explicit, as is the development-only `init-db` command.
- `backend/Dockerfile` defaults to a production stage running Gunicorn without
  debug or implicit seeds. Its development stage adds test dependencies and
  keeps the local Flask debugger available through Compose.
- `pytest` moved from `backend/requirements.txt` to
  `backend/requirements-dev.txt`; runtime dependencies now include Gunicorn.
- `front/Dockerfile` has development, build, and production stages. Compose
  selects development; the default final stage starts the built Next app.
- Both source components now have `.dockerignore` coverage for secrets, Git,
  dependency/build output, caches, bytecode, logs, and IDE files.
- `docker-compose.yml` no longer publishes MySQL port 3306. Backend and frontend
  still reach it through `socialnet`. Local Compose selects both development
  stages, initializes empty tables explicitly, and runs Flask debug only in
  that development command. `front` has no `env_file` and receives only
  explicit non-secret environment values.
- `.env.example` documents local defaults plus the production HTTPS-origin and
  secure-cookie settings.
- No UI source file changed.

## Completed verification

```powershell
docker compose config --quiet
docker compose config --services
```

Both exited `0`; services were exactly:

```text
db-mysql
backend
front
```

A parsed `docker compose config --format json` assertion verified all of the
following without printing secret values:

- `front` has no `env_file`;
- `front.environment` has no secret-, password-, token-, or database-like key;
- `db-mysql` has no `ports` entry;
- backend and frontend select target `development` locally.

The assertion printed `COMPOSE_SECURITY_ASSERTIONS=PASS`. Parsing
`backend/app.py` with Python's AST printed `PYTHON_AST=PASS`.
`git diff --check` exited `0`.

Frontend behavior tests were run locally:

```powershell
cd front
npm.cmd test
```

Result: **9 passed, 0 failed**.

## Controller verification completed

The controller ran the following commands after implementation:

```powershell
docker compose -p social-media-anon-test build backend front
docker compose -p social-media-anon-test run --rm --no-deps `
  -e DATABASE_URL=sqlite:///:memory: `
  -e PYTHONDONTWRITEBYTECODE=1 `
  backend pytest -q
docker build --target production -t social-media-anon-backend-prod ./backend
docker build --target production -t social-media-anon-front-prod ./front
docker compose config --quiet
docker compose config --services
```

Do not run `down -v` and do not touch any `social_media-*` container or volume.

Fresh results:

- Compose development images `backend` and `front`: built successfully.
- Complete containerized backend suite: **96 passed in 1.05s**.
- Production backend image: built successfully as
  `social-media-anon-backend-prod`.
- Production frontend image: built successfully as
  `social-media-anon-front-prod`; Next.js compiled, type-checked, and generated
  **7/7 pages**.
- `docker compose config --quiet`: exit `0`.
- `docker compose config --services`: `db-mysql`, `backend`, `front`.

Review remediation upgraded the supported production/development base lines to
Python 3.12 and Node.js 22. The focused rebuild and regression results are
recorded in the follow-up commit.

Host `npm.cmd ci` could not provide a clean-build substitute: Windows returned
`EPERM` while unlinking the Docker-created
`front/node_modules/.package-lock.json`. A following `npm.cmd run build`
produced no output for more than 45 seconds and was terminated. The Docker
production frontend build above is therefore required.

## Concerns

- Local development no longer exposes MySQL to the Windows host. The full
  Compose application remains networked internally; host database tooling must
  use an explicit, separately approved development override if later needed.
- Existing dependency advisories and unrelated upgrades were not addressed.
