'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Send, Phone, ShieldCheck, Check, Store, Zap, ChevronDown, Bell } from 'lucide-react';
import { StoreSettings } from '@/types';
import { useBioMartStore } from '@/store/useStore';
import { translations } from '@/lib/i18n';

interface StoreHeaderProps {
  settings: StoreSettings;
  isDemo?: boolean;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ settings, isDemo = false }) => {
  const [avatarError, setAvatarError] = useState(false);
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { language, setLanguage } = useBioMartStore();
  const t = translations[language];

  const hasBanner = Boolean(settings.banner_url);
  const customAccent = settings.accent_color || '#1F7A5A';

  React.useEffect(() => {
    setAvatarError(false);
  }, [settings.avatar_url]);

  const cleanTg = settings.telegram_username ? settings.telegram_username.replace('@', '') : '';
  const tgInquiryText = language === 'uz'
    ? 'Assalomu alaykum! Mahsulotlar va yetkazib berish haqida ma‘lumot olmoqchiman'
    : 'Здравствуйте! Хочу уточнить детали по товарам и доставке';

  const tgInquiryUrl = cleanTg
    ? `https://t.me/${cleanTg}?text=${encodeURIComponent(tgInquiryText)}`
    : 'https://t.me/biomart_support';

  const desc = settings.description || '';
  const isLongDescription = desc.length > 80;

  return (
    <header className="relative bg-surface border-b border-border text-content-primary transition-colors">
      {/* Top Demo Banner if demo */}
      {isDemo && (
        <div className="bg-accent-soft border-b border-accent/20 py-1.5 px-3 flex items-center justify-between text-xs text-accent font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Store className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">Демо-витрина <b>{settings.store_name}</b></span>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 text-accent underline font-semibold hover:opacity-80 text-[11px]"
            aria-label="Перейти в панель управления магазином"
          >
            Управление →
          </Link>
        </div>
      )}

      {/* Hero Banner Cover */}
      {hasBanner && (
        <div className="relative aspect-[3/1] w-full bg-page overflow-hidden border-b border-border">
          <Image
            src={settings.banner_url!}
            alt={`${settings.store_name} banner`}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}

      <div className={`p-4 ${hasBanner ? 'pt-3' : 'pt-4'}`}>
        {/* Profile Row: Avatar & Title */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-[64px] h-[64px] min-w-[64px] min-h-[64px] rounded-card overflow-hidden relative border border-border bg-page shadow-xs">
              {settings.avatar_url && !avatarError ? (
                <Image
                  src={settings.avatar_url}
                  alt={settings.store_name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  priority
                  unoptimized
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-semibold text-xl select-none bg-accent text-accent-text"
                >
                  {settings.store_name ? settings.store_name.slice(0, 2).toUpperCase() : 'BM'}
                </div>
              )}
            </div>
          </div>

          {/* Title & Controls */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 truncate">
                <h1 className="text-base font-semibold text-content-primary truncate tracking-tight">
                  {settings.store_name}
                </h1>
                <span
                  title={language === 'uz' ? 'BioMart tomonidan tasdiqlangan ishonchli do‘kon' : 'Проверенный продавец платформы BioMart'}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand-soft text-brand text-[10px] font-semibold border border-brand-border shrink-0 select-none shadow-2xs"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span className="hidden xs:inline text-[9px] sm:text-[10px]">
                    {language === 'uz' ? 'BioMart tasdiqlagan' : 'подтверждено BioMart'}
                  </span>
                </span>
              </div>

              {/* Header Right: Language Switcher (RU | UZ) */}
              <div className="flex items-center rounded-[10px] p-0.5 text-[10px] font-medium border border-border bg-page">
                <button
                  type="button"
                  onClick={() => setLanguage('ru')}
                  className={`px-2 py-0.5 rounded-[8px] transition-colors ${
                    language === 'ru'
                      ? 'bg-surface text-content-primary font-semibold border border-border shadow-xs'
                      : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  RU
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('uz')}
                  className={`px-2 py-0.5 rounded-[8px] transition-colors ${
                    language === 'uz'
                      ? 'bg-surface text-content-primary font-semibold border border-border shadow-xs'
                      : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  UZ
                </button>
              </div>
            </div>

            {/* BUG 7 FIX: Description with line-clamp and 'Ещё' button without hard substring truncation */}
            {desc && (
              <div className="mt-1">
                <p
                  className={`text-xs text-content-secondary leading-relaxed overflow-wrap-anywhere ${
                    !isDescriptionExpanded && isLongDescription ? 'line-clamp-2' : ''
                  }`}
                >
                  {desc}
                </p>
                {isLongDescription && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-[11px] font-semibold text-accent hover:underline mt-0.5 inline-block"
                  >
                    {isDescriptionExpanded ? (language === 'uz' ? 'Yopish' : 'Свернуть') : (language === 'uz' ? 'Ko‘proq...' : 'Ещё...')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Instagram, Telegram, Phone (Touch targets min-h-[40px]) */}
        <div className="flex items-center gap-2 mt-3.5">
          {settings.instagram_url && (
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Открыть Instagram страницу магазина"
              className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-btn text-xs font-semibold border border-border bg-surface hover:bg-surface-soft text-content-primary transition-colors truncate active:scale-[0.98] shadow-xs"
            >
              <Instagram className="w-3.5 h-3.5 text-content-primary shrink-0" />
              <span className="truncate">Instagram</span>
            </a>
          )}

          <a
            href={tgInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-btn text-xs font-semibold border border-border bg-surface hover:bg-surface-soft text-content-primary transition-colors truncate active:scale-[0.98] shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">Telegram</span>
          </a>

          {settings.phone && (
            <a
              href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
              aria-label={`Позвонить по номеру ${settings.phone}`}
              className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-btn text-xs font-semibold border border-border bg-surface hover:bg-surface-soft text-content-primary transition-colors truncate active:scale-[0.98] shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{language === 'uz' ? 'Qo‘ng‘iroq' : 'Позвонить'}</span>
            </a>
          )}
        </div>

        {/* Announcement Banner (Design Setting 8) */}
        {settings.announcement_active && settings.announcement_text && (
          <div className="mt-3 py-2 px-3 rounded-btn border border-accent/20 bg-accent-soft text-accent text-xs font-medium flex items-center gap-2 shadow-xs">
            <Bell className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="overflow-wrap-anywhere">{settings.announcement_text}</span>
          </div>
        )}

        {/* Delivery Notice */}
        {settings.delivery_info && (
          <button
            type="button"
            onClick={() => setIsDeliveryExpanded(!isDeliveryExpanded)}
            className="w-full mt-2.5 py-2 px-3 rounded-btn border border-border bg-page flex items-center justify-between text-left gap-2 text-xs text-content-primary hover:bg-surface-soft transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className={isDeliveryExpanded ? 'leading-relaxed' : 'truncate text-content-secondary'}>
                {settings.delivery_info}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-content-secondary shrink-0 transition-transform ${
                isDeliveryExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>
    </header>
  );
};
