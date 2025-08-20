# Setup Guide - Docker Network Issues

If you're experiencing Docker connectivity issues, here are alternative approaches:

## Option 1: Fix Docker Network Issues

Try these Docker troubleshooting steps:

```bash
# 1. Try using Docker Hub directly
docker pull postgres:16-alpine

# 2. If that fails, try with different registry
docker pull docker.io/postgres:16-alpine

# 3. Check Docker daemon status
docker version
docker system info

# 4. Restart Docker Desktop (Windows)
# Close Docker Desktop completely and restart it

# 5. Try running with different network settings
docker-compose up -d --force-recreate
```

## Option 2: Use Local PostgreSQL Installation

If Docker continues to fail, install PostgreSQL locally:

### Windows (using Chocolatey)
```bash
# Install PostgreSQL
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-14

# Create database
psql -U postgres -c "CREATE DATABASE cavyor;"
```

### Windows (Manual Installation)
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for 'postgres' user
4. Open pgAdmin or command line and create database 'cavyor'

### Update Environment Variables
If using local PostgreSQL, update your `.env` files:

```bash
# In apps/api/.env and packages/db/.env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cavyor
```

## Option 3: Use SQLite for Development

For quick testing, you can temporarily use SQLite:

1. Update `packages/db/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Update environment:
```bash
DATABASE_URL="file:./dev.db"
```

## Continue Setup After Database is Ready

Once you have a database running (Docker, local PostgreSQL, or SQLite):

```bash
# Install dependencies
pnpm install

# Generate Prisma client
cd packages/db
pnpm generate

# Run migrations
pnpm migrate

# Start the applications
cd ../..
pnpm dev:api    # Terminal 1
pnpm dev:web    # Terminal 2
```

## Test the Setup

```bash
# Test API health
curl http://localhost:4000/api/health

# Test tenant creation
curl -X POST http://localhost:4000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Company"}'
```

Visit http://localhost:3000 to use the web interface.
