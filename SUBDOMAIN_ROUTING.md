# Subdomain Routing Implementation

## Current Behavior
- `localhost:3001` → Create Tenant page
- `{tenant-slug}.localhost:3001` → Tenant-specific dashboard
- `{tenant-slug}.cavyor.in` → Tenant-specific dashboard (production)

## Implementation Details
We have implemented subdomain routing with the following components:

### 1. Next.js Middleware for Subdomain Detection
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Extract subdomain from the request
 * Handles local development, preview deployments, and production environments
 */
function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Handle vercel.app domains
  if (hostname.includes('.cavyormvp.vercel.app')) {
    return hostname.split('.')[0];
  }

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection for custom domain (cavyor.in)
  const rootDomain = 'cavyor.in';
  const isSubdomain =
    hostname !== rootDomain &&
    hostname !== `www.${rootDomain}` &&
    hostname.endsWith(`.${rootDomain}`);

  return isSubdomain ? hostname.replace(`.${rootDomain}`, '') : null;
}

export function middleware(request: NextRequest) {
  // Skip for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  const subdomain = extractSubdomain(request);
  
  if (
    subdomain && 
    !request.nextUrl.pathname.startsWith('/tenant/')
  ) {
    return NextResponse.rewrite(new URL(`/tenant/${subdomain}`, request.url));
  }
  return NextResponse.next();
}
```

### 2. Tenant-Specific Pages
```
src/app/tenant/[slug]/page.tsx  // Tenant dashboard
src/app/tenant/[slug]/layout.tsx // Tenant-specific layout
```

### 3. Environment-Aware URL Generation
```typescript
// src/lib/utils.ts
// Environment-aware configuration
export const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'cavyor.in';
export const devDomain = 'localhost:3001';

// Helper function to check if we're in a development environment
export const isDev = () => {
  return process.env.NODE_ENV === 'development' || 
         typeof window !== 'undefined' && (
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1'
         );
};

// Format a tenant URL based on environment and tenant slug
export const getTenantUrl = (slug: string) => {
  if (isDev()) {
    return `${protocol}://${slug}.${devDomain}`;
  }
  return `${protocol}://${slug}.${rootDomain}`;
};
```

### 4. Tenant-Specific Pages
The tenant page fetches data based on the slug parameter and displays tenant-specific information:

```tsx
// src/app/tenant/[slug]/page.tsx
export default function TenantDashboard({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [tenant, setTenant] = useState<Tenant | null>(null);
  
  useEffect(() => {
    async function fetchTenant() {
      try {
        const response = await fetch(`/api/tenants/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tenant');
        }
        const data = await response.json();
        setTenant(data.tenant);
      } catch (error) {
        setError('Failed to load tenant data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTenant();
  }, [slug]);
  
  // Render tenant dashboard...
}
```

### 5. DNS Configuration
- **Custom Domain**: `cavyor.in` configured in Vercel
- **Wildcard DNS**: `*.cavyor.in` → `cname.vercel-dns.com`
- **Root Domain**: `@` → Vercel's servers

## Current Implementation Status
✅ Create tenants with unique slugs
✅ Generate environment-aware URL hints
✅ Validate tenant names
✅ Store in database
✅ Subdomain routing via Next.js middleware
✅ Tenant-specific content
✅ Custom domain support
✅ Preview deployment support
✅ Local development support
