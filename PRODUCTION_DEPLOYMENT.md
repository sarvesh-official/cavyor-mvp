# Production Deployment Guide

This guide covers deploying the Cavyor multi-tenant MVP to production with proper subdomain routing.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway/Render │    │   Neon/Supabase │
│   (Frontend)    │◄──►│   (API Server)   │◄──►│   (Database)    │
│                 │    │                  │    │                 │
│ cavyor.com      │    │ api.cavyor.com   │    │ PostgreSQL      │
│ *.cavyor.com    │    │ Port 4000        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🌐 Domain & DNS Setup

### 1. Purchase Domain
- Buy `cavyor.com` (or your preferred domain)
- Use providers like Namecheap, GoDaddy, or Cloudflare

### 2. DNS Configuration
Set up these DNS records:

```dns
# Main domain
A     cavyor.com           → Vercel IP (handled by Vercel)
CNAME www.cavyor.com       → cavyor.com

# API subdomain  
CNAME api.cavyor.com       → your-railway-app.railway.app

# Wildcard for tenant subdomains
CNAME *






































































































.cavyor.com         → cavyor.com
```

### 3. Vercel Domain Setup
```bash
# Add domain to Vercel project
vercel domains add cavyor.com
vercel domains add *.cavyor.com
```

## 🚀 Frontend Deployment (Vercel)

### 1. Environment Variables
Create `.env.local` in client:
```env
NEXT_PUBLIC_API_URL=https://api.cavyor.com
```

### 2. Deploy to Vercel
```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

### 3. Vercel Configuration
Create `vercel.json`:
```json
{
  "functions": {
    "app/api/**/*.js": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🖥️ Backend Deployment (Railway)

### 1. Environment Variables
Set in Railway dashboard:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
API_PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://cavyor.com,https://*.cavyor.com
```

### 2. Deploy to Railway
```bash
cd api
npm install -g @railway/cli
railway login
railway init
railway up
```

### 3. Railway Configuration
Create `railway.toml`:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
```

### 4. Update CORS Configuration
Update `api/server.js`:
```javascript
app.use(cors({
  origin: [
    'https://cavyor.com',
    'https://www.cavyor.com',
    /^https:\/\/.*\.cavyor\.com$/
  ],
  credentials: true
}));
```

## 🗄️ Database Setup (Neon)

### 1. Create Neon Database
```bash
# Visit neon.tech and create project
# Get connection string
```

### 2. Run Migrations
```bash
cd api
npx prisma migrate deploy
npx prisma generate
```

### 3. Update Environment
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
```

## 🔧 Production Configuration Updates

### 1. Update API URLs
Update `client/src/app/tenant/[slug]/page.tsx`:
```typescript
const response = await fetch(`https://api.cavyor.com/api/tenants/${slug}`, {
  credentials: 'include'
})
```

Update `client/src/app/page.tsx`:
```typescript
const response = await fetch('https://api.cavyor.com/api/tenants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
```

### 2. Update Middleware for Production
Update `client/src/middleware.ts`:
```typescript
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  let subdomain = ''
  
  if (hostname.includes('localhost')) {
    // Development
    const parts = hostname.split('.')
    if (parts.length >= 2 && parts[1] === 'localhost:3001') {
      subdomain = parts[0]
    }
  } else {
    // Production: ela.cavyor.com
    const parts = hostname.split('.')
    if (parts.length >= 3 && parts[1] === 'cavyor' && parts[2] === 'com') {
      subdomain = parts[0]
    }
  }
  
  if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
    url.pathname = `/tenant/${subdomain}${url.pathname}`
    const response = NextResponse.rewrite(url)
    response.headers.set('x-tenant-slug', subdomain)
    return response
  }
  
  return NextResponse.next()
}
```

## 🔐 Security & Performance

### 1. Environment Security
- Use environment variables for all secrets
- Enable HTTPS only
- Set secure CORS policies

### 2. Database Security
- Use connection pooling
- Enable SSL connections
- Set up read replicas if needed

### 3. Performance Optimization
- Enable Vercel Edge Functions
- Use CDN for static assets
- Implement database indexing

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Domain purchased and DNS configured
- [ ] Production database created
- [ ] Environment variables set
- [ ] CORS policies updated
- [ ] API URLs updated to production

### Deployment
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] SSL certificates active

### Post-deployment
- [ ] Test main domain (cavyor.com)
- [ ] Test API endpoints (api.cavyor.com)
- [ ] Test tenant creation
- [ ] Test subdomain routing (ela.cavyor.com)
- [ ] Monitor logs and performance

## 🧪 Testing Production

### 1. Create Test Tenant
```bash
curl -X POST https://api.cavyor.com/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Company"}'
```

### 2. Test Subdomain Access
- Visit: `https://test-company.cavyor.com`
- Should show tenant dashboard

### 3. Monitor Health
- API Health: `https://api.cavyor.com/api/health`
- Frontend: `https://cavyor.com`

## 🚨 Troubleshooting

### Common Issues

**Subdomain not working:**
- Check DNS propagation (use dig or nslookup)
- Verify Vercel domain configuration
- Check middleware logic

**CORS errors:**
- Update CORS origin patterns
- Check environment variables
- Verify API URL configuration

**Database connection:**
- Check DATABASE_URL format
- Verify SSL requirements
- Test connection string

### Monitoring
- Set up error tracking (Sentry)
- Monitor API performance
- Track database queries
- Set up uptime monitoring

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.2.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: "api"
```

This setup provides a production-ready multi-tenant architecture with proper subdomain routing!
