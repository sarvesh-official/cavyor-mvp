import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated as admin
    const isAdmin = isAdminRequest(request)
    
    return NextResponse.json({ 
      authenticated: isAdmin,
      role: isAdmin ? 'admin' : null
    })
  } catch (error) {
    return NextResponse.json({ 
      authenticated: false,
      error: 'Authentication check failed'
    }, { status: 401 })
  }
}
