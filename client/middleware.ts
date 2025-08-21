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

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (e.g. favicon.ico)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|static|[\\w-]+\\.\\w+).*)',
  ],
};
