import React from 'react';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/seller-auth';
import { AdminLoginForm } from './AdminLoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'BioMart Admin | Управление платформой',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('biomart_admin_super')?.value;
  const payload = verifySessionToken(token);
  const isAuthenticated = Boolean(payload && payload.role === 'admin');

  // Server-Side Gate: unauthenticated requests only receive the login form,
  // preventing client delivery of any admin bundle data, stores, or moderation tools.
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] min-h-[-webkit-fill-available] bg-page text-content-primary flex flex-col items-center justify-center p-4">
        <AdminLoginForm />
      </div>
    );
  }

  // Authenticated platform owner layout
  return (
    <div className="min-h-screen bg-page text-content-primary">
      {children}
    </div>
  );
}
