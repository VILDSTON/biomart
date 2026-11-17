'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  HelpCircle,
  Search,
  ChevronDown,
  Store,
  Bot,
  ShieldCheck,
  Send,
  Zap,
  CreditCard,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';
import { SupportModal } from '@/components/SupportModal';

interface FaqItem {
  id: string;
  category: 'start' | 'telegram' | 'marty' | 'payments' | 'customization';
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  // 1. Быстрый старт
  {
    id: 's1',
    category: 'start',
    question: 'Как создать свою онлайн-витрину в BioMart?',
    answer: 'Перейдите на страницу регистрации (/register), укажите название вашего бренда (например, Tashkent Drip), выберите удобный URL-адрес (slug) и задайте пароль администратора. Ваша персональная мобильная витрина готова к работе менее чем за 2 минуты без программистов и сложных конструкторов.',
  },
  {
    id: 's2',
    category: 'start',
    question: 'Нужен ли программист или дизайнер для запуска магазина?',
    answer: 'Нет, совершенно не нужен. Платформа BioMart уже оптимизирована под мобильный трафик из Instagram и Telegram. Вы получаете готовый каталог с корзиной, оформлением заказа в 1 клик и адаптацией под любые телефоны.',
  },
  {
    id: 's3',
    category: 'start',
    question: 'Как прикрепить витрину к профилю в Instagram и Telegram?',
    answer: 'Скопируйте вашу персональную ссылку вида biomart.uz/ваш_магазин (или ссылку из панели управления). Вставьте её в поле «Сайт» (Link in Bio) в шапке профиля Instagram, а также закрепите в описании вашего Telegram-канала или группы.',
  },

  // 2. Telegram и заказы
  {
    id: 't1',
    category: 'telegram',
    question: 'Куда и как приходят уведомления о новых заказах?',
    answer: 'Каждый оформленный покупателем заказ мгновенно отправляется в ваш личный Telegram или рабочий канал через официального бота @BioMartAssistant_bot. В чеке указано имя покупателя, активная ссылка на номер телефона (для звонка или Telegram-диалога), состав корзины, выбранные размеры/цвета и прямая ссылка на локацию в Яндекс Картах для курьера.',
  },
  {
    id: 't2',
    category: 'telegram',
    question: 'Как привязать мой Telegram Chat ID к магазину?',
    answer: 'В панели управления магазином (Dashboard) перейдите в раздел «Настройки витрины» и укажите ваш Telegram Chat ID. Чтобы узнать свой Chat ID, напишите нашему боту @BioMartAssistant_bot команду /start — бот сразу пришлет ваш уникальный номер.',
  },
  {
    id: 't3',
    category: 'telegram',
    question: 'Могут ли несколько менеджеров получать уведомления о заказах?',
    answer: 'Да! Вы можете указать Chat ID закрытой Telegram-группы вашего магазина, добавив туда бота @BioMartAssistant_bot. В таком случае вся команда и курьеры будут синхронно видеть новые заказы в реальном времени.',
  },

  // 3. AI-ассистент Марти (Marty)
  {
    id: 'm1',
    category: 'marty',
    question: 'Кто такой AI-консультант Марти и как он помогает продавцу?',
    answer: 'Марти — это встроенный интеллектуальный AI-продавец на базе Google Studio. Он работает на вашей витрине 24/7: отвечает на частые вопросы покупателей о наличии товаров, размерах, материалах и условиях, а также самостоятельно принимает заказы прямо в переписке, когда вы спите или заняты.',
  },
  {
    id: 'm2',
    category: 'marty',
    question: 'На каких языках общается Марти с покупателями?',
    answer: 'Марти свободно владеет как русским, так и узбекским языками («Assalomu alaykum!»). Он автоматически определяет язык, на котором пишет покупатель, и ведет вежливый диалог на родном языке клиента.',
  },
  {
    id: 'm3',
    category: 'marty',
    question: 'Как Марти автоматически оформляет заказ покупателя?',
    answer: 'Когда покупатель пишет в чат «Хочу заказать черную футболку размера XL, меня зовут Дильшод...», Марти бережно уточняет адрес и телефон, подтверждает детали и мгновенно регистрирует официальный заказ в вашей панели, отправляя уведомление в ваш Telegram.',
  },
  {
    id: 'm4',
    category: 'marty',
    question: 'Есть ли дневной лимит на работу Марти?',
    answer: 'Да, для защиты от перерасхода квоты и нецелевого спама установлен лимит до 50 диалоговых запросов в день на витрину. В шапке виджета Марти отображается актуальный счетчик оставшихся сообщений.',
  },

  // 4. Платежи и комиссии
  {
    id: 'p1',
    category: 'payments',
    question: 'Берет ли BioMart комиссию с моих продаж?',
    answer: 'Нет! BioMart не удерживает процент с продаж продавца. Все 100% выручки остаются у вас. Оплата за товары поступает напрямую на ваши реквизиты Click, Payme или наличными курьеру.',
  },
  {
    id: 'p2',
    category: 'payments',
    question: 'Как настроить способы оплаты для покупателей?',
    answer: 'В панели продавца вы можете включить необходимые способы: Click Evolution, Payme, Uzum Bank или оплату курьеру при получении. Вы также можете указать номер карты или бизнес-счет для прямых переводов.',
  },
  {
    id: 'p3',
    category: 'payments',
    question: 'Как организовать доставку заказов по Ташкенту и Узбекистану?',
    answer: 'Продавцы на BioMart чаще всего используют сервис Яндекс Доставка (экспресс-доставка по городу за 1–2 часа) и междугородние службы доставки (BTS Почта, EMU) для отправки в Самарканд, Бухару, Андижан и другие области.',
  },

  // 5. Кастомизация и управление
  {
    id: 'c1',
    category: 'customization',
    question: 'Можно ли изменить дизайн, логотип и цвета витрины?',
    answer: 'Да! В разделе «Дизайн витрины» панели управления доступен визуальный редактор: выбор готовых стилей (Минимал, Streetwear, Тёплый, Cyber, Бутик), загрузка логотипа и баннера, выбор основного акцентного цвета (например, фирменный #1F7A5A) и настройка радиуса скругления кнопок.',
  },
  {
    id: 'c2',
    category: 'customization',
    question: 'Как добавить скидки и старую перечеркнутую цену?',
    answer: 'При добавлении или редактировании товара вы можете указать текущую цену и старую цену. Система автоматически рассчитает размер скидки и покажет яркий бейдж «-25%» в каталоге, стимулируя импульсивные покупки.',
  },
  {
    id: 'c3',
    category: 'customization',
    question: 'Как восстановить доступ к панели, если забыли пароль?',
    answer: 'Нажмите кнопку «Забыли пароль» на странице входа (/login) или обратитесь в службу технической поддержки через официальный Telegram-бот @BioMartAssistant_bot с подтвержденного Chat ID владельца.',
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'start' | 'telegram' | 'marty' | 'payments' | 'customization'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ s1: true, t1: true, m1: true });
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-page text-content-primary">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-content-primary">
            <BioMartLogo className="w-8 h-8" color="#1F7A5A" />
            <span>BioMart</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-content-secondary hover:text-content-primary transition-colors hidden sm:block"
            >
              Панель продавца
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>На главную</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-12 sm:py-16 px-4 border-b border-border bg-surface">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft text-accent text-xs font-semibold">
            <Store className="w-4 h-4" />
            <span>FAQ для продавцов и владельцев магазинов</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary">
            Часто задаваемые вопросы
          </h1>

          <p className="text-sm sm:text-base text-content-secondary max-w-xl mx-auto">
            Всё о запуске онлайн-витрины, получении чеков в Telegram, приеме оплат и настройке умного AI-продавца Марти.
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-content-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по вопросам для продавцов..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-page border border-border text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
              activeCategory === 'all'
                ? 'bg-accent text-white'
                : 'bg-surface hover:bg-surface-soft border border-border text-content-secondary'
            }`}
          >
            Все темы ({FAQ_DATA.length})
          </button>
          <button
            onClick={() => setActiveCategory('start')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
              activeCategory === 'start'
                ? 'bg-accent text-white'
                : 'bg-surface hover:bg-surface-soft border border-border text-content-secondary'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Старт витрины</span>
          </button>
          <button
            onClick={() => setActiveCategory('telegram')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
              activeCategory === 'telegram'
                ? 'bg-accent text-white'
                : 'bg-surface hover:bg-surface-soft border border-border text-content-secondary'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram & Заказы</span>
          </button>
          <button
            onClick={() => setActiveCategory('marty')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
              activeCategory === 'marty'
                ? 'bg-accent text-white'
                : 'bg-surface hover:bg-surface-soft border border-border text-content-secondary'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Марти</span>
          </button>
          <button
            onClick={() => setActiveCategory('payments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
              activeCategory === 'payments'
                ? 'bg-accent text-white'
                : 'bg-surface hover:bg-surface-soft border border-border text-content-secondary'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Оплата & Комиссия</span>
          </button>
          <button
            onClick={() => setActiveCategory('customization')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
              activeCategory === 'customization'
                ? 'bg-accent text-white'
                : 'bg-surface hover:bg-surface-soft border border-border text-content-secondary'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Дизайн</span>
          </button>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border rounded-2xl p-6">
              <HelpCircle className="w-10 h-10 text-content-tertiary mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-content-primary">Ничего не найдено</p>
              <p className="text-xs text-content-secondary mt-1">
                Попробуйте изменить поисковый запрос или напишите нашей поддержке.
              </p>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = !!openItems[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-surface border border-border rounded-xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    className="w-full text-left px-4 py-3.5 sm:px-5 sm:py-4 min-h-12 flex items-center justify-between gap-4 font-medium text-sm text-content-primary hover:bg-surface-soft/50 transition-colors cursor-pointer select-none"
                  >
                    <span className="leading-snug">{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-content-secondary shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-accent' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-answer-${item.id}`}
                      role="region"
                      className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-content-secondary leading-relaxed border-t border-border/50 animate-smooth-in"
                    >
                      <div className="pt-3">{item.answer}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* CTA Banner for Sellers */}
        <div className="bg-gradient-to-r from-accent/10 via-surface to-accent/5 border border-accent/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-content-primary">
              Готовы запустить свой магазин?
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary max-w-md">
              Создайте персональную витрину за 2 минуты и получайте заказы прямо в Telegram.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSupportOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-soft text-content-primary text-xs font-semibold transition-colors"
            >
              Задать вопрос
            </button>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:brightness-105 transition-all shadow-md active:scale-95"
            >
              Создать витрину
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center text-xs text-content-tertiary">
        <p>© 2026 BioMart. Онлайн-витрины для продавцов Instagram и Telegram в Узбекистане.</p>
      </footer>

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        defaultCategory="other"
      />
    </div>
  );
}
