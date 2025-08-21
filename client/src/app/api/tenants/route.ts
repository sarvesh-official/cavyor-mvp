import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { getTenantUrl } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

// GET /api/tenants
export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/tenants
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Tenant name must be at least 2 characters' }, { status: 400 });
    }
    
    // Generate slug from name
    const slug = slugify(name);
    
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
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
