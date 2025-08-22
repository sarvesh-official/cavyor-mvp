import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Validate admin credentials against database
export async function validateAdminCredentials(credentials: AdminCredentials): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { 
        email: credentials.email,
        isActive: true
      }
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await comparePassword(credentials.password, user.passwordHash);
    
    if (!isValidPassword) {
      return null;
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId || undefined,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt || undefined
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Check if user is authenticated via session
export function isAuthenticated(request: NextRequest): boolean {
  const authToken = request.cookies.get('admin-auth-token')?.value;
  return authToken === 'authenticated';
}

// Set authentication cookie
export function setAuthCookie(response: Response): void {
  response.headers.set('Set-Cookie', 'admin-auth-token=authenticated; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400');
}

// Clear authentication cookie
export function clearAuthCookie(response: Response): void {
  response.headers.set('Set-Cookie', 'admin-auth-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
}

// Create initial admin user (run this once)
export async function createInitialAdminUser(): Promise<void> {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@cavyor.in' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await hashPassword('cavyorkapass');
    
    await prisma.user.create({
      data: {
        email: 'admin@cavyor.in',
        passwordHash: hashedPassword,
        role: 'super_admin',
        isActive: true
      }
    });

    console.log('Initial admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}
