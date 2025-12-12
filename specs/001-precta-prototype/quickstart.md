# Quickstart Guide: Precta Development Setup

**Feature**: 001-precta-prototype  
**Last Updated**: 2025-12-09

---

## Prerequisites

- **Bun** 1.1+ ([Install](https://bun.sh/docs/installation))
- **Docker Desktop** with WSL2 integration
- **Git**
- **VS Code** or **Windsurf** IDE

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url> precta
cd precta

# Install all workspace dependencies
bun install
```

---

## 2. Start Docker Services

```bash
# Start PostgreSQL, Redis, Typesense
docker compose up -d

# Verify services are running
docker compose ps
```

Expected output:
```
NAME             STATUS    PORTS
precta-db        running   0.0.0.0:5432->5432/tcp
precta-redis     running   0.0.0.0:6379->6379/tcp
precta-search    running   0.0.0.0:8108->8108/tcp
```

---

## 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values (or use defaults for local dev)
```

**Default `.env` for local development:**
```env
# Database
DATABASE_URL=postgresql://precta:precta_dev_password@localhost:5432/precta

# Redis
REDIS_URL=redis://localhost:6379

# Auth
BETTER_AUTH_SECRET=dev-secret-must-be-32-chars-min!
BETTER_AUTH_URL=http://localhost:3001

# Typesense
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=precta_dev_api_key

# URLs
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:3000
```

---

## 4. Database Setup

```bash
# Generate migrations from schema (first time or after schema changes)
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Or push schema directly (dev only)
bun run db:push

# Optional: Open Drizzle Studio to view data
bun run db:studio
```

---

## 5. Run Development Servers

### Option A: Run All (Recommended)

```bash
# Start both backend and frontend
bun run dev
```

### Option B: Run Separately

```bash
# Terminal 1: Backend (Elysia API)
bun run dev:backend
# → http://localhost:3001
# → Swagger: http://localhost:3001/swagger

# Terminal 2: Frontend (SolidStart)
bun run dev:web
# → http://localhost:3000
```

---

## 6. Verify Setup

### Check Backend Health
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Check Swagger Docs
Open: http://localhost:3001/swagger

### Check Frontend
Open: http://localhost:3000

### Check Database Connection
```bash
bun run db:studio
# Opens Drizzle Studio at http://localhost:4983
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install all dependencies |
| `bun run dev` | Start all dev servers |
| `bun run dev:backend` | Start backend only |
| `bun run dev:web` | Start frontend only |
| `bun run build` | Build all packages |
| `bun run test` | Run all tests |
| `bun run lint` | Lint all packages |
| `bun run typecheck` | Type-check all packages |
| `bun run db:generate` | Generate migrations |
| `bun run db:migrate` | Apply migrations |
| `bun run db:push` | Push schema (dev) |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:seed` | Seed database |
| `docker compose up -d` | Start Docker services |
| `docker compose down` | Stop Docker services |
| `docker compose logs -f` | View service logs |

---

## Project Structure Overview

```
precta/
├── apps/
│   ├── backend/          # Elysia API (port 3001)
│   │   └── src/
│   │       ├── index.ts  # Entry point
│   │       ├── app.ts    # Elysia app
│   │       ├── routes/   # API routes
│   │       ├── services/ # Business logic
│   │       └── lib/      # Utilities
│   │
│   └── web/              # SolidStart (port 3000)
│       └── src/
│           ├── routes/   # Pages
│           ├── components/
│           └── lib/api.ts # Eden Treaty client
│
├── packages/
│   ├── db/               # Drizzle schema
│   │   └── src/schema/   # Table definitions
│   │
│   └── shared/           # Shared types
│       └── src/
│
├── docker-compose.yml    # Local services
├── package.json          # Workspace config
└── tsconfig.json         # Base TS config
```

---

## Workspace Dependencies

To add a dependency to a specific workspace:

```bash
# Add to backend
bun add <package> --filter backend

# Add to web frontend
bun add <package> --filter web

# Add to db package
bun add <package> --filter @precta/db

# Add dev dependency to root
bun add -D <package>
```

To use internal packages:

```json
// apps/backend/package.json
{
  "dependencies": {
    "@precta/db": "workspace:*",
    "@precta/shared": "workspace:*"
  }
}
```

---

## Testing

```bash
# Run all tests
bun run test

# Run backend tests only
bun run --filter backend test

# Run with watch mode
bun test --watch

# Run e2e tests (requires servers running)
bun run --filter web test:e2e
```

---

## Troubleshooting

### Docker services won't start

```bash
# Check logs
docker compose logs postgres
docker compose logs redis
docker compose logs typesense

# Reset volumes (CAUTION: deletes data)
docker compose down -v
docker compose up -d
```

### Database connection failed

1. Ensure Docker is running
2. Check `DATABASE_URL` in `.env`
3. Verify PostgreSQL container is healthy:
   ```bash
   docker exec precta-db pg_isready -U precta
   ```

### Type errors in IDE

```bash
# Regenerate types
bun run typecheck

# Restart TypeScript server in IDE
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Port already in use

```bash
# Find process using port
lsof -i :3001  # or :3000, :5432, etc.

# Kill process
kill -9 <PID>
```

### Bun install issues

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install
```

---

## Next Steps

1. ✅ Setup complete
2. → Run `/speckit.tasks` to generate task breakdown
3. → Start implementing Milestone M0-M1 (monorepo setup)
4. → Build database schema (M2-M3)
5. → Implement authentication (M4)
6. → Build P1 features (M5-M8)

---

## Useful Links

- [Bun Documentation](https://bun.sh/docs)
- [Elysia Documentation](https://elysiajs.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [SolidJS Documentation](https://www.solidjs.com/docs)
- [Typesense Documentation](https://typesense.org/docs)
- [Paystack Documentation](https://paystack.com/docs)
