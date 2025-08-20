# Cavyor Tenant Creator (MVP)

A minimal tenant-creation flow that lets users enter a tenant name, submit a form, and create a tenant instance on the server with Postgres. Returns a unique slug and URL hint.

## 🎯 Features

- **Frontend**: Next.js 14 with TanStack Form and Query
- **Backend**: Express API with validation and slug generation
- **Database**: Postgres with Prisma ORM
- **Validation**: Zod schemas on both client and server
- **Testing**: Unit and integration tests included

## 🛠 Tech Stack

- **Frontend**: Next.js 14 App Router, React 18, TanStack Query, TanStack Form, Zod
- **Backend**: Node 18+, Express 4, Prisma ORM
- **Database**: Postgres 16 (Docker)
- **Package Manager**: pnpm

## 📁 Repository Structure

```
cavyor-mvp/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   └── db/           # Prisma schema and client
├── docker-compose.yml
├── .env.example
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker and Docker Compose

### 1. Clone and Install

```bash
git clone <repository-url>
cd cavyor-mvp
pnpm install
```

### 2. Environment Setup

Copy the environment files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 3. Start Postgres

```bash
docker-compose up -d
```

### 4. Database Setup

```bash
# Generate Prisma client
cd packages/db
pnpm generate

# Run migrations
pnpm migrate

# Optional: Seed database
pnpm seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Start API (port 4000)
pnpm dev:api

# Terminal 2: Start Web (port 3000)
pnpm dev:web
```

Visit [http://localhost:3000](http://localhost:3000) to use the application.

## 🧪 Testing

### Run Unit Tests

```bash
# API tests
cd apps/api
pnpm test

# Web tests (if implemented)
cd apps/web
pnpm test
```

### Manual QA Checklist

1. ✅ Start Postgres with Docker, run migrations
2. ✅ Start API on port 4000, start Web on port 3000
3. ✅ Open http://localhost:3000, enter "Ela", submit, see success with `ela`
4. ✅ Submit "Ela" again, see success with `ela-2`
5. ✅ Verify tenants table contains both rows with distinct slugs
6. ✅ Kill the API, submit again, verify UI shows "Internal server error"

## 📡 API Reference

### Create Tenant

**Endpoint**: `POST /api/tenants`

**Request Body**:
```json
{
  "name": "Ela"
}
```

**Success Response (201)**:
```json
{
  "tenant": {
    "id": "9b3f5f10-8b2f-4f20-9c5a-b34b0b2d3f11",
    "name": "Ela",
    "slug": "ela",
    "status": "active",
    "createdAt": "2025-08-20T10:00:00.000Z"
  },
  "urlHint": "ela.cavyor.com"
}
```

**Error Responses**:
```json
{ "error": "Tenant name is required" }        // 400
{ "error": "Internal server error" }          // 500
```

### Health Check

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-08-20T10:00:00.000Z"
}
```

## 🔧 Example curl Commands

```bash
# Create tenant
curl -sS -X POST http://localhost:4000/api/tenants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ela"}' | jq

# Health check
curl -sS http://localhost:4000/api/health | jq
```

## 🎨 Validation Rules

### Tenant Name
- **Required**: Yes
- **Type**: String (trimmed)
- **Length**: 2-64 characters
- **Allowed characters**: Letters, numbers, spaces, apostrophes, quotes

### Slug Generation
- Converts to lowercase
- Replaces non-alphanumeric characters with hyphens
- Collapses multiple hyphens
- Trims leading/trailing hyphens
- Ensures uniqueness with numeric suffixes (`ela`, `ela-2`, `ela-3`)

## 🗄 Database Schema

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String   @db.Text
  slug      String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(uuid())
  action     String
  resource   String
  resourceId String
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

## 📝 Development Scripts

```bash
# Development
pnpm dev:web          # Start Next.js frontend
pnpm dev:api          # Start Express backend

# Database
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed database with sample data

# Testing
pnpm test             # Run all tests
```

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check if Postgres is running
docker-compose ps

# View logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Port Conflicts
- API runs on port 4000
- Web runs on port 3000
- Postgres runs on port 5432

Change ports in `.env` files if needed.

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules */node_modules
pnpm install
```

## 🚀 Production Deployment

This is an MVP for development. For production:

1. Set up proper environment variables
2. Configure database connection pooling
3. Add rate limiting and security headers
4. Set up proper logging and monitoring
5. Configure subdomain routing and DNS

## 🎯 Out of Scope

- Authentication and sessions
- Full multi-tenant routing or subdomain DNS
- Row-level security (RLS) policies
- Additional resources (users, items, orders)
- Production deployment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
