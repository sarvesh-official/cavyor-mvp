import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  // Skip for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Get the subdomain by splitting the hostname
  const subdomain = hostname?.split('.')[0];
  const isVercelPreview = hostname?.includes('vercel.app');
  
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

// Only run middleware on the frontend routes, not on API routes or static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
