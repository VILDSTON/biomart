'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ArrowRight,
  Store,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useBioMartStore } from '@/store/useStore';
import { isSlugValid } from '@/lib/security';
import { BioMartLogo } from '@/components/BioMartLogo';
import { STORE_NICHE_PRESETS } from '@/lib/mock-data';
import { StoreNiche } from '@/types';

const NICHE_EMOJIS: Record<string, string> = {
  clothing: '👕',
  electronics: '📱',
  beauty: '✨',
  food: '🍕',
  flowers: '💐',
  universal: '🛍️',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { shops, registerShop, setActiveSlug, updateShopSettings } = useBioMartStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [instagram, setInstagram] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<StoreNiche>('clothing');
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function transliterate(str: string): string {
    const map: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h'
    };
    return str.toLowerCase().split('').map((c) => (map[c] !== undefined ? map[c] : c)).join('');
  }

  function cleanSlug(text: string): string {
    return transliterate(text)
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 30);
  }

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    if (!slug || slug === cleanSlug(storeName)) {
      setSlug(cleanSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(cleanSlug(val));
  };

  useEffect(() => {
    const trimmed = slug.trim();
    if (!trimmed) {
      setIsSlugAvailable(null);
      setSlugError('');
      return;
    }

    if (trimmed.length < 3) {
      setIsSlugAvailable(false);
      setSlugError('Укажите от 3 до 30 латинских символов');
      return;
    }

    if (!isSlugValid(trimmed)) {
      setIsSlugAvailable(false);
      setSlugError('Ссылка зарезервирована платформой или содержит запрещённые символы');
      return;
    }

    if (shops[trimmed]) {
      setIsSlugAvailable(false);
      setSlugError(`Магазин «${trimmed}» уже существует. Выберите другое имя`);
      return;
    }

    setIsSlugAvailable(true);
    setSlugError('');
  }, [slug, shops]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!storeName.trim()) {
      setErrorMsg('Укажите название вашего магазина');
      return;
    }

    if (!slug.trim()) {
      setErrorMsg('Укажите короткую ссылку для магазина');
      return;
    }

    if (isSlugAvailable === false) {
      setErrorMsg(slugError || 'Пожалуйста, укажите корректную короткую ссылку');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      registerShop(slug, storeName.trim(), instagram.trim());
      setActiveSlug(slug);

      // Save niche to settings
      updateShopSettings(slug, {
        niche: selectedNiche,
        theme_settings: {
          niche: selectedNiche,
        } as any,
      });

      sessionStorage.setItem('biomart_admin_auth', 'true');
      sessionStorage.setItem('biomart_current_slug', slug);

      // Persist to Supabase DB if configured
      try {
        await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            store_name: storeName.trim(),
            instagram_url: instagram.trim() ? `https://instagram.com/${instagram.trim().replace('@', '')}` : '',
            theme_settings: {
              niche: selectedNiche,
            },
          }),
        });
      } catch (e) {
        console.warn('Supabase store sync warning:', e);
      }

      router.push(`/dashboard?shop=${encodeURIComponent(slug)}`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Не удалось зарегистрировать магазин');
      setIsSubmitting(false);
    }
  };

  const currentNichePreset = STORE_NICHE_PRESETS.find((p) => p.id === selectedNiche) || STORE_NICHE_PRESETS[0];

  return (
    <div className="min-h-[100dvh] bg-page text-content-primary flex flex-col justify-between p-3 sm:p-6">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto pt-2 pb-4 sm:pb-6 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-1.5 font-bold text-lg sm:text-xl text-content-primary">
          <BioMartLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" color="#1F7A5A" />
          <span className="tracking-tight">BioMart</span>
        </Link>

        {/* Stepper Progress Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${
                step >= 1 ? 'bg-accent text-white shadow-xs' : 'bg-surface-soft text-content-secondary'
              }`}
            >
              1
            </span>
            <span className="hidden sm:inline text-xs font-medium text-content-primary">
              Название
            </span>
          </div>
          <div className="w-4 h-[1px] bg-border" />
          <div className="flex items-center gap-1.5">
            <span
              className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${
                step >= 2 ? 'bg-accent text-white shadow-xs' : 'bg-surface-soft text-content-secondary'
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline text-xs font-medium text-content-secondary">
              Ниша
            </span>
          </div>
        </div>
      </header>

      {/* Main 2-Column Grid (Form + Live Storefront Preview) */}
      <main className="w-full max-w-4xl mx-auto my-auto py-2 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Multi-step Form Card */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-[14px] p-5 sm:p-7 shadow-xs space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent flex items-center justify-center mb-3">
                    <Store className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
                    Создайте вашу онлайн-витрину
                  </h1>
                  <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                    Шаг 1 из 2. Придумайте название и красивую ссылку, которую покупатели увидят в шапке профиля Instagram.
                  </p>
                </div>

                <form onSubmit={handleNextStep} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-content-primary mb-1.5">
                      Название магазина или бренда <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={storeName}
                      onChange={(e) => handleStoreNameChange(e.target.value)}
                      placeholder="Например: Sakura Studio, Tashkent Drip"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-page border border-border text-xs sm:text-sm text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-content-primary">
                        Короткая ссылка на магазин <span className="text-danger">*</span>
                      </label>
                      {isSlugAvailable === true && (
                        <span className="text-[11px] font-semibold text-accent flex items-center gap-1 bg-accent-soft px-2 py-0.5 rounded-full">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Ссылка свободна</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center rounded-[10px] bg-page border border-border overflow-hidden focus-within:border-accent transition-colors">
                      <span className="pl-3.5 pr-1 py-2.5 text-xs font-medium text-content-secondary font-mono select-none">
                        biomart.uz/
                      </span>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="vash_magazin"
                        className="flex-1 min-w-0 pr-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-content-primary font-mono focus:outline-none placeholder:text-content-secondary"
                      />
                    </div>
                    {isSlugAvailable === false && slugError && (
                      <p className="text-[11px] font-medium text-danger mt-1.5 break-words">
                        {slugError}
                      </p>
                    )}
                    <p className="text-[10px] text-content-secondary mt-1">
                      Латинские буквы, цифры и знак подчеркивания (как ник в Instagram)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-content-primary mb-1.5">
                      Instagram ник <span className="text-content-secondary font-normal">(необязательно)</span>
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@vash_brand"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-page border border-border text-xs sm:text-sm text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-[10px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-danger text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="break-words">{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSlugAvailable === false || !storeName.trim() || !slug.trim()}
                    className="w-full py-3 rounded-[10px] bg-accent hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                  >
                    <span>Далее: Выбрать нишу магазина</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 text-xs text-content-secondary hover:text-content-primary font-medium mb-3 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Назад к названию</span>
                  </button>
                  <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
                    Выберите категорию вашего бизнеса
                  </h1>
                  <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                    Шаг 2 из 2. Мы настроим блок доверия покупателей и готовые карточки преимуществ под вашу нишу.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {STORE_NICHE_PRESETS.map((n) => {
                      const isSelected = selectedNiche === n.id;
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => setSelectedNiche(n.id)}
                          className={`p-3 rounded-[10px] border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-accent-soft/50 border-accent shadow-xs'
                              : 'bg-page border-border hover:border-accent/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{NICHE_EMOJIS[n.id] || '🛍️'}</span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-content-primary block leading-tight">
                              {n.titleRu}
                            </span>
                            <span className="text-[10px] text-content-secondary block truncate mt-0.5">
                              {n.badgesRu[0]?.title} • {n.badgesRu[1]?.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-[10px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-danger text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="break-words">{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-[10px] bg-accent hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Запускаем витрину...</span>
                    ) : (
                      <>
                        <span>Открыть витрину и войти в кабинет</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Live Interactive Storefront Preview */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-[14px] p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-semibold text-content-primary flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-accent" />
                <span>Живой предпросмотр витрины</span>
              </span>
              <span className="text-[10px] font-mono text-content-secondary bg-surface-soft px-2 py-0.5 rounded-full">
                biomart.uz/{slug || '...'}
              </span>
            </div>

            {/* Mini Phone Card Mockup */}
            <div className="rounded-[12px] bg-page border border-border p-3.5 space-y-3">
              {/* Store Header Mock */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[10px] bg-accent text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {(storeName.trim() || 'BM').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-content-primary truncate">
                    {storeName.trim() || 'Название вашего магазина'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-content-secondary">
                    <span className="text-accent font-medium">{currentNichePreset.titleRu}</span>
                    {instagram && (
                      <>
                        <span>•</span>
                        <span className="truncate">{instagram}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Badges Preview matching the selected niche */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {currentNichePreset.badgesRu.slice(0, 2).map((b, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-[8px] bg-surface border border-border/80 flex items-start gap-1.5"
                  >
                    <div className="w-5 h-5 rounded-[5px] bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <Zap className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-content-primary leading-tight truncate">
                        {b.title}
                      </p>
                      <p className="text-[9px] text-content-secondary leading-tight truncate mt-0.5">
                        {b.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample Product Cards Preview */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider block">
                  Пример каталога:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
                    <div className="w-full h-16 rounded-[6px] bg-surface-soft flex items-center justify-center text-xl mb-1.5">
                      {NICHE_EMOJIS[currentNichePreset.id] || '🛍️'}
                    </div>
                    <p className="text-[10px] font-semibold text-content-primary truncate">Товар #1</p>
                    <p className="text-[10px] text-accent font-bold mt-0.5">180 000 сум</p>
                  </div>
                  <div className="p-2 rounded-[8px] bg-surface border border-border flex flex-col justify-between">
                    <div className="w-full h-16 rounded-[6px] bg-surface-soft flex items-center justify-center text-xl mb-1.5">
                      {NICHE_EMOJIS[currentNichePreset.id] || '🛍️'}
                    </div>
                    <p className="text-[10px] font-semibold text-content-primary truncate">Товар #2</p>
                    <p className="text-[10px] text-accent font-bold mt-0.5">250 000 сум</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-content-secondary leading-relaxed">
              💡 После создания магазина вы сможете изменить тему оформления, цвета, добавить свои товары и подключить Telegram-бота для заказов.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-3 text-center text-xs text-content-secondary flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border mt-4">
        <span>© {new Date().getFullYear()} BioMart — онлайн-витрины для продавцов в Узбекистане</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-content-primary transition-colors">
            Главная
          </Link>
          <Link href="/demo" className="hover:text-content-primary transition-colors">
            Демо витрина
          </Link>
        </div>
      </footer>
    </div>
  );
}
