# Qwiklink Backend

Node.js + PostgreSQL backend for Qwiklink.

This repository contains the API server used by the Qwiklink project. The project is configured to run locally on Windows (PowerShell) and includes helper scripts for initializing a local database and running a quick auth smoke-test.

---

## 🚀 Getting started

These instructions assume you're working on Windows PowerShell (the commands below use PowerShell syntax). Adjust accordingly for other shells.

### Prerequisites
- Node.js (v18+) and npm
- PostgreSQL (local or remote)
- (Optional) psql CLI for manual DB work

### 1) Install dependencies
Run once after cloning or when dependencies change:

```powershell
npm install
```

### 2) Create an environment file
Copy the example and update values:

```powershell
Copy-Item .env.example .env
```

The project will read configuration from environment variables (see `.env.example`).

### 3) Initialize the database (local helper)
A convenience script exists to create the local DB and run initial setup where applicable:

```powershell
npm run db:init
```

This runs `scripts/init-local-db.js`. Adjust or run migrations manually if you use a different workflow.

### 4) Start the server
- Development (with auto-reload):

```powershell
npm run dev
```

- Production:

```powershell
npm start
```

### 5) Run the auth smoke-test
There's a small script that performs a register/login flow against the running server. Use it to verify basic auth functionality:

```powershell
npm run auth:test
```

It reads optional test variables from the environment (see `.env.example`).

---

## Environment variables
You can either provide a `DATABASE_URL` connection string or the individual DB_* variables shown below.

Required/commonly used variables (put these in `.env`):
- DB_NAME
- NODE_ENV (development|production)
- JWT_SECRET (used to sign/verify tokens)

Test script variables (optional):

- API_BASE (defaults to http://localhost:5000)
- TEST_EMAIL
- TEST_PASSWORD
- TEST_LAST_NAME
- TEST_PHONE

---

- `src/server.js` - app entry
- `src/config/db.js` - DB connection logic
- `scripts/init-local-db.js` - local DB setup helper
- `scripts/auth-test.js` - small auth smoke-test runner

---
## API examples
Use the auth test script or curl to exercise endpoints. Example login (adjust port if needed):

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"you@example.com","password":"password123"}'

## Troubleshooting
- Port already in use: change `PORT` in `.env`.

If you run into errors running `npm run db:init` or `npm run auth:test`, inspect the script files in `scripts/` — they log useful details.

---

## Contributing
- Open issues or PRs.
- Run the smoke test before opening a PR: `npm run auth:test`.

## License
Add your preferred license here (e.g. MIT).

---

If you'd like, I can: add a CI step to run the smoke-test, create a `.env.example` file (I added one), or wire a simple migration step—tell me which you'd prefer.

---

## CI updates and changelog
I updated CI and repository scripts so GitHub Actions runs the same workflow you use locally: migrate, seed, start server, then run the auth smoke-test. Below is a concise changelog and notes you can paste into your release notes or project docs.

CI changes
- Replaced `db:init` usage with `npm run migrate:latest` and `npm run seed:run` in `.github/workflows/ci.yml` so migrations are the single source of truth.
- Added a robust CI wait helper `scripts/wait-for-url.cjs` and the workflow now uses it to wait for `http://localhost:5000` to become healthy before running tests.
- Ensured `TEST_PASSWORD` is defined in the job-level `env` block so seeds can use the expected password.

Repository/UX changes
- Fixed malformed `package.json` (removed stray content and ensured scripts exist).
- Ensured migrations and seeds are CommonJS where applicable and seeds insert a deterministic test user `test@example.com` (see `seeds/001_users.cjs`).

How CI now works (summary)
1. GitHub Actions spins up Postgres service.
2. Install deps (`npm ci`).
3. Run `npm run migrate:latest` to bring DB schema up-to-date.
4. Run `npm run seed:run` to insert a deterministic test user.

Full changelog (actions I performed during this session)
	- Added `scripts/wait-for-url.cjs` (CI helper to wait for server readiness).
3. Seeds and migrations
4. Server and auth test
	- Verified `src/server.js` has `/health`, `/api/auth` routes and a simple JWT-protected route `/api/protected` for smoke tests.
	- Verified `scripts/auth-test.js` registers/logs in and calls protected route.
5. CI workflow
	- Edited `.github/workflows/ci.yml` to:
	  - Fail if tracked `.env` files exist.
	  - Install dependencies and Postgres client.
	  - Wait for Postgres readiness.
	- Repaired malformed `package.json` so `npm` and Node can run scripts and start the server locally.
	- Verified local server starts and the auth smoke-test passes when run locally.

If you want, I can:
- Commit a small GitHub Actions artifact (test log) on success.
- Add a small test that runs in CI to assert /health and /api/protected (beyond the existing auth test).

Local dev checklist (CI-like)
- Install dependencies: `npm install`
- Run migrations locally: `npm run migrate:latest`
- Start server: `npm start`
- Wait for server (helper): `node scripts/wait-for-url.cjs http://localhost:5000/health 30 1000`
- Run auth smoke-test: `npm run auth:test`

CI helper
- The CI uses `scripts/wait-for-url.cjs` to wait for the server to be ready on `/health` before running `npm run auth:test`.

CI badge & troubleshooting

![CI](https://github.com/qwiklink-official/qwiklink-backend/actions/workflows/ci.yml/badge.svg)

Common CI failures and quick fixes
- Migrations fail with SQL errors: inspect the migration that failed (output in Actions log). Run the failing migration locally with `knex migrate:up <name>` to reproduce.
- Seed fails due to missing extension (pgcrypto): ensure `0000_enable_pgcrypto` migration ran successfully. The CI runs migrations before seeds.
- Auth smoke-test times out: check `server.out` and `server.err` artifacts or the `scripts/wait-for-url.cjs` logs in Actions.
- Tracked `.env` present: the workflow fails early if a `.env` file is tracked—ensure `.gitignore` contains `.env*` and remove any tracked `.env`.

Client generation and Postman collection

You can generate a TypeScript API client and a Postman collection from `openapi.yaml`:

```powershell
# Generate TypeScript client (writes to src/generated/api.ts)
npm run gen:client

# Export Postman collection
npm run gen:postman
```

CI artifact uploads for migrations/seeds

CI now captures stdout/stderr from knex migrate and knex seed commands into `migrate.out`/`migrate.err` and `seed.out`/`seed.err` respectively. If the job fails, those files will be uploaded as artifacts named `migrate-logs` and `seed-logs` to help debugging nondeterministic failures.

Deterministic test users (seeded)

The CI and local `seed:run` now insert three deterministic users so frontend and tests can log in with known accounts.

- Customer
	- email: `test.customer@example.com`
	- password: value of `TEST_PASSWORD` (default: `password123`)
	- role: `customer`

- Driver
	- email: `test.driver@example.com`
	- password: value of `TEST_PASSWORD` (default: `password123`)
	- role: `driver`

- Dispatcher/Admin
	- email: `test.dispatcher@example.com`
	- password: value of `TEST_PASSWORD` (default: `password123`)
	- role: `dispatcher`

These are inserted by `seeds/001_users.cjs`. To seed locally:

```powershell
setx TEST_PASSWORD "password123"
npm run seed:run
```



