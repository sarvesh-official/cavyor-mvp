import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Use PrismaClient with singleton pattern to prevent connection issues
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// GET /api/health
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
