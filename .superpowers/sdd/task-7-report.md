# Task 7 report

Status: DONE

Implemented: atomic fixed-window limits keyed by HMAC-hashed JWT `jti` and IP;
session creation limits by IP; active/suspended/blocked users; moderator/admin
authorization; authenticated reports; post hiding; guest `last_seen_at`; additive
MySQL migration 004; and a non-destructive guest lifecycle policy. No automatic
deletion exists.

TDD: the first focused run failed during collection because `ContentReport` did
not exist. After implementation, `tests/test_abuse_controls.py` passed 9/9.

Verification: complete backend suite 105/105 passed; focused post-review suite
9/9 passed; `git diff --check` exited 0. No frontend/UI files changed. No push,
historical database, or historical containers were touched.
