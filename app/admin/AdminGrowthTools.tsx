'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Rocket,
  Zap,
  Megaphone,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Store,
  Sparkles,
  Save,
  MessageSquare,
} from 'lucide-react';
import { GlobalBannerSettings } from '@/lib/platform-settings';

export function AdminGrowthTools() {
  // Quick Store Form state
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [telegram, setTelegram] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'clothes' | 'shoes' | 'perfume' | 'beauty' | 'electronics'>('clothes');
  const [partnerCode, setPartnerCode] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    store: { id: string; slug: string; store_name: string; store_url: string; admin_password: string };
    outbound_pitch: string;
  } | null>(null);

  const [copiedPitch, setCopiedPitch] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Global Banner Form state
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [bannerLink, setBannerLink] = useState('/dashboard?tab=tariff');
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [bannerSaved, setBannerSaved] = useState(false);

  // Load existing global banner settings
  const loadBannerSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/platform/settings');
      if (res.ok) {
        const json = await res.json();
        const banner: GlobalBannerSettings = json?.settings?.global_banner;
        if (banner) {
          setBannerActive(Boolean(banner.is_active));
          setBannerText(banner.text || '');
          setBannerLink(banner.link || '/dashboard?tab=tariff');
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadBannerSettings();
  }, [loadBannerSettings]);

  const handleNameChange = (val: string) => {
    setStoreName(val);
    if (!slug || slug === autoSlug(storeName)) {
      setSlug(autoSlug(val));
    }
  };

  const autoSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яё_-]/gi, '_')
      .replace(/[а-яё]/gi, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleCreateQuickStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsCreating(true);

    try {
      const res = await fetch('/api/admin/quick-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName.trim(),
          slug: slug.trim(),
          telegram: telegram.trim(),
          phone: phone.trim(),
          category,
          partner_code: partnerCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка создания магазина');
      }

      setCreatedResult(data);
      // Reset form fields
      setStoreName('');
      setSlug('');
      setTelegram('');
      setPhone('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка создания магазина');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBanner(true);
    setBannerSaved(false);

    try {
      const res = await fetch('/api/platform/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'global_banner',
          value: {
            is_active: bannerActive,
            text: bannerText.trim(),
            link: bannerLink.trim(),
          },
        }),
      });

      if (res.ok) {
        setBannerSaved(true);
        setTimeout(() => setBannerSaved(false), 3000);
      }
    } catch (err) {
      console.warn('Failed to save banner', err);
    } finally {
      setIsSavingBanner(false);
    }
  };

  const copyPitchToClipboard = () => {
    if (!createdResult?.outbound_pitch) return;
    navigator.clipboard.writeText(createdResult.outbound_pitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
            <Rocket className="w-5 h-5 text-accent" />
            <span>Инструменты роста и холодных продаж (Growth & Outbound)</span>
          </h2>
          <p className="text-xs text-content-secondary">
            Быстрое создание готовых витрин для рассылок в Instagram Direct, баннеры и экспорт
          </p>
        </div>

        {/* CSV Export Button */}
        <a
          href="/api/admin/export-csv"
          download
          className="min-h-[44px] px-4 py-2 rounded-btn bg-page border border-border hover:bg-surface text-content-primary text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-accent" />
          <span className="hidden sm:inline">Выгрузить базу в CSV</span>
          <span className="sm:hidden">CSV</span>
        </a>
      </div>

      {/* 1. TURNKEY QUICK STORE GENERATOR FOR INSTAGRAM DIRECT */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Создание витрины «под ключ» за 10 секунд (Холодные продажи)</span>
            </h3>
            <p className="text-[11px] text-content-secondary">
              Создает магазин с готовыми товарами и генерирует персональное сообщение для Instagram Direct
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-accent-soft text-accent">
            Outbound
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-[8px] bg-danger/10 border border-danger/20 text-danger text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreateQuickStore} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Название бренда / магазина
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Dior Tashkent"
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Адрес витрины (slug)
              </label>
              <div className="flex items-center">
                <span className="px-2.5 py-2.5 bg-page border-y border-l border-border rounded-l-btn text-xs text-content-secondary font-mono">
                  biomart.uz/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="dior_tashkent"
                  className="w-full px-3 py-2.5 rounded-r-btn bg-page border border-border text-base sm:text-xs text-content-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Категория (авто-наполнение товарами)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary focus:outline-none focus:border-accent"
              >
                <option value="clothes">Одежда и Streetwear (Худи, Футболки)</option>
                <option value="shoes">Обувь и Кроссовки (Сникеры, Кеды)</option>
                <option value="perfume">Парфюм и Ароматы (Селектив)</option>
                <option value="beauty">Косметика и Уход (Бьюти)</option>
                <option value="electronics">Электроника и Гаджеты (Наушники)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Telegram владельца (@username)
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@dior_uzbekistan"
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Телефон владельца (необязательно)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Код партнёра / таргетолога
              </label>
              <input
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                placeholder="PROMO2026"
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating || !storeName.trim() || !slug.trim()}
            className="min-h-[44px] px-6 py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Создание витрины и товаров...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Создать витрину и сгенерировать оффер</span>
              </>
            )}
          </button>
        </form>

        {/* CREATED RESULT CARD WITH COPY BUTTON */}
        {createdResult && (
          <div className="p-4 sm:p-5 rounded-[12px] bg-page border-2 border-accent/40 space-y-3 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-content-primary">
                  Витрина «{createdResult.store.store_name}» готова к отправке клиенту!
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={createdResult.store.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Проверить витрину</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-[8px] bg-surface border border-border">
                <span className="text-[10px] text-content-secondary block">Ссылка на витрину:</span>
                <span className="font-mono font-bold text-content-primary break-all">
                  {createdResult.store.store_url}
                </span>
              </div>
              <div className="p-2.5 rounded-[8px] bg-surface border border-border">
                <span className="text-[10px] text-content-secondary block">Сгенерированный пароль входа:</span>
                <span className="font-mono font-bold text-accent">
                  {createdResult.store.admin_password}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-content-secondary mb-1 flex items-center justify-between">
                <span>Готовое сообщение для отправки в Instagram Direct / Telegram:</span>
                <button
                  type="button"
                  onClick={copyPitchToClipboard}
                  className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-accent" />
                      <span>Скопировано в буфер!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Скопировать текст оффера</span>
                    </>
                  )}
                </button>
              </label>

              <textarea
                readOnly
                rows={8}
                value={createdResult.outbound_pitch}
                className="w-full p-3 rounded-btn bg-surface border border-border text-xs text-content-primary font-sans leading-relaxed focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. GLOBAL PLATFORM ANNOUNCEMENT BANNER */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-accent" />
              <span>Глобальный баннер-объявление в кабинетах продавцов</span>
            </h3>
            <p className="text-[11px] text-content-secondary">
              Выводит верхнюю полоску с акцией или новостью во всех кабинетах продавцов BioMart (/dashboard)
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBanner} className="space-y-4 pt-1">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-page border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
            </label>
            <span className="text-xs font-semibold text-content-primary">
              {bannerActive ? 'Баннер включён и виден всем продавцам' : 'Баннер выключен'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-content-secondary mb-1">
                Текст объявления
              </label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="🚀 Скидка 20% при оплате тарифа Pro на 3 месяца! Напишите в поддержку для активации."
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1">
                Ссылка перехода (необязательно)
              </label>
              <input
                type="text"
                value={bannerLink}
                onChange={(e) => setBannerLink(e.target.value)}
                placeholder="/dashboard?tab=tariff"
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSavingBanner}
              className="min-h-[44px] px-5 py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isSavingBanner ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Сохранить баннер</span>
                </>
              )}
            </button>

            {bannerSaved && (
              <span className="text-xs text-accent font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Баннер сохранен и применен!</span>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
