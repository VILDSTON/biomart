'use client';

import React from 'react';
import Link from 'next/link';
import { StorefrontClient } from '@/components/StorefrontClient';
import { ArrowRight, Store } from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A1A1A]">
      {/* Floating Header on top of demo */}
      <div className="bg-[#FFFFFF] text-[#1A1A1A] border-b border-[#E7E4DC] py-2.5 px-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BioMartLogo className="w-5 h-5 shrink-0" color="#1F7A5A" />
            <span className="text-xs font-semibold text-[#1A1A1A]">
              Демо-витрина Tashkent Drip
            </span>
          </div>

          <Link
            href="/register"
            className="bg-[#1F7A5A] hover:bg-[#17634A] text-white text-xs font-medium px-3 py-1.5 rounded-[10px] flex items-center gap-1 transition-colors"
          >
            <span>Создать витрину</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Render the full storefront with slug 'tashkent_drip' */}
      <React.Suspense fallback={null}>
        <StorefrontClient initialSlug="tashkent_drip" />
      </React.Suspense>
    </div>
  );
}
