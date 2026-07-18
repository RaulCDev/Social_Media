# Frontend

This directory contains the Next.js 14 and React 18 frontend for the
`social_media` project. The supported way to run the complete application is
Docker Compose from the repository root; see the main
[project README](../README.md).

## Run only the frontend

Install the locked dependencies and start the development server:

```powershell
npm ci
npm run dev
```

The frontend is available at <http://localhost:3000> and expects the Flask API
at `http://localhost:5000`. Override that URL only when needed:

```text
NEXT_PUBLIC_API_URL=http://localhost:5000
```

GitHub login and data-backed screens still require the backend and database.

## Checks

```powershell
npm test
npm run lint
npm run build
```

Known incomplete screens and interactions are recorded in
[docs/KNOWN_LIMITATIONS.md](../docs/KNOWN_LIMITATIONS.md).
