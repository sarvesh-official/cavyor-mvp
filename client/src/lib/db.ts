import { PrismaClient } from '@prisma/client';

// Use PrismaClient as a singleton to avoid too many connections
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
