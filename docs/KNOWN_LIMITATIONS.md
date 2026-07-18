# Known historical limitations

This project is complete as a historical learning and portfolio project. The
items below are documented so readers can distinguish deliberate preservation
from accidental omission. They are not a roadmap and are not expected to be
fixed in this repository.

Git history remains the source for comparing older implementations. Keeping
these notes here avoids filling active source files with disabled code or long
archaeology comments.

## Product and interface scope

- The internal navigation sections (Search, Notifications, Messages, Lists,
  Premium, Profile, Bookmarks and Communities) replace the feed with a section
  label; they are not complete product screens.
- The `/user` route still contains the original `Hello World` placeholder.
- Profile pages show a username and post count but do not render that user's
  timeline or editable profile information.
- Trends and user recommendations are static demonstration data returned by
  the Flask API.
- Search, follow, subscribe, media attachment, GIF, emoji, repost, bookmark,
  share, settings and advertising controls are visual only.
- The X/Twitter-style brand button has no destination. LinkedIn and GitHub are
  the active external portfolio links.
- Logout exists in the API and authentication provider, but the interface does
  not expose a logout control.
- The layout targets a desktop-width timeline and has limited small-screen
  behavior because the main columns use fixed widths.

## Known interaction defects

- The reply composer opened from a post card does not pass its textarea value
  into the comment request. The request therefore contains empty content and
  is rejected by the backend validation.
- **Load more posts** requests the same latest ten posts because neither the
  endpoint nor the component implements pagination. Repeated clicks can append
  duplicate cards.
- Post-detail comment cards pass the comment's full name where the username and
  avatar values are expected, so their handle, profile link or avatar can be
  incorrect.
- Several avatar components build `https://github.com/<username>.png` instead
  of using the `avatarUrl` returned by the API. Renamed or collision-adjusted
  local usernames may therefore show the wrong image.
- Some cards and side-rail controls contain nested links or buttons. Browsers
  generally render them, but the markup is not ideal for keyboard navigation
  or accessibility tooling.

## Preserved backend and data-model decisions

- Several read operations use `POST`, and historical endpoint and field names
  mix snake case, camel case and names such as `/users_recomendation`.
- `/cards` increments a post's view count whenever the feed is fetched and
  commits each increment separately. It does not represent unique human views.
- `backend/app.py` remains a large route module rather than being split into
  blueprints or service layers.
- The earlier `RateLimitBucket` model and fixed-window helper remain beside the
  active `AbuseRateLimitBucket` implementation. Active writes use the `jti` and
  IP limits from `backend/rate_limits.py`.
- Guest-related columns, migrations, tests and the guest creation helper remain
  non-destructively for historical databases. The active authentication flow
  rejects Guest sessions and requires a GitHub-linked user.
- Demonstration users use predictable example identities and GitHub-style
  avatar URLs. They are seed data, not real accounts.

## Verification boundaries

- Backend tests exercise authentication, authorization, abuse controls, OAuth
  helpers, demonstration data and core post interactions with an isolated
  database.
- Frontend tests are primarily source-contract and layout checks. There is no
  full browser end-to-end suite for the React interface.
- Automated OAuth tests mock GitHub. A real login still requires a personal
  OAuth App and a manual local authorization round trip.
- Dependencies are intentionally not upgraded as part of the historical
  cleanup. Future package advisories may apply to the locked dependency graph.
- No production deployment is supported or claimed. Production Docker stages
  are build validation artifacts; the documented runtime is local Compose.

## Preservation policy

Presentation-only cleanup may remove unused files, debug logs, typographical
errors and obsolete commented implementations. Functional defects and original
architectural choices remain unchanged unless a future change is explicitly
approved as a separate modernization project.
