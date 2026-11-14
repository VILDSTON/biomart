'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Send, Phone, ShieldCheck, Check, Zap, ChevronDown, Bell, Flag, Youtube, Globe, Link2, ArrowUpRight } from 'lucide-react';
import { StoreSettings } from '@/types';
import { useBioMartStore } from '@/store/useStore';
import { translations } from '@/lib/i18n';
import { ComplaintModal } from '@/components/ComplaintModal';

interface StoreHeaderProps {
  settings: StoreSettings;
  isDemo?: boolean;
  totalProducts?: number;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ settings, isDemo = false, totalProducts }) => {
  const [avatarError, setAvatarError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const { language, setLanguage } = useBioMartStore();
  const t = translations[language];

  const hasBanner = Boolean(settings.banner_url);
  const customAccent = settings.accent_color || '#1F7A5A';

  React.useEffect(() => {
    setAvatarError(false);
  }, [settings.avatar_url]);

  const cleanTg = settings.telegram_username ? settings.telegram_username.replace('@', '').trim() : '';
  const tgInquiryText = language === 'uz'
    ? 'Assalomu alaykum! Mahsulotlar va yetkazib berish haqida ma‘lumot olmoqchiman'
    : 'Здравствуйте! Хочу уточнить детали по товарам и доставке';

  const tgInquiryUrl = cleanTg
    ? `https://t.me/${cleanTg}?text=${encodeURIComponent(tgInquiryText)}`
    : '';

  const desc = settings.description || '';
  const isLongDescription = desc.length > 80;

  return (
    <header className="relative bg-surface border-b border-border text-content-primary transition-colors">

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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold text-content-primary tracking-tight truncate">
                  {settings.store_name}
                </h1>
                {!isDemo && Boolean(settings.is_verified) && (
                  <span
                    title={language === 'uz' ? 'BioMart tomonidan tasdiqlangan ishonchli do‘kon' : 'Проверенный продавец BioMart'}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent text-white shrink-0 select-none shadow-2xs"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Header Right: Language Switcher (RU | UZ) & Complaint */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsComplaintOpen(true)}
                  title={language === 'uz' ? 'Shikoyat qilish' : 'Пожаловаться модераторам'}
                  className="p-1.5 rounded-[8px] text-content-secondary hover:text-red-500 hover:bg-page transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>

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
        {(Boolean(settings.instagram_url) || Boolean(cleanTg) || Boolean(settings.phone)) && (
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

            {cleanTg && (
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
            )}

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
        )}

        {/* Custom Quick Links Buttons (configured in Dashboard -> Ссылки) */}
        {settings.custom_links && settings.custom_links.filter((l) => l.is_active).length > 0 && (
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {settings.custom_links
                .filter((l) => l.is_active)
                .map((link) => {
                  const IconComponent =
                    link.icon === 'telegram'
                      ? Send
                      : link.icon === 'instagram'
                      ? Instagram
                      : link.icon === 'youtube'
                      ? Youtube
                      : link.icon === 'phone'
                      ? Phone
                      : Globe;

                  const isPhone = link.icon === 'phone' || link.url.startsWith('tel:');

                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target={isPhone ? undefined : '_blank'}
                      rel={isPhone ? undefined : 'noopener noreferrer'}
                      className="min-h-[42px] px-3.5 py-2 rounded-btn bg-surface hover:bg-surface-soft border border-border text-content-primary flex items-center justify-between gap-2.5 text-xs font-semibold transition-all hover:border-accent/50 active:scale-[0.99] shadow-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-[7px] bg-accent-soft text-accent flex items-center justify-center shrink-0">
                          <IconComponent className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <span className="truncate">{link.title}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-content-secondary group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </a>
                  );
                })}
            </div>
          </div>
        )}

        {/* Announcement Banner (Design Setting 8) */}
        {settings.announcement_active && settings.announcement_text && (
          <div className="mt-3 py-2 px-3 rounded-btn border border-accent/20 bg-accent-soft text-accent text-xs font-medium flex items-center gap-2 shadow-xs">
            <Bell className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="overflow-wrap-anywhere">{settings.announcement_text}</span>
          </div>
        )}

        {/* Complaint Modal */}
        <ComplaintModal
          isOpen={isComplaintOpen}
          onClose={() => setIsComplaintOpen(false)}
          storeSlug={settings.slug}
          storeName={settings.store_name}
        />
      </div>
    </header>
  );
};
