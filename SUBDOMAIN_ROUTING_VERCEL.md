# Subdomain Routing on Vercel

This document explains how subdomain routing is implemented for the Cavyor MVP on Vercel.

## How It Works

1. **Middleware Handling**: The application uses Next.js middleware (`middleware.ts`) to detect and route subdomain requests to the appropriate tenant page.

2. **Vercel Configuration**: The `vercel.json` file includes configuration for handling wildcard subdomains.

3. **Domain Structure**:
   - Main application: `cavyormvp.vercel.app`
   - Tenant subdomains: `{tenant-slug}.cavyormvp.vercel.app`

## Implementation Details

### Middleware (`middleware.ts`)

The middleware detects the subdomain from the hostname and rewrites the request to the appropriate tenant page:

```typescript
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  // Skip for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Get the subdomain by splitting the hostname
  const subdomain = hostname?.split('.')[0];
  
  // If subdomain exists and isn't 'www' or the main domain
  if (
    subdomain && 
    subdomain !== 'www' && 
    subdomain !== 'localhost' && 
    subdomain !== 'cavyormvp' && 
    !request.nextUrl.pathname.startsWith('/tenant/')
  ) {
    // Rewrite to the tenant-specific page
    return NextResponse.rewrite(new URL(`/tenant/${subdomain}`, request.url));
  }
  
  return NextResponse.next();
}
```

### Vercel Configuration (`vercel.json`)

The Vercel configuration includes rewrites to handle subdomain routing:

```json
{
  "rewrites": [
    { "source": "/:path*", "destination": "/:path*" }
  ]
}
```

## Custom Domain Setup (Future)

When moving to a custom domain:

1. Add your domain to Vercel project settings
2. Configure a wildcard DNS record:
   - Type: `A` or `CNAME`
   - Name: `*` (wildcard)
   - Value: Your Vercel deployment target

## Troubleshooting

If subdomains aren't working:

1. **Verify middleware**: Ensure the middleware is correctly detecting and routing subdomains
2. **Check Vercel logs**: Look for any routing or rewrite errors
3. **DNS propagation**: If using a custom domain, allow time for DNS changes to propagate (up to 48 hours)
4. **Clear cache**: Try accessing the subdomain in an incognito/private browser window
