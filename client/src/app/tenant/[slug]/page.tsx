import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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

type Props = {
  params: Promise<{ slug: string }>
}

export default async function TenantDashboard({ params }: Props) {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  
  if (!tenant) {
    notFound();
  }
  
  return <TenantDashboardClient tenant={tenant} />;
}
