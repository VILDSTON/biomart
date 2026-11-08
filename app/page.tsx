'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  ArrowRight,
  MessageSquare,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Check,
  Zap,
  Clock,
  Package,
  Sun,
  Moon,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Smartphone,
  TrendingUp,
  Star,
  CheckCircle2,
  Sliders,
  DollarSign,
  Heart,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroVariantA } from '@/components/landing/HeroVariantA';
import { DirectLossCalculator } from '@/components/landing/DirectLossCalculator';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { MarqueeNiches } from '@/components/landing/MarqueeNiches';
import { BioMartLogo } from '@/components/BioMartLogo';
import { SupportModal } from '@/components/SupportModal';
import { PLAN_LIMITS, IS_SUBSCRIPTION_ENABLED } from '@/lib/constants';
import { testimonials } from '@/content/proof';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));

      // Ensure clean platform branding tokens on landing page (prevents theme bleeding from storefront)
      const root = document.documentElement;
      root.style.removeProperty('--store-accent');
      root.style.removeProperty('--store-accent-hover');
      root.style.removeProperty('--store-accent-soft');
      root.style.removeProperty('--store-on-accent');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-hover');
      root.style.removeProperty('--accent-soft');
      root.style.removeProperty('--accent-text');

      // If redirected from OAuth to root with ?code=, forward to auth callback handler
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      if (code) {
        window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('biomart_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('biomart_theme', 'light');
    }
  };

  const faqs = [
    {
      q: 'Нужно ли покупателям скачивать приложение?',
      a: 'Нет. Витрина открывается по ссылке прямо внутри браузера Instagram или Telegram. Покупатель сразу видит каталог, цены и размеры, выбирает товар и подтверждает заказ в один клик.',
    },
    {
      q: 'В каком виде приходят заказы продавцу?',
      a: 'Заказы моментально отправляются в ваш Telegram через бота @BioMartAssistant_bot. Вы получаете структурированный чек: состав заказа, выбранный размер, сумма, имя клиента, телефон, адрес доставки и ссылку на Яндекс Карты.',
    },
    {
      q: 'Как защищены покупатели и как работает модерация витрин?',
      a: 'Все витрины BioMart проходят обязательную модерацию перед публикацией. Мы проверяем названия, товары и контакты по стоп-листам и блокируем мошенничество, спам и контрафакт. Покупатели могут в 1 клик пожаловаться на нарушение, а оплата поступает напрямую продавцу без комиссий.',
    },
    {
      q: 'Сколько товаров можно добавить?',
      a: IS_SUBSCRIPTION_ENABLED
        ? `На тарифе Start — до ${PLAN_LIMITS.start.maxProducts} товаров бесплатно навсегда. На тарифе Plus — до ${PLAN_LIMITS.plus.maxProducts} товаров. На тарифе Pro — неограниченное количество товаров.`
        : 'На бесплатном тарифе доступно до 10 товаров в каталоге, моментальный приём заказов в Telegram, готовая ссылка для Instagram, QR-код и выбор тем оформления. Без скрытых платежей и без комиссии с продаж.',
    },
    {
      q: 'Как быстро витрина готова к работе?',
      a: 'Создание магазина занимает меньше 2 минут. Вы получаете короткую ссылку вида biomart.uz/ваш_магазин, добавляете товары и вставляете ссылку в шапку профиля Instagram и в Telegram-канал.',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-page text-content-primary transition-colors">
      {/* Sticky High-Precision Navbar (Height shrinks 64 -> 56px on scroll, blur & border) */}
      <Navbar
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Hero Section: Variant A */}
      <div id="hero">
        <HeroVariantA />
      </div>

      {/* Marquee Niches Ticker (Requirement 2) */}
      <MarqueeNiches />

      {/* Section: Before / After Comparison */}
      <section className="py-14 sm:py-20 px-4 border-b border-border bg-page">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
              <span>Сравнение опыта</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Как меняется прием заказов с BioMart
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary max-w-xl mx-auto">
              Ручная переписка отнимает часы и отпугивает клиентов. Автоматический чек экономит время и закрывает сделки.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            {/* Left: Before (Хаотичный директ) */}
            <div className="bg-surface border border-border rounded-[16px] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-3 border-b border-border">
                  <span className="text-xs font-semibold text-danger flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>Было: хаос в Direct</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-danger font-medium bg-red-100 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full">
                    Потери 2-3 часа в день
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-page border border-border p-2.5 rounded-[10px] text-xs text-content-primary max-w-[85%]">
                    «Здравствуйте! Сколько стоит худи?»
                  </div>
                  <div className="bg-accent-soft p-2.5 rounded-[10px] text-xs text-accent ml-auto max-w-[85%]">
                    «Добрый день! 320 000 сум, какой размер нужен?»
                  </div>
                  <div className="bg-page border border-border p-2.5 rounded-[10px] text-xs text-content-primary max-w-[85%]">
                    «А размер M есть? И в Самарканд отправите?»
                  </div>
                  <div className="bg-accent-soft p-2.5 rounded-[10px] text-xs text-accent ml-auto max-w-[85%]">
                    «Да, есть! Отправим BTS, напишите адрес и номер»
                  </div>
                  <div className="bg-page border border-border p-2.5 rounded-[10px] text-xs text-content-primary max-w-[85%]">
                    «Куда скинуть деньги на карту?»
                  </div>

                  <div className="text-[11px] text-danger pt-2 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>15 минут на одного клиента. Часть уходит конкурентам.</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-border text-xs text-content-secondary">
                ❌ Рутина, путаница в размерах, адреса частями, потерянные заявки.
              </div>
            </div>

            {/* Right: After (Один чистый заказ в BioMart) */}
            <div className="bg-surface border-2 border-accent rounded-[16px] p-5 sm:p-6 flex flex-col justify-between shadow-card relative">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-3 border-b border-border">
                  <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                    <span>Стало: чистый чек в Telegram</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-accent font-semibold bg-accent-soft px-2.5 py-0.5 rounded-full border border-accent/20">
                    Сразу
                  </span>
                </div>

                <div className="bg-page border border-border p-3.5 sm:p-4 rounded-[12px] space-y-2.5 text-xs font-mono">
                  <div className="flex flex-wrap items-center justify-between font-semibold text-content-primary gap-1">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>ЗАКАЗ #1042</span>
                    </span>
                    <span className="text-accent text-sm font-bold">320 000 сум</span>
                  </div>

                  <div className="space-y-1 text-content-secondary text-[11px] font-sans">
                    <div className="text-content-primary font-medium break-words">🛍 Худи Оверсайз «Ташкент» (M) × 1 шт.</div>
                    <div className="break-words">👤 Клиент: <b className="text-content-primary">Сардор Алимов</b> (+998 90 123 45 67)</div>
                    <div className="break-words">📍 Адрес: Ташкент, Чиланзар 9, д. 14, кв. 28</div>
                    <div className="break-words">🚚 Доставка: Курьер Yandex • Оплата Click</div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <span className="bg-accent-soft text-accent px-2.5 py-1 rounded-[6px] text-[10px] font-sans font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Готово к отправке курьеру</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-border text-xs text-accent font-medium">
                ✅ Покупатель оформил всё сам. Вы передаете готовый заказ курьеру за 1 минуту.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Bento Grid Features */}
      <section id="features" className="py-14 sm:py-20 px-4 border-b border-border bg-surface/50 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
              <span>Возможности BioMart</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Всё, что нужно для продаж в социальных сетях
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary max-w-xl mx-auto">
              Инструменты, созданные специально для ритейла в Узбекистане
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: 1-Click Order (Featured Wide Card) */}
            <div className="md:col-span-2 bg-surface border border-border rounded-[16px] p-6 sm:p-7 space-y-3.5 shadow-xs hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent border border-accent/20 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-content-primary">
                Быстрый заказ в 1 клик
              </h3>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-xl">
                Никаких долгих регистраций, паролей и лишних полей. Покупатель выбирает размер и указывает только имя, телефон и адрес. Конверсия выше, чем в стандартных интернет-магазинах.
              </p>
            </div>

            {/* Bento Card 2: Telegram Bot Receipt */}
            <div className="bg-surface border border-border rounded-[16px] p-6 space-y-3.5 shadow-xs hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent border border-accent/20 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-content-primary">
                Чек в Telegram сразу
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Полный состав заказа, размер, сумма и прямая ссылка на точку на Яндекс Картах для вызова курьера Yandex.
              </p>
            </div>

            {/* Bento Card 3: Direct Link & Stories */}
            <div className="bg-surface border border-border rounded-[16px] p-6 space-y-3.5 shadow-xs hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent border border-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-content-primary">
                Прямые ссылки для Stories
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Копируйте ссылку на конкретный товар с авто-открытием окна покупки: прикрепляйте стикер в Stories и конвертируйте охват в заказы.
              </p>
            </div>

            {/* Bento Card 4: Design Themes */}
            <div className="bg-surface border border-border rounded-[16px] p-6 space-y-3.5 shadow-xs hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent border border-accent/20 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-content-primary">
                Готовые темы оформления
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Стили под любую нишу: Minimal, Streetwear, Boutique, Cyber Neo. Кастомизируйте акцентные цвета, шрифты и баннеры.
              </p>
            </div>

            {/* Bento Card 5: Trust Badges & Reviews */}
            <div className="bg-surface border border-border rounded-[16px] p-6 space-y-3.5 shadow-xs hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent border border-accent/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-content-primary">
                Блок гарантий и отзывы
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Карточки преимуществ под вашу нишу («Примерка перед оплатой», «Оригинал 100%») и реальные отзывы с оценками покупателей.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Direct Loss Calculator */}
      <section id="calculator" className="py-14 sm:py-20 px-4 border-b border-border bg-page scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <DirectLossCalculator />
        </div>
      </section>

      {/* Section: Proof (Showcase Demo stores or Merchant Testimonials if available) */}
      {testimonials && testimonials.length > 0 ? (
        <section className="py-14 sm:py-20 px-4 border-b border-border bg-surface">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-accent" />
                <span>Отзывы продавцов</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
                Нам доверяют бренды в Ташкенте и регионах
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary max-w-xl mx-auto">
                Реальные истории владельцев магазинов одежды, обуви и парфюмерии
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-page border border-border rounded-[16px] p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-accent">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-xs text-content-primary leading-relaxed italic">
                      «{item.text}»
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-content-primary">{item.name}</div>
                      <div className="text-[11px] text-content-secondary">{item.shop}</div>
                    </div>
                    <span className="text-[10px] font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-full">
                      {item.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <ShowcaseSection />
      )}

      {/* Section: Tariffs with Monthly / Annual Switcher (Hidden while platform is 100% free) */}
      {IS_SUBSCRIPTION_ENABLED && (
        <section id="pricing" className="py-14 sm:py-20 px-4 border-b border-border bg-page scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
              <span>Прозрачные тарифы</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Выберите подходящий тариф
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary max-w-xl mx-auto">
              Начните бесплатно без ограничений по времени. Переходите на старшие тарифы при росте ассортимента.
            </p>

            {/* Monthly / Yearly Billing Toggle */}
            <div className="pt-3 flex items-center justify-center">
              <div className="inline-flex items-center p-1 rounded-[12px] bg-surface border border-border shadow-2xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-[9px] text-xs font-semibold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  Ежемесячно
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-1.5 rounded-[9px] text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  <span>На 1 год</span>
                  <span className="text-[10px] bg-amber-400 text-neutral-900 px-1.5 py-0.2 rounded font-bold">
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {/* Start */}
            <div className="bg-surface border border-border rounded-[16px] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-content-primary">Start</h3>
                  <p className="text-xs text-content-secondary mt-0.5">Для быстрого теста и небольших каталогов</p>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-content-primary">
                  0 сум <span className="text-xs font-normal text-content-secondary">навсегда</span>
                </div>
                <ul className="space-y-2.5 text-xs text-content-primary pt-3 border-t border-border">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>До {PLAN_LIMITS.start.maxProducts} товаров в каталоге</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Прием заказов в Telegram</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Выбор размеров и вариантов</span>
                  </li>
                  <li className="flex items-center gap-2 text-content-secondary">
                    <span>Водяной знак BioMart внизу</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="mt-6 w-full py-2.5 rounded-[10px] bg-page hover:bg-surface-soft text-content-primary text-xs font-semibold text-center transition-colors border border-border active:scale-95"
              >
                Начать бесплатно
              </Link>
            </div>

            {/* Plus */}
            <div className="bg-surface border-2 border-accent rounded-[16px] p-5 sm:p-6 flex flex-col justify-between relative shadow-card">
              <div className="absolute -top-3 left-6 bg-accent text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-2xs">
                Популярный выбор
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-content-primary">Plus</h3>
                  <p className="text-xs text-content-secondary mt-0.5">Для активных магазинов одежды и косметики</p>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-accent">
                  {billingCycle === 'yearly' ? '47 000 сум' : '59 000 сум'}{' '}
                  <span className="text-xs font-normal text-content-secondary">/ месяц</span>
                </div>
                <ul className="space-y-2.5 text-xs text-content-primary pt-3 border-t border-border">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>До 100 товаров в каталоге</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Отключение копирайта BioMart</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Кастомные темы витрины и цвета</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Блок преимуществ и отзывы покупателей</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="mt-6 w-full py-2.5 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-semibold text-center transition-all shadow-xs active:scale-95"
              >
                Подключить Plus
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-surface border border-border rounded-[16px] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-content-primary">Pro</h3>
                  <p className="text-xs text-content-secondary mt-0.5">Для брендов, шоурумов и ритейла</p>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-content-primary">
                  {billingCycle === 'yearly' ? '99 000 сум' : '129 000 сум'}{' '}
                  <span className="text-xs font-normal text-content-secondary">/ месяц</span>
                </div>
                <ul className="space-y-2.5 text-xs text-content-primary pt-3 border-t border-border">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Безлимитное количество товаров</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>ИИ-генератор продающих описаний</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Экспорт базы заказов в Excel (.xls / .csv)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Поддержка в Telegram</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="mt-6 w-full py-2.5 rounded-[10px] bg-page hover:bg-surface-soft text-content-primary text-xs font-semibold text-center transition-colors border border-border active:scale-95"
              >
                Выбрать Pro
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Section: FAQ */}
      <section id="faq" className="py-14 sm:py-20 px-4 border-b border-border bg-page scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Частые вопросы
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary">
              Ответы на главные вопросы продавцов перед стартом
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="border border-border rounded-[12px] overflow-hidden bg-surface transition-colors hover:border-accent/30"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-content-primary hover:bg-surface-soft transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-content-secondary shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-content-secondary leading-relaxed border-t border-border pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-page to-accent-soft/40 border-b border-border">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-[14px] bg-accent text-white flex items-center justify-center mx-auto shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-content-primary tracking-tight">
            Готовы перестать терять продажи в переписке?
          </h2>
          <p className="text-xs sm:text-base text-content-secondary max-w-lg mx-auto leading-relaxed">
            Создайте витрину за 2 минуты, добавьте первые товары и начните получать заказы прямо в Telegram.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-accent hover:bg-accent-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span>Создать витрину бесплатно</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-surface hover:bg-surface-soft text-content-primary border border-border font-medium text-sm flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <span>Посмотреть демо</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8 px-4 text-xs text-content-secondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-[2px] font-bold text-lg sm:text-xl text-content-primary">
            <BioMartLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" color="#1F7A5A" />
            <span className="tracking-tight">BioMart</span>
          </div>

          <div className="text-center sm:text-left text-content-secondary">
            Онлайн-витрины для Instagram и Telegram в Узбекистане
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/demo" className="hover:text-content-primary transition-colors">
              Демо
            </Link>
            <Link href="/login" className="hover:text-content-primary transition-colors">
              Вход
            </Link>
            <Link href="/register" className="hover:text-content-primary transition-colors">
              Регистрация
            </Link>
            <Link href="/terms" className="hover:text-content-primary transition-colors">
              Оферта
            </Link>
            <Link href="/privacy" className="hover:text-content-primary transition-colors">
              Конфиденциальность
            </Link>
            <button
              type="button"
              onClick={() => setIsSupportOpen(true)}
              className="text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Поддержка</span>
            </button>
          </div>
        </div>
      </footer>

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        defaultCategory="other"
      />
    </div>
  );
}
