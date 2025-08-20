import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Use PrismaClient with singleton pattern to prevent connection issues
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

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
