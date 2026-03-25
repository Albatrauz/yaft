# YAFT — Yet Another Filament Tracker

A self-hosted filament inventory manager for 3D printing. Track spools by brand, type, color, and remaining weight — and keep an eye on your spending.

**Features:**
- Add, edit, and delete filament spools with full spec details (brand, type, color, weight, price, ironing profiles, notes)
- Dashboard showing total spool count and total investment value
- Search and filter by brand, color, or material type
- STL/3MF file calculator tool — upload a model and estimate material usage
- Multi-user accounts with email/password auth; optional GitHub and Google OAuth
- All data is per-user — each account only sees its own filaments

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3, SSR) |
| Database ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Database | PostgreSQL 17 |
| Auth | [better-auth](https://www.better-auth.com) |
| Styles | Tailwind CSS 4 |
| Package manager | pnpm |

## Prerequisites

- **Node.js** 22+
- **pnpm** — `npm install -g pnpm`
- **Docker** (for local Postgres)

## Local Development

### 1. Clone and install

```bash
git clone <repo-url>
cd yaft
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

The default `.env` values work out of the box with the Docker setup below — no changes needed for local dev.

### 3. Start Postgres

```bash
docker compose up -d db
```

This starts a PostgreSQL 17 instance on port `5050` with the `yaft` database already created.

### 4. Run migrations

```bash
pnpm db:migrate
```

### 5. (Optional) Seed sample data

Creates an admin user and 8 sample filament entries so you have something to look at right away.

```bash
pnpm db:seed
```

The seed script uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`. Defaults are `admin@yaft.local` / `changeme`.

### 6. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Log in with your seeded admin account or register a new one.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. All variables are documented below.

### Database

Use **either** `DATABASE_URL` (single connection string) **or** individual `DB_*` vars — not both. When `DATABASE_URL` is set it takes precedence and the individual vars are ignored.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full Postgres connection string — `postgresql://user:password@host:5432/dbname`. Use this in production. |
| `DB_HOST` | Postgres host (local dev only, default `localhost`) |
| `DB_PORT` | Postgres port (local dev only, default `5050`) |
| `DB_USER` | Postgres user (local dev only, default `postgres`) |
| `DB_PASSWORD` | Postgres password (local dev only, default `postgres`) |
| `DB_NAME` | Database name (local dev only, default `yaft`) |

### Auth

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Random secret used to sign sessions — **must be at least 32 characters**. Generate one with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Full public URL of the app, e.g. `https://yaft.example.com`. Used for auth redirects. |

### OAuth (optional)

Social login buttons appear automatically when these are set. Omit them to run with email/password only.

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### Seed script

| Variable | Description |
|---|---|
| `ADMIN_EMAIL` | Email for the admin user created by `pnpm db:seed` |
| `ADMIN_PASSWORD` | Password for the admin user created by `pnpm db:seed` |

## Optional: Setting up OAuth

### GitHub

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers) and create a new OAuth App.
2. Set **Homepage URL** to your app URL (e.g. `http://localhost:3000`).
3. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`.
4. Copy the **Client ID** and **Client Secret** into `.env`.

### Google

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) and create an OAuth 2.0 Client ID (Web application).
2. Add `http://localhost:3000/api/auth/callback/google` as an **Authorized redirect URI**.
3. Copy the **Client ID** and **Client Secret** into `.env`.

Replace `http://localhost:3000` with your production URL when deploying.

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server on `http://localhost:3000` |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm generate` | Generate a static site |
| `pnpm db:generate` | Generate a new migration file from schema changes |
| `pnpm db:migrate` | Apply pending migrations to the database |
| `pnpm db:push` | Push schema changes directly without a migration file (prototyping only) |
| `pnpm db:studio` | Open Drizzle Studio — a web UI for browsing the database |
| `pnpm db:seed` | Create the admin user and insert sample filaments |

## Deployment

### Docker (manual)

Build the image:

```bash
docker build -t yaft .
```

Run the container (pass all required env vars):

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/yaft" \
  -e BETTER_AUTH_SECRET="your-32-char-secret" \
  -e BETTER_AUTH_URL="https://yaft.example.com" \
  --name yaft \
  yaft
```

Run migrations after starting the container:

```bash
docker exec yaft pnpm db:migrate
```

### Coolify

Coolify is the recommended hosting platform. YAFT deploys cleanly from its `Dockerfile`.

**1. Provision a database**

- In your Coolify project, add a **PostgreSQL 17** resource.
- Once it's running, open its terminal and run:
  ```sql
  CREATE DATABASE yaft;
  ```

**2. Create the application service**

- Add a new **Application** resource and point it at this repository.
- Coolify will detect the `Dockerfile` automatically.

**3. Set environment variables**

In the application's environment settings, add:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@POSTGRES_SERVICE_UUID:5432/yaft
BETTER_AUTH_SECRET=your-32-char-secret
BETTER_AUTH_URL=https://your-domain.com
```

- The `POSTGRES_SERVICE_UUID` is Coolify's internal hostname for the database service — find it on the database resource page. No need to expose Postgres to the internet.
- Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.
- Set `BETTER_AUTH_URL` to the public domain you assign to the app.

**4. Deploy**

Trigger a deploy. Once the container is running, open a terminal into it and run migrations:

```bash
pnpm db:migrate
```

You only need to do this on the first deploy and after schema changes. Subsequent deploys don't require it unless you've updated the database schema.

**5. (Optional) Seed initial data**

```bash
pnpm db:seed
```

Remember to set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment variables first, or update them after seeding.
