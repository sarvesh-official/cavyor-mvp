import { NextRequest } from 'next/server';
import { isAuthenticated } from './auth';

// Updated admin authentication to use our new session-based system
export function isAdminRequest(request: NextRequest): boolean {
  // Use our new authentication system
  return isAuthenticated(request);
}

export function requireAdmin(request: NextRequest): void {
  if (!isAdminRequest(request)) {
    throw new Error('Unauthorized: Admin access required');
  }
}
