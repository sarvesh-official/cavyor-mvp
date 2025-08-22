import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';
import { getTenantUrl } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

// GET /api/admin/tenants
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
    
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/admin/tenants
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
    
    const body = await request.json();
    const { name } = body;
    
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Tenant name must be at least 2 characters' }, { status: 400 });
    }
    
    // Generate slug from name
    const slug = slugify(name);
    
    // Prevent creation of admin tenant
    if (slug === 'admin') {
      return NextResponse.json({ error: 'Cannot create a tenant with the name "admin" as it is reserved for the admin domain' }, { status: 400 });
    }
    
    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug }
    });
    
    if (existingTenant) {
      return NextResponse.json({ error: 'A tenant with this name already exists' }, { status: 409 });
    }
    
    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        status: 'active'
      }
    });
    
    // Generate URL hint based on environment
    const urlHint = getTenantUrl(slug).replace(/(https?:\/\/)/, '');
    
    return NextResponse.json({ tenant, urlHint }, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
