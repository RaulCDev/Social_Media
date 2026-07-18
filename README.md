# Social Media

A local social-network application built as an early learning project with a
Next.js frontend, a Flask API and MySQL. The repository is intentionally kept
close to the original implementation so it can be read as a record of
development progress rather than as a modernized rewrite.

> **Project status:** finished and preserved for portfolio and learning
> purposes. It is designed to run locally with Docker Compose and is not
> intended for public deployment.

The original application was recovered from commit `9469ec49` (15 September
2025). Later work made the local setup reproducible and moved authentication to
a backend-owned GitHub OAuth flow without replacing the original
`front/` + `backend/` architecture.

## What is included

- A timeline populated with demonstration users and posts.
- Post, comment, like and unlike API operations.
- Profile and post-detail routes.
- GitHub OAuth Authorization Code login with `state` and PKCE.
- An application JWT stored only in an `HttpOnly` cookie.
- Database-backed write and session rate limits.
- Reports, account states and moderator-only post hiding in the API.
- Historical additive MySQL migrations and idempotent demonstration data.
- Separate development and production Dockerfile stages.

Some controls and screens are deliberately incomplete because this repository
preserves the scope and implementation level of the original project. See
[Known limitations](docs/KNOWN_LIMITATIONS.md) before evaluating or testing the
application.

## Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, NextUI |
| Backend | Flask 3, Flask-SQLAlchemy, PyJWT |
| Database | MySQL 8 |
| Authentication | GitHub OAuth and an application-owned cookie session |
| Local runtime | Docker Compose |
| Tests | pytest and the Node.js test runner |

## Architecture

```text
Browser
  |-- http://localhost:3000 --> Next.js frontend
  |-- http://localhost:5000 --> Flask API
                                   |
                                   `--> MySQL 8 (internal Compose network)

GitHub OAuth
  Browser -> Flask /auth/github/start -> GitHub
  GitHub -> Flask /auth/github/callback -> HttpOnly application cookie
```

Flask owns the complete OAuth exchange. The frontend does not receive the
GitHub client secret, GitHub token, OAuth callback code or readable application
JWT. Public API reads do not require a session; writes derive the acting user
only from the validated cookie.

## Requirements

- Docker Desktop or Docker Engine with Docker Compose v2.
- A GitHub account with a verified email address.
- Free local ports `3000` and `5000`.
- A personal GitHub OAuth App for the local callback.

No global Node.js, Python or MySQL installation is required for the supported
Docker workflow.

## 1. Create a local GitHub OAuth App

Open GitHub's
[OAuth App registration page](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
and register an application with these values:

| Field | Local value |
| --- | --- |
| Application name | Any name, for example `Social Media Local` |
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:5000/auth/github/callback` |

GitHub OAuth Apps accept a single callback URL, so it must match the local
callback exactly. Generate a client secret and keep both the client ID and
secret private.

The application requests `user:email` so the backend can associate a verified
GitHub identity with a local user. It does not request repository access.

## 2. Configure the environment

Create the private environment file from the tracked example.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```sh
cp .env.example .env
```

Edit `.env` and replace every `replace-with-...` placeholder. In particular:

- set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from the OAuth App;
- use different long random values for `FLASK_SECRET_KEY` and
  `JWT_SECRET_KEY`;
- keep the password inside `DATABASE_URL` equal to `MYSQL_PASSWORD`;
- for the simplest local setup, use only letters, numbers, hyphens and
  underscores in `MYSQL_PASSWORD`. If it contains URI-reserved characters such
  as `@`, `:`, `/`, `#` or `%`, percent-encode the password portion of
  `DATABASE_URL`.

The `.env` file is ignored by Git. Never commit it or paste its contents into
an issue or screenshot.

## 3. Start the application

From the repository root:

```powershell
docker compose up --build
```

Compose starts MySQL, creates the current schema from the SQLAlchemy models,
inserts demonstration data idempotently, and then starts the Flask and Next.js
development servers.

The supported workflow expects a new Compose database volume. The historical
migrations in `backend/migrations/` are retained for reference, but Compose no
longer applies them automatically. If the volume comes from an older revision,
delete it before starting the application.

Open <http://localhost:3000> and select **LogIn with GitHub**. The first login
shows GitHub's authorization screen; after approval, GitHub redirects through
the Flask callback and the browser returns to `/home`.

| Service | URL |
| --- | --- |
| Frontend | <http://localhost:3000> |
| Flask API | <http://localhost:5000> |
| MySQL | Internal to the Compose network; no host port is published |

## Useful commands

Follow application logs:

```powershell
docker compose logs --follow backend front
```

Rebuild after dependency or Dockerfile changes:

```powershell
docker compose up --build
```

Stop the application while preserving the database volume:

```powershell
docker compose down
```

Delete all local database data and start from an empty volume:

```powershell
docker compose down --volumes
docker compose up --build
```

The first command in the last example is destructive: it removes the local
Compose database volume.

## Validation and tests

Validate Compose without starting the application:

```powershell
docker compose config --quiet
```

Run the complete backend suite in an isolated development image:

```powershell
docker compose -p social_media_test run --rm --no-deps `
  -e DATABASE_URL=sqlite:///:memory: `
  -e PYTHONDONTWRITEBYTECODE=1 backend pytest -q
```

Run the frontend checks:

```powershell
Set-Location front
npm ci
npm test
npm run lint
npm run build
```

The focused MySQL migration check uses a temporary MySQL 8 container:

```powershell
.\backend\migrations\check_002_unique_like_user_post.ps1
```

## Repository structure

```text
social_media/
|-- backend/                Flask API, models, migrations and tests
|-- front/                  Next.js application and frontend tests
|-- docs/                   Public project notes and known limitations
|-- .env.example            Safe configuration template
|-- docker-compose.yml      Supported local runtime
`-- README.md               Project entry point
```

## Historical scope

The repository intentionally retains original naming conventions, route
shapes, data-model decisions and unfinished product areas. Obsolete commented
implementations and internal execution reports were removed from the working
tree because Git already preserves them more accurately.

- [Known limitations](docs/KNOWN_LIMITATIONS.md)
- [Guest data lifecycle](backend/GUEST_LIFECYCLE.md)

These notes describe the preserved state; they are not a promise of future
development.
