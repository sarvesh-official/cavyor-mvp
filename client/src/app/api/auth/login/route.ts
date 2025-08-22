import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await validateAdminCredentials({ email, password });
    
    if (user) {
      const response = NextResponse.json({ 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
      setAuthCookie(response);
      return response;
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
