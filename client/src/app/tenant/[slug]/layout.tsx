import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tenant Dashboard',
  description: 'Tenant-specific dashboard and management interface',
};

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tenant-layout">
      {children}
    </div>
  );
}
