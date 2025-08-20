# Cloudflare Subdomain Routing Implementation

## Architecture Overview

```
User Request: hi.cavyor.com
    ↓
Cloudflare Worker (Edge)
    ↓
Check tenant exists in KV/D1
    ↓
Route to appropriate app/page
```

## Option 1: Cloudflare Workers + KV Store

### 1. Cloudflare Worker Script
```javascript
// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const subdomain = hostname.split('.')[0];
    
    // Skip routing for main domain and www
    if (subdomain === 'cavyor' || subdomain === 'www') {
      return fetch(request);
    }
    
    // Check if tenant exists in KV store
    const tenant = await env.TENANTS_KV.get(subdomain);
    
    if (!tenant) {
      // Redirect to 404 or main site
      return Response.redirect('https://cavyor.com/404', 302);
    }
    
    // Parse tenant data
    const tenantData = JSON.parse(tenant);
    
    // Rewrite to tenant-specific path
    const newUrl = new URL(request.url);
    newUrl.pathname = `/tenant/${subdomain}${url.pathname}`;
    
    // Add tenant context headers
    const modifiedRequest = new Request(newUrl, {
      ...request,
      headers: {
        ...request.headers,
        'X-Tenant-Slug': subdomain,
        'X-Tenant-ID': tenantData.id,
        'X-Tenant-Name': tenantData.name
      }
    });
    
    return fetch(modifiedRequest);
  }
};
```

### 2. Wrangler Configuration
```toml
# wrangler.toml
name = "cavyor-router"
main = "worker.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "TENANTS_KV"
id = "your-kv-namespace-id"

[env.production]
route = "*.cavyor.com/*"
```

### 3. Sync Tenants to KV Store
```javascript
// sync-tenants.js - Run after creating tenants
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncTenantsToKV() {
  const tenants = await prisma.tenant.findMany();
  
  for (const tenant of tenants) {
    const kvData = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      createdAt: tenant.createdAt
    };
    
    // Upload to Cloudflare KV via API
    await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${tenant.slug}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(kvData)
    });
  }
}
```

## Option 2: Cloudflare Workers + D1 Database

### 1. Worker with D1 Query
```javascript
// worker-d1.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const subdomain = hostname.split('.')[0];
    
    if (subdomain === 'cavyor' || subdomain === 'www') {
      return fetch(request);
    }
    
    // Query D1 database
    const { results } = await env.DB.prepare(
      "SELECT * FROM tenants WHERE slug = ?"
    ).bind(subdomain).all();
    
    if (results.length === 0) {
      return Response.redirect('https://cavyor.com/404', 302);
    }
    
    const tenant = results[0];
    
    // Rewrite URL and add headers
    const newUrl = new URL(request.url);
    newUrl.pathname = `/tenant/${subdomain}${url.pathname}`;
    
    const modifiedRequest = new Request(newUrl, {
      ...request,
      headers: {
        ...request.headers,
        'X-Tenant-Slug': subdomain,
        'X-Tenant-ID': tenant.id,
        'X-Tenant-Name': tenant.name
      }
    });
    
    return fetch(modifiedRequest);
  }
};
```

### 2. D1 Configuration
```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "cavyor-tenants"
database_id = "your-d1-database-id"
```

## Option 3: Next.js Middleware + Cloudflare Headers

### 1. Next.js Middleware
```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get tenant info from Cloudflare Worker headers
  const tenantSlug = request.headers.get('X-Tenant-Slug');
  const tenantId = request.headers.get('X-Tenant-ID');
  
  if (tenantSlug) {
    // Rewrite to tenant-specific page
    const url = request.nextUrl.clone();
    url.pathname = `/tenant/${tenantSlug}${url.pathname}`;
    
    const response = NextResponse.rewrite(url);
    
    // Pass tenant context to pages
    response.headers.set('X-Tenant-Slug', tenantSlug);
    response.headers.set('X-Tenant-ID', tenantId);
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### 2. Tenant-Specific Pages
```typescript
// src/app/tenant/[slug]/page.tsx
import { headers } from 'next/headers';

export default async function TenantDashboard({ params }) {
  const headersList = headers();
  const tenantSlug = headersList.get('X-Tenant-Slug');
  const tenantId = headersList.get('X-Tenant-ID');
  
  // Fetch tenant-specific data
  const tenant = await fetch(`${process.env.API_URL}/api/tenants/${tenantId}`);
  
  return (
    <div>
      <h1>Welcome to {tenant.name}</h1>
      <p>Tenant Dashboard for: {tenantSlug}</p>
    </div>
  );
}
```

## Implementation Steps

### 1. Set up Cloudflare Worker
```bash
npm install -g wrangler
wrangler login
wrangler init cavyor-router
```

### 2. Create KV Namespace
```bash
wrangler kv:namespace create "TENANTS_KV"
```

### 3. Deploy Worker
```bash
wrangler deploy
```

### 4. Update DNS
- Add CNAME: `*.cavyor.com` → `cavyor.com`
- Worker route: `*.cavyor.com/*`

### 5. Sync Tenant Data
- Add webhook to API when creating tenants
- Sync existing tenants to KV/D1

## Benefits of Cloudflare Approach

✅ **Edge Performance** - Routing happens at CDN edge  
✅ **Global Distribution** - Low latency worldwide  
✅ **Automatic SSL** - Wildcard certificates  
✅ **DDoS Protection** - Built-in security  
✅ **Cost Effective** - Pay per request  
✅ **Easy Scaling** - No server management  

## Cost Estimation
- **Workers**: $5/month for 10M requests
- **KV Store**: $0.50/month for 1GB storage
- **D1**: Free tier: 100K reads/day, 1K writes/day
