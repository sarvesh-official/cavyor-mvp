import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

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
    // Check if hostname contains a subdomain (e.g., tenant-name.localhost:3001)
    if (hostname.includes('.localhost')) {
      const subdomain = hostname.split('.')[0];
      return subdomain;
    }

    // Fallback: try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
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
  const subdomain = extractSubdomain(request);
  const pathname = request.nextUrl.pathname;
  
  // Debug logging
  console.log('Middleware:', { pathname, subdomain, isAuth: isAuthenticated(request) });
  
  // Check authentication for admin API routes
  if (pathname.startsWith('/api/admin/')) {
    if (!isAuthenticated(request)) {
      console.log('API route unauthorized, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // Check authentication for admin pages (root path)
  if (pathname === '/' || pathname.startsWith('/admin')) {
    // Only apply auth check if we're not on a tenant subdomain
    if (!subdomain) {
      if (!isAuthenticated(request) && !pathname.startsWith('/login')) {
        console.log('Redirecting to login page');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Redirect from login to admin if already authenticated
      if (isAuthenticated(request) && pathname.startsWith('/login')) {
        console.log('Redirecting from login to admin');
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }
  
  // Handle tenant subdomains - follow existing pattern
  if (
    subdomain && 
    !pathname.startsWith('/tenant/')
  ) {
    return NextResponse.rewrite(new URL(`/tenant/${subdomain}`, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /_next (Next.js internals)
     * 2. /static (e.g. favicon.ico)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!_next|static|[\\w-]+\\.\\w+).*)',
  ],
};
