'use client';

import React from 'react';

const NICHES = [
  'одежда',
  'обувь',
  'парфюм',
  'косметика',
  'сладости',
  'цветы',
  'аксессуары',
];

export const MarqueeNiches: React.FC = () => {
  return (
    <section className="border-b border-border bg-surface/60 overflow-hidden py-3 transition-colors">
      <div className="flex select-none">
        <div className="animate-marquee flex items-center gap-8 text-xs font-medium text-content-secondary shrink-0">
          {NICHES.map((niche, idx) => (
            <React.Fragment key={idx}>
              <span className="capitalize">{niche}</span>
              <span className="text-content-secondary/40 select-none">•</span>
            </React.Fragment>
          ))}
        </div>
        <div
          className="animate-marquee flex items-center gap-8 text-xs font-medium text-content-secondary shrink-0"
          aria-hidden="true"
        >
          {NICHES.map((niche, idx) => (
            <React.Fragment key={`clone-${idx}`}>
              <span className="capitalize">{niche}</span>
              <span className="text-content-secondary/40 select-none">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
