import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

// PATCH /api/admin/tenants/[id] - Update tenant status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be active, inactive, or suspended' }, { status: 400 });
    }
    
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { status }
    });
    
    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Error updating tenant:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

// DELETE /api/admin/tenants/[id] - Delete tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    
    const { id } = await params;
    
    await prisma.tenant.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}
