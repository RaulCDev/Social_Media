# Task 4 implementation report

## Status

**DONE_WITH_CONCERNS**

All existing write operations are protected by the shared JWT boundary, use
`g.current_user` as their only identity source, validate mutation input, and
pass the complete backend test suite. No frontend, container, or historical
database state was changed.

## Base and head

- Base: `8ddcbe123415b48943fa81f729314fe6628ff7a1`
- Branch: `feature/anonymous-jwt`
- Reviewed implementation head: `1e8057d7` (`feat(backend): authorize existing mutations`)
- Review remediation head: `a5674c29` (`fix(backend): harden task 4 mutation guarantees`)
- This report is committed separately after the implementation commit.

## RED evidence

The authorization tests were created before production code was changed and
run with the exclusive Compose project, `--no-deps`, SQLite in memory, and
disabled bytecode writes:

```powershell
docker compose -p social-media-anon-test run --rm --no-deps `
  -e PYTHONDONTWRITEBYTECODE=1 `
  -e DATABASE_URL=sqlite:///:memory: `
  -e JWT_SECRET_KEY=test-only-secret-key-that-is-long-enough-for-hs256 `
  -e JWT_ALGORITHM=HS256 `
  -e JWT_ACCESS_MINUTES=60 `
  -e FRONTEND_ORIGIN=http://localhost:3000 `
  -e COOKIE_SECURE=false `
  backend python -m pytest tests/test_authorization.py -q
```

Observed result: **44 failed**. Expected failures included:

- `/comment`, `/like`, and `/unlike` returned `404`, `400`, or raised an
  exception before consistently enforcing authentication.
- Cookie-authenticated guest users could not use the legacy mutation routes,
  because those routes duplicated obsolete bearer/email or access-token logic.
- Missing and non-object JSON caused `415` responses or internal exceptions.
- Content and post-ID validation was absent or inconsistent.
- `/cards` returned `401` without a token.
- Duplicate-like uniqueness and rate-limit configuration were absent.

Two added boundary groups were also observed RED before production changes:
positive-integer post IDs and the exact 280-character boundary produced
**22 failed** focused cases.

## GREEN evidence

Focused Task 4 result:

```text
..................................................................       [100%]
66 passed in 0.71s
```

Fresh complete backend verification after self-review:

```powershell
docker compose -p social-media-anon-test run --rm --no-deps `
  -e PYTHONDONTWRITEBYTECODE=1 `
  -e DATABASE_URL=sqlite:///:memory: `
  -e JWT_SECRET_KEY=test-only-secret-key-that-is-long-enough-for-hs256 `
  -e JWT_ALGORITHM=HS256 `
  -e JWT_ACCESS_MINUTES=60 `
  -e FRONTEND_ORIGIN=http://localhost:3000 `
  -e COOKIE_SECURE=false `
  backend python -m pytest tests -q
```

Final output:

```text
........................................................................ [ 90%]
........                                                                 [100%]
80 passed in 0.76s
```

This is the 14-test previous suite plus 66 Task 4 cases. `git diff --check`
also exited `0`.

## Files and decisions

- `backend/app.py`
  - Removed duplicate JWT parsing and the legacy access-token identity helper.
  - Protected `/post`, `/comment`, `/like`, and `/unlike` with `@require_jwt`.
  - Uses only `g.current_user.id` for mutation ownership; body `user_id`,
    `email`, and `access_token` fields cannot select another identity.
  - Added consistent object-JSON, content, post-ID, and post-existence checks.
  - Configured conservative database-backed limits: 5 posts/60 seconds and
    20 comments/60 seconds per authenticated user. Tests prove identity
    separation, configurability, and window expiry.
  - Kept `/cards`, `/postCards`, `/postData`, `/trends`,
    `/users_recomendation`, and `/profileData` public. Public card responses use
    `isLiked: false` because no requester identity is required.
  - Duplicate likes and idempotent unlikes return stable `200` messages without
    exception details.
- `backend/SQL/models.py`
  - Added named unique constraint `uq_like_user_post(user_id, post_id)`.
- `backend/migrations/002_unique_like_user_post.sql`
  - Added a MySQL 8 additive/idempotent index migration guarded through
    `information_schema`; it was verified only against a disposable MySQL 8
    container with no volume, never against historical project data.
- `backend/tests/test_authorization.py`
  - Added 66 cases covering authentication, identity spoofing, input bounds,
    post existence, two-user isolation, like uniqueness, unlike ownership and
    idempotence, public reads, and per-identity/window rate limits.

## Ownership surface

There are no existing post/comment edit or delete endpoints in this recovered
backend, so there is no additional ownership surface to test and no new route
was invented. The existing deletion operation is `/unlike`; tests prove it
only targets `g.current_user` and cannot remove another user's like even when
spoofed identity fields are supplied.

## Concerns

- The unique-index migration deliberately does not delete or rewrite historical
  rows. If a historical database already contains duplicate `(user_id,
  post_id)` pairs, the verified behavior is a safe migration failure with both
  duplicate rows unchanged and no partial unique index. Those rows require an
  explicitly approved cleanup before the index can be created. Historical data
  was not inspected or changed.
- Rate limiting intentionally implements only Task 4's conservative
  identity/window layer. Task 7's `jti` plus IP layers and moderation were not
  implemented.
- Deployments must apply `003_create_rate_limit_bucket.sql` before running this
  application version. Buckets are retained after their windows expire; a
  bounded retention job belongs with later operational work, not this focused
  Task 4 remediation.
- Public reads cannot report requester-specific `isLiked` state without an
  optional identity contract; they return `false` until that later contract is
  explicitly designed.

## Important review remediation evidence

The two Important findings were reproduced before their production fixes:

- An actual SQLite trigger raised an unrelated `IntegrityError` during
  `/like`. RED returned `200` instead of the required safe non-success response:
  `1 failed` with `assert 200 == 500`.
- The concurrent reservation test was added before the rate-limit bucket API
  and model. RED failed collection with `ImportError: cannot import name
  '_reserve_rate_limit_slot' from 'app'`.

GREEN behavior now is:

- `/like` rolls back every integrity failure, returns idempotent `200` only
  when the exact `(user_id, post_id)` row exists after rollback, and otherwise
  returns `500 {"message": "Unable to save like"}` without exception text.
- Post/comment rate limits reserve a persistent fixed-window bucket keyed by
  authenticated `user_id`, action, and window. A unique insert creates the
  first reservation; competing sessions use one conditional atomic
  `UPDATE ... WHERE request_count < limit`. The existing per-action limit and
  window environment configuration remains authoritative. A 12-session
  file-backed SQLite concurrency test with limit 3 observed exactly three
  successful reservations, a stored count of three, and a fresh bucket in the
  next window.
- Invalid and expired JWTs are covered against all four write routes and return
  the same generic `401` response.

Focused authorization verification:

```text
........................................................................ [ 94%]
....                                                                     [100%]
76 passed in 0.84s
```

Fresh complete backend verification:

```text
........................................................................ [ 80%]
..................                                                       [100%]
90 passed in 1.06s
```

The reproducible PowerShell check
`backend/migrations/check_002_unique_like_user_post.ps1` starts a uniquely
named `mysql:8.0` container with `--rm`, no mounts and no volumes. It observed:

```text
PASS: migration 002 is idempotent on clean data, enforces uniqueness, and leaves historical duplicates unchanged on safe failure.
PASS: migration 003 is valid and idempotent on MySQL 8 with its identity/action/window unique key.
```

The two MySQL `ERROR 1062` messages emitted during that successful check are
intentional assertions: one proves the installed unique index rejects a second
like, and the other proves historical duplicates cause a safe migration failure.
