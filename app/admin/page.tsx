'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center text-[#1A1A1A]">
      <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B66]">
        <span className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-ping" />
        <span>Переход в личный кабинет...</span>
      </div>
    </div>
  );
}
