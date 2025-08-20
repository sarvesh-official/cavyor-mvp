# Quick Start Guide

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or manually:
cd client && npm install
cd ../api && npm install  
cd ../packages/db && npm install
```

### 2. Set up Database (SQLite for quick testing)
```bash
# Generate Prisma client
npm run db:generate

# Create and run migrations
npm run db:migrate
```

### 3. Create Environment File for Client
Create `client/.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 4. Start the Applications
```bash
# Terminal 1: Start API server (port 4000)
npm run dev:api

# Terminal 2: Start Next.js client (port 3000)  
npm run dev:web
```

### 5. Test the Application
- Visit: http://localhost:3000
- Enter a tenant name (e.g., "Ela")
- Submit the form
- See the generated slug and URL hint

## 🧪 Manual Testing
1. ✅ Create tenant "Ela" → should get slug "ela"
2. ✅ Create tenant "Ela" again → should get slug "ela-2"  
3. ✅ Try empty name → should show validation error
4. ✅ Kill API server → should show connection error

## 🔧 API Testing
```bash
# Health check
curl http://localhost:4000/api/health

# Create tenant
curl -X POST http://localhost:4000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Company"}'
```

## 🗄️ Database
- Using SQLite for development (file: `packages/db/prisma/dev.db`)
- To switch to PostgreSQL later, update `packages/db/prisma/schema.prisma`
- View data: `cd packages/db && npx prisma studio`

## ⚡ Features Working
- ✅ Tenant name validation (2-64 chars)
- ✅ Slug generation with uniqueness
- ✅ TanStack Form with real-time validation
- ✅ TanStack Query for API calls
- ✅ Success/error states
- ✅ Copy to clipboard functionality
- ✅ Modern Tailwind UI
