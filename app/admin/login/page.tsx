import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/seller-auth';
import { AdminLoginForm } from '../AdminLoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('biomart_admin_super')?.value;
  const payload = verifySessionToken(token);
  if (payload && payload.role === 'admin') {
    redirect('/admin');
  }

  return (
    <div className="min-h-[100dvh] min-h-[-webkit-fill-available] bg-page text-content-primary flex flex-col items-center justify-center p-4">
      <AdminLoginForm />
    </div>
  );
}
