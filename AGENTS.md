# AGENTS.md

## Project overview

This repository contains the original Social Media application recovered from
commit `9469ec49` (15 September 2025).

The application has two source components:

- `front/`: Next.js 14 frontend using React 18 and TypeScript.
- `backend/`: Flask API using SQLAlchemy and MySQL.

The root `docker-compose.yml` starts the MySQL database, Flask API, and
frontend. `nest-api` and `flask_api` are not part of this recovered version and
must not be reintroduced unless the user explicitly requests an architectural
migration.

## Repository layout

```text
Social_Media/
|-- backend/           Flask backend
|-- front/             Next.js frontend
|-- docker-compose.yml Local development services
|-- .env               Local secrets and configuration; never commit
`-- AGENTS.md           Tool-independent agent instructions
```

## Development commands

Run the complete application from the repository root:

```powershell
docker compose up --build
```

Validate the Compose configuration without starting services:

```powershell
docker compose config --quiet
```

Run the frontend separately:

```powershell
cd front
npm install
npm run dev
```

The frontend is served at `http://localhost:3000` and currently calls the API
at `http://localhost:5000`.

## Working rules

- Inspect the repository and Git status before editing.
- Preserve the `front/` plus `backend/` architecture unless a migration is
  explicitly requested.
- Do not add `nest-api`, `flask_api`, or a second backend implicitly.
- Never commit `.env`, credentials, access tokens, `node_modules`, virtual
  environments, caches, or generated Python bytecode.
- Keep changes focused and avoid unrelated dependency upgrades or refactors.
- Prefer environment variables over hard-coded secrets and service URLs.
- Do not claim the application works without running the relevant validation,
  build, or test command and reporting its result.
- Preserve existing user changes and do not discard or rewrite Git history
  without explicit approval.

## Known project state

- The frontend README is still the generic Create Next App document.
- The frontend contains direct `localhost:5000` API URLs.
- The frontend requests `/login`, but that route is not present in the current
  Flask API and requires investigation before login can be considered working.
- Generated `.pyc` files exist in Git history and should be removed in a
  separate, explicitly approved cleanup.
- No root-level automated test workflow has been verified yet.
