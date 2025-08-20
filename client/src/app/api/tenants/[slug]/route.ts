import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tenants/[slug]
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const tenant = await prisma.tenant.findUnique({
      where: { slug }
    });
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    
    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
  }
}
