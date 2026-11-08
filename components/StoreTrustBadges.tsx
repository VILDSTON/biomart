'use client';

import React from 'react';
import {
  Zap,
  ShieldCheck,
  MessageCircle,
  PackageCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  Heart,
  LucideIcon,
} from 'lucide-react';
import { useBioMartStore } from '@/store/useStore';
import { StoreSettings, StoreNiche, TrustBadgeItem } from '@/types';
import { STORE_NICHE_PRESETS } from '@/lib/mock-data';

interface StoreTrustBadgesProps {
  className?: string;
  settings?: StoreSettings;
}

const ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  zap: { icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  package: { icon: PackageCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  message: { icon: MessageCircle, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
  shield: { icon: ShieldCheck, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
  clock: { icon: Clock, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  check: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  sparkles: { icon: Sparkles, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
  heart: { icon: Heart, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
};

export const StoreTrustBadges: React.FC<StoreTrustBadgesProps> = ({ className = '', settings }) => {
  const { language } = useBioMartStore();
  const isUz = language === 'uz';

  // Check if badges are hidden
  const isVisible = settings?.show_trust_badges !== false && settings?.theme_settings?.show_trust_badges !== false;
  if (!isVisible) return null;

  // 1. If seller defined custom badges, use them
  const customBadges = settings?.custom_badges || settings?.theme_settings?.custom_badges;
  if (customBadges && customBadges.length > 0) {
    return (
      <div className={`grid grid-cols-2 gap-2 my-2.5 ${className}`}>
        {customBadges.map((badge, idx) => {
          const conf = ICON_MAP[badge.icon] || ICON_MAP.zap;
          const Icon = conf.icon;
          return (
            <div
              key={badge.id || idx}
              className="p-2.5 rounded-btn bg-surface border border-border flex items-start gap-2 shadow-2xs hover:border-accent/30 transition-colors select-none"
            >
              <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 border ${conf.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[11px] font-semibold text-content-primary leading-tight truncate">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-content-secondary leading-tight mt-0.5 truncate">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 2. Otherwise use niche preset
  const niche: StoreNiche = settings?.niche || settings?.theme_settings?.niche || 'clothing';
  const nichePreset = STORE_NICHE_PRESETS.find((p) => p.id === niche) || STORE_NICHE_PRESETS[0];
  const activeList = isUz ? nichePreset.badgesUz : nichePreset.badgesRu;

  return (
    <div className={`grid grid-cols-2 gap-2 my-2.5 ${className}`}>
      {activeList.map((badge, idx) => {
        const conf = ICON_MAP[badge.icon] || ICON_MAP.zap;
        const Icon = conf.icon;
        return (
          <div
            key={badge.id || idx}
            className="p-2.5 rounded-btn bg-surface border border-border flex items-start gap-2 shadow-2xs hover:border-accent/30 transition-colors select-none"
          >
            <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 border ${conf.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] font-semibold text-content-primary leading-tight truncate">
                {badge.title}
              </h4>
              <p className="text-[10px] text-content-secondary leading-tight mt-0.5 truncate">
                {badge.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
