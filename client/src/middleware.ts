import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Extract subdomain (handle localhost, custom domain, and Vercel free domain)
  let subdomain = ''
  
  if (hostname.includes('localhost')) {
    // For ela.localhost:3001, extract 'ela'
    const parts = hostname.split('.')
    if (parts.length >= 2 && parts[1] === 'localhost:3001') {
      subdomain = parts[0]
    }
  } else if (hostname.includes('vercel.app')) {
    // Handle Vercel free domain: tenant-projectname.vercel.app
    const parts = hostname.split('-')
    if (parts.length > 1) {
      // Extract tenant name from the first segment
      subdomain = parts[0]
    }
  } else if (hostname.includes('.')) {
    // For custom production domains like ela.cavyor.com
    const parts = hostname.split('.')
    if (parts.length > 2) {
      subdomain = parts[0]
    }
  }
  
  // If we have a subdomain and it's not www or api
  if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
    // Rewrite to tenant-specific page
    url.pathname = `/tenant/${subdomain}${url.pathname}`
    
    const response = NextResponse.rewrite(url)
    
    // Add tenant context headers for the page to use
    response.headers.set('x-tenant-slug', subdomain)
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
