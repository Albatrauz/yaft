# YAFT — Yet Another Filament Tracker

A 3D printer filament tracking app built with Nuxt 4, Drizzle ORM, PostgreSQL, and Tailwind 4.

## Setup

Install dependencies:

```bash
pnpm install
```

Copy the example env file and adjust values:

```bash
cp .env.example .env
```

## Database

### Local development

Start a local Postgres instance with Docker:

```bash
docker compose up -d db
```

This starts Postgres on port `5050`. The default `.env` values work with this setup:

```env
DB_HOST=localhost
DB_PORT=5050
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=yaft
```

Run migrations:

```bash
pnpm drizzle-kit migrate
```

### Production (Coolify)

YAFT expects an external Postgres instance in production. On Coolify:

1. Create a **Database** resource (PostgreSQL) — this gives you a managed instance with backups and health checks
2. Create a `yaft` database inside it (exec into the container and run `CREATE DATABASE yaft;`)
3. In the YAFT service environment variables, set a single `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@POSTGRES_SERVICE_UUID:5432/yaft
```

Coolify resolves service UUIDs as internal hostnames on the shared Docker network, so there's no need to expose Postgres publicly.

When `DATABASE_URL` is set, individual `DB_*` vars are ignored.

## Development Server

```bash
pnpm dev
```

Starts the dev server on `http://localhost:3000`.

## Production Build

```bash
pnpm build
```

Preview locally:

```bash
pnpm preview
```
