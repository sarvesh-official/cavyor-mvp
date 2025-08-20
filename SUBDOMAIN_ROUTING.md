# Subdomain Routing (Future Enhancement)

## Current Behavior
- `localhost:3001` → Create Tenant page
- `hi.localhost:3001` → Same Create Tenant page (no routing logic)

## Why This Happens
The MVP only creates tenant records and generates URL hints. Actual subdomain routing was marked as **out of scope** in the requirements.

## To Implement Subdomain Routing (Future)

### 1. Next.js Middleware for Subdomain Detection
```javascript
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const hostname = request.headers.get('host')
  const subdomain = hostname?.split('.')[0]
  
  // If subdomain exists and isn't 'www'
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    // Check if tenant exists in database
    // Redirect to tenant-specific app or 404
    return NextResponse.rewrite(new URL(`/tenant/${subdomain}`, request.url))
  }
  
  return NextResponse.next()
}
```

### 2. Tenant-Specific Pages
```
src/app/tenant/[slug]/page.tsx  // Tenant dashboard
src/app/tenant/[slug]/layout.tsx // Tenant-specific layout
```

### 3. Database Lookup
```javascript
// Check if tenant exists
const tenant = await prisma.tenant.findUnique({
  where: { slug: subdomain }
})

if (!tenant) {
  return NextResponse.redirect('/404')
}
```

### 4. DNS Configuration
- Wildcard DNS: `*.yourdomain.com` → Your server
- Or individual DNS records for each tenant

## Current MVP Scope
✅ Create tenants with unique slugs
✅ Generate URL hints (ela.cavyor.com)
✅ Validate tenant names
✅ Store in database
❌ Subdomain routing (out of scope)
❌ Tenant-specific content (out of scope)
