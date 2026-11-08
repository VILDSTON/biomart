'use client';

import React from 'react';
import { Zap, ShieldCheck, MessageCircle, PackageCheck } from 'lucide-react';
import { useBioMartStore } from '@/store/useStore';

interface StoreTrustBadgesProps {
  className?: string;
}

export const StoreTrustBadges: React.FC<StoreTrustBadgesProps> = ({ className = '' }) => {
  const { language } = useBioMartStore();
  const isUz = language === 'uz';

  const badges = [
    {
      icon: Zap,
      title: isUz ? 'Tezkor yetkazish' : 'Быстрая отправка',
      desc: isUz ? 'Toshkentda 1-2 soat' : 'По Ташкенту 1-2 часа',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: PackageCheck,
      title: isUz ? 'Ko‘rib to‘lash' : 'Осмотр при получении',
      desc: isUz ? 'Buyurtmani tekshirib oling' : 'Примерка перед оплатой',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: MessageCircle,
      title: isUz ? 'To‘g‘ridan-to‘g‘ri aloqa' : 'Прямая связь',
      desc: isUz ? 'Telegram orqali 5 daqiqada' : 'Ответ в Telegram за 5 мин',
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
    {
      icon: ShieldCheck,
      title: isUz ? 'Sifat kafolati' : '100% гарантия',
      desc: isUz ? 'Haqiqiy tovar suratlari' : 'Реальные фото без обмана',
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    },
  ];

  return (
    <div className={`grid grid-cols-2 gap-2 my-2.5 ${className}`}>
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <div
            key={idx}
            className="p-2.5 rounded-btn bg-surface border border-border flex items-start gap-2 shadow-2xs hover:border-accent/30 transition-colors select-none"
          >
            <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 border ${badge.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] font-semibold text-content-primary leading-tight truncate">
                {badge.title}
              </h4>
              <p className="text-[10px] text-content-secondary leading-tight mt-0.5 truncate">
                {badge.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
