import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import TenantDashboardClient from './client-component';

export interface Tenant {
  id: string
  name: string
  slug: string
  status: string
  createdAt: string
}

async function getTenant(slug: string): Promise<Tenant | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug }
    });
    
    if (!tenant) return null;
    
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      createdAt: tenant.createdAt.toISOString()
    };
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
}

export default async function TenantDashboard({ params }: { params: { slug: string } }) {
  const tenant = await getTenant(params.slug);
  
  if (!tenant) {
    notFound();
  }
  
  return <TenantDashboardClient tenant={tenant} />;
}
