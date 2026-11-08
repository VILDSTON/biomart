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
} from 'lucide-react';
import { InteractivePhoneMockup } from '@/components/InteractivePhoneMockup';
import { DirectLossCalculator } from '@/components/DirectLossCalculator';
import { BioMartLogo } from '@/components/BioMartLogo';
import { SupportModal } from '@/components/SupportModal';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));

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
      a: 'Нет. Витрина открывается по ссылке прямо внутри Instagram или Telegram. Покупатель сразу видит каталог, цены и размеры, выбирает товар и подтверждает заказ в один клик.',
    },
    {
      q: 'В каком виде приходят заказы продавцу?',
      a: 'Заказы отправляются в ваш Telegram. Бот присылает готовый структурированный чек: состав заказа, выбранный размер, сумма, имя клиента, номер телефона и адрес доставки.',
    },
    {
      q: 'Как работает оплата?',
      a: 'Оплата происходит напрямую вам: переводом на карту, через Click, Payme, Uzum или наличными курьеру при получении. Платформа не удерживает комиссию с ваших продаж.',
    },
    {
      q: 'Сколько товаров можно добавить?',
      a: 'На тарифе Start — до 15 товаров бесплатно навсегда. На тарифе Plus — до 100 товаров. На тарифе Pro — без ограничений.',
    },
    {
      q: 'Как быстро витрина готова к работе?',
      a: 'Регистрация занимает 2 минуты. Вы получаете ссылку на витрину, добавляете товары и вставляете ссылку в шапку профиля Instagram.',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-page text-content-primary">
      {/* Top Navigation: sticky top-0 */}
      <nav className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[1px] font-bold text-lg sm:text-xl text-content-primary">
            <BioMartLogo className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 shrink-0" color="#1F7A5A" />
            <span className="tracking-tight">BioMart</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-[10px] border border-border bg-page hover:bg-surface-soft text-content-secondary hover:text-content-primary transition-colors shrink-0"
              title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
              aria-label="Переключить тему"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-content-secondary" />}
            </button>

            <Link
              href="/demo"
              className="text-xs sm:text-sm font-medium text-content-secondary hover:text-content-primary px-2.5 py-1.5 rounded-[10px] hover:bg-surface-soft transition-colors hidden md:inline"
            >
              Демо-витрина
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-content-secondary hover:text-content-primary px-2.5 py-1.5 rounded-[10px] hover:bg-surface-soft transition-colors hidden sm:inline"
            >
              Вход
            </Link>
            <Link
              href="/register"
              className="bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium px-2.5 xs:px-4 py-2 rounded-[10px] transition-colors shadow-xs shrink-0 whitespace-nowrap"
            >
              Создать витрину
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-3.5 sm:px-4 border-b border-border bg-page">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-[10px] bg-accent-soft text-accent text-[10px] xs:text-[11px] sm:text-xs font-semibold max-w-full">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-normal leading-tight">Витрина для Instagram и Telegram за 2 минуты</span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-5xl font-semibold tracking-tight text-content-primary leading-[1.18] sm:leading-[1.15]">
              Хватит отвечать «цена?» в директе.
            </h1>

            <p className="text-xs sm:text-base text-content-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Покупатель выбирает товар по ссылке из шапки профиля и оформляет заказ без регистрации. Вы получаете готовый чек прямо в Telegram.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-5 py-3 rounded-[10px] bg-accent hover:bg-accent-hover text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Создать витрину бесплатно</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/demo"
                className="w-full sm:w-auto px-5 py-3 rounded-[10px] bg-surface hover:bg-surface-soft text-content-primary border border-border font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Открыть демо</span>
                <ChevronRight className="w-4 h-4 text-content-secondary" />
              </Link>
            </div>

            {/* Single Calm Trust Line */}
            <div className="pt-3 text-xs text-content-secondary flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
              <span>0% комиссии с продаж</span>
              <span className="hidden xs:inline text-content-secondary/40">•</span>
              <span>Оплата в сумах Payme & Click</span>
              <span className="hidden xs:inline text-content-secondary/40">•</span>
              <span>Без привязки карт</span>
            </div>
          </div>

          {/* Right Column: Interactive Phone Mockup with Telegram Bot Receipt */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <InteractivePhoneMockup />
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <section className="border-b border-border bg-surface overflow-hidden py-3">
        <div className="flex select-none">
          <div className="animate-marquee flex items-center gap-8 text-xs font-mono text-content-secondary">
            <span>Tashkent Drip</span>
            <span>•</span>
            <span>Sakura Care</span>
            <span>•</span>
            <span>ChocoArt Tashkent</span>
            <span>•</span>
            <span>Runner Lab</span>
            <span>•</span>
            <span>Modest Line UZ</span>
            <span>•</span>
            <span>Alo Parfum</span>
            <span>•</span>
            <span>Samarkand Sweets</span>
            <span>•</span>
            <span>Urban Optic</span>
            <span>•</span>
          </div>
          <div className="animate-marquee flex items-center gap-8 text-xs font-mono text-content-secondary" aria-hidden="true">
            <span>Tashkent Drip</span>
            <span>•</span>
            <span>Sakura Care</span>
            <span>•</span>
            <span>ChocoArt Tashkent</span>
            <span>•</span>
            <span>Runner Lab</span>
            <span>•</span>
            <span>Modest Line UZ</span>
            <span>•</span>
            <span>Alo Parfum</span>
            <span>•</span>
            <span>Samarkand Sweets</span>
            <span>•</span>
            <span>Urban Optic</span>
            <span>•</span>
          </div>
        </div>
      </section>

      {/* Section: Before / After (ШАГ 1: До и После при скролле) */}
      <section className="py-14 sm:py-20 px-4 border-b border-border bg-page">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-content-primary tracking-tight">
              Как меняется прием заказов
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary">
              Сравнение ручных ответов в переписке и одного чистого заказа
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            {/* Left: Before (Хаотичный директ) */}
            <div className="bg-surface border border-border rounded-[14px] p-4 sm:p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-3 border-b border-border">
                  <span className="text-xs font-semibold text-danger flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>Было: хаос в Direct</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-danger font-medium bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded">
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

                  <div className="text-[11px] text-danger pt-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>15 минут на клиента. Часть уходит, не дождавшись ответа.</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-border text-xs text-content-secondary">
                ❌ Рутина, путаница в размерах, адреса частями, потерянные продажи.
              </div>
            </div>

            {/* Right: After (Один чистый заказ в BioMart) */}
            <div className="bg-surface border-2 border-accent rounded-[14px] p-4 sm:p-6 flex flex-col justify-between shadow-card relative">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-3 border-b border-border">
                  <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                    <span>Стало: чистый чек в Telegram</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-accent font-semibold bg-accent-soft px-2 py-0.5 rounded">
                    За 30 секунд
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
                    <span className="bg-accent-soft text-accent px-2 py-1 rounded-[6px] text-[10px] font-sans font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Готово к передаче курьеру</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-border text-xs text-accent font-medium">
                ✅ Покупатель выбирает сам без лишних вопросов. Вы сразу отправляете заказ.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Direct Loss Calculator */}
      <section className="py-14 sm:py-20 px-4 border-b border-border bg-page">
        <div className="max-w-4xl mx-auto">
          <DirectLossCalculator />
        </div>
      </section>

      {/* Section: How It Works */}
      <section className="py-14 sm:py-20 px-4 border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-content-primary tracking-tight">
              Как это работает
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary">
              Запуск витрины без программистов и сложных инструкций
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-page border border-border rounded-[14px] p-6 space-y-3">
              <div className="w-8 h-8 rounded-[10px] bg-accent text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <h3 className="text-base font-semibold text-content-primary">
                Добавьте товары
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Загрузите фото, укажите цену и размеры. Заполнение карточки занимает меньше минуты.
              </p>
            </div>

            <div className="bg-page border border-border rounded-[14px] p-6 space-y-3">
              <div className="w-8 h-8 rounded-[10px] bg-accent text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <h3 className="text-base font-semibold text-content-primary">
                Вставьте ссылку
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Разместите ссылку на витрину в шапке профиля Instagram или в Telegram-канале.
              </p>
            </div>

            <div className="bg-page border border-border rounded-[14px] p-6 space-y-3">
              <div className="w-8 h-8 rounded-[10px] bg-accent text-white flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <h3 className="text-base font-semibold text-content-primary">
                Получайте заказы
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Когда покупатель оформляет заказ, готовый чек со всеми данными сразу приходит вам в Telegram.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Tariffs */}
      <section className="py-14 sm:py-20 px-4 border-b border-border bg-page">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-content-primary tracking-tight">
              Тарифы без скрытых платежей
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary">
              Начните бесплатно, переходите на расширенный тариф при росте ассортимента
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {/* Start */}
            <div className="bg-surface border border-border rounded-[14px] p-4 sm:p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-content-primary">Start</h3>
                  <p className="text-xs text-content-secondary mt-0.5">Для быстрого теста и небольших каталогов</p>
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-content-primary">
                  0 сум <span className="text-xs font-normal text-content-secondary">навсегда</span>
                </div>
                <ul className="space-y-2 text-xs text-content-primary pt-2 border-t border-border">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>До 15 товаров в каталоге</span>
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
                className="mt-6 w-full py-2.5 rounded-[10px] bg-page hover:bg-surface-soft text-content-primary text-xs font-medium text-center transition-colors border border-border"
              >
                Начать бесплатно
              </Link>
            </div>

            {/* Plus */}
            <div className="bg-surface border-2 border-accent rounded-[14px] p-4 sm:p-6 flex flex-col justify-between relative shadow-card">
              <div className="absolute -top-3 left-6 bg-accent text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-[6px]">
                Популярный
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-content-primary">Plus</h3>
                  <p className="text-xs text-content-secondary mt-0.5">Для активных магазинов одежды и косметики</p>
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-accent">
                  59 000 сум <span className="text-xs font-normal text-content-secondary">/ месяц</span>
                </div>
                <ul className="space-y-2 text-xs text-content-primary pt-2 border-t border-border">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>До 100 товаров в каталоге</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Отключение упоминания BioMart</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Кастомные темы витрины и цвета</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Быстрый поиск и фильтры</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="mt-6 w-full py-2.5 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-semibold text-center transition-colors"
              >
                Подключить Plus
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-surface border border-border rounded-[14px] p-4 sm:p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-content-primary">Pro</h3>
                  <p className="text-xs text-content-secondary mt-0.5">Для крупных брендов и шоурумов</p>
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-content-primary">
                  129 000 сум <span className="text-xs font-normal text-content-secondary">/ месяц</span>
                </div>
                <ul className="space-y-2 text-xs text-content-primary pt-2 border-t border-border">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Безлимитное количество товаров</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>ИИ-генератор описаний товаров</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Экспорт базы заказов в Excel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Приоритетная поддержка в Telegram</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="mt-6 w-full py-2.5 rounded-[10px] bg-page hover:bg-surface-soft text-content-primary text-xs font-medium text-center transition-colors border border-border"
              >
                Выбрать Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section: FAQ */}
      <section className="py-14 sm:py-20 px-4 border-b border-border bg-page">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-content-primary tracking-tight">
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
                  className="border border-border rounded-[10px] overflow-hidden bg-surface"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-medium text-content-primary hover:bg-surface-soft transition-colors"
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

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8 px-4 text-xs text-content-secondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-[1px] font-bold text-lg sm:text-xl text-content-primary">
            <BioMartLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" color="#1F7A5A" />
            <span className="tracking-tight">BioMart</span>
          </div>

          <div className="text-center sm:text-left">
            Витрины для продавцов в Instagram и Telegram в Узбекистане
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
              className="text-[#1F7A5A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
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
