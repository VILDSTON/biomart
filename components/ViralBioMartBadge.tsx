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
    <div className="py-6 text-center">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-content-primary transition-colors"
      >
        <span>Витрина создана на</span>
        <span className="inline-flex items-center gap-[1px]">
          <BioMartLogo className="w-5 h-5 inline-block" color="#1F7A5A" />
          <span className="font-semibold text-brand hover:underline">BioMart</span>
        </span>
      </Link>
    </div>
  );
};
