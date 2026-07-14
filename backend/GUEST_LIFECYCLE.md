# Guest lifecycle policy

Guest identities are anonymous, non-recoverable sessions. `last_seen_at` is
updated by authenticated requests so operators can identify inactivity.

No automatic deletion is enabled. Any future cleanup job requires explicit
operator approval and a verified backup. It may delete only inactive guests
with no posts, comments, likes, or reports. Guests with content must instead be
retained or anonymized according to an approved retention policy; their content
must never be silently deleted.
