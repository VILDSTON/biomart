'use client';

import React from 'react';
import Link from 'next/link';
import { BioMartLogo } from '@/components/BioMartLogo';

interface ViralBioMartBadgeProps {
  hideBranding?: boolean;
  accentColor?: string;
  isDark?: boolean;
}

export const ViralBioMartBadge: React.FC<ViralBioMartBadgeProps> = ({
  hideBranding = false,
}) => {
  if (hideBranding) return null;

  return (
    <div className="py-6 text-center space-y-2">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-content-primary transition-colors"
      >
        <span>Витрина создана на</span>
        <span className="inline-flex items-center gap-[1px]">
          <BioMartLogo className="w-5 h-5 inline-block" color="#2ECC71" />
          <span className="font-semibold text-brand hover:underline">BioMart</span>
        </span>
      </Link>

      <div className="flex items-center justify-center gap-3 text-[10px] text-content-tertiary">
        <Link href="/shipping" className="hover:text-content-secondary transition-colors">
          Доставка и оплата
        </Link>
        <span>•</span>
        <Link href="/returns" className="hover:text-content-secondary transition-colors">
          Возврат 14 дней
        </Link>
        <span>•</span>
        <Link href="/faq" className="hover:text-content-secondary transition-colors">
          Помощь
        </Link>
      </div>
    </div>
  );
};
