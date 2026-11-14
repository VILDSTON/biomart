'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  HelpCircle,
  Search,
  ChevronDown,
  ShoppingBag,
  Store,
  Bot,
  ShieldCheck,
  Send,
  MessageSquare,
} from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';
import { SupportModal } from '@/components/SupportModal';

interface FaqItem {
  id: string;
  category: 'buyer' | 'seller' | 'marty';
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  // For Buyers
  {
    id: 'b1',
    category: 'buyer',
    question: 'Как оформить заказ на витрине BioMart?',
    answer: 'Оформление занимает менее 1 минуты: выберите понравившийся товар и размер, нажмите «В корзину» или «Купить в 1 клик», укажите ваше имя, номер телефона и адрес доставки в Ташкенте или другом городе Узбекистана. После нажатия «Оформить заказ» чек моментально поступает менеджеру магазина.',
  },
  {
    id: 'b2',
    category: 'buyer',
    question: 'Как работает оплата через Click и Payme?',
    answer: 'Оплата происходит напрямую без скрытых комиссий. Вы можете оплатить заказ сразу после подтверждения менеджером через Click Evolution, Payme GO или выбрать вариант «Оплата курьеру при получении» наличными или переводом.',
  },
  {
    id: 'b3',
    category: 'buyer',
    question: 'Как быстро доставляется заказ по Ташкенту и регионам?',
    answer: 'По Ташкенту доставка занимает от 1 до 2 часов экспресс-курьером (Яндекс Доставка). По другим областям Узбекистана (Самарканд, Бухара, Андижан, Фергана и др.) посылка доставляется службой BTS в течение 1–2 рабочих дней.',
  },
  {
    id: 'b4',
    category: 'buyer',
    question: 'Что делать, если размер одежды или обуви не подошел?',
    answer: 'В Ташкенте курьер ожидает до 15 минут для примерки. Вы также можете обменять или вернуть товар в течение 14 дней в соответствии с Законом Республики Узбекистан «О защите прав потребителей» при сохранении товарного вида и бирок.',
  },

  // For Sellers
  {
    id: 's1',
    category: 'seller',
    question: 'Как создать свою витрину в BioMart?',
    answer: 'Перейдите на страницу регистрации (/register), укажите название вашего бренда (например, Tashkent Drip), выберите красивый URL-адрес (slug), введите пароль администратора и ваш Telegram Chat ID. Витрина создается за 2 минуты без программистов.',
  },
  {
    id: 's2',
    category: 'seller',
    question: 'Куда приходят уведомления о новых заказах?',
    answer: 'Каждый заказ мгновенно отправляется в ваш личный Telegram-чат или канал через официального бота @BioMartAssistant_bot. В сообщении содержится имя клиента, кликабельный номер телефона, состав заказа с размерами и ссылка на точку в Яндекс Картах для вызова курьера.',
  },
  {
    id: 's3',
    category: 'seller',
    question: 'Как защищен доступ в панель управления (Dashboard)?',
    answer: 'Доступ защищен паролем администратора, который вы задаете при регистрации. В любой момент вы можете изменить пароль в панели управления во вкладке «Контакты и доступ».',
  },
  {
    id: 's4',
    category: 'seller',
    question: 'Берет ли BioMart комиссию с моих продаж?',
    answer: 'Нет! BioMart не берет процент с ваших заказов. Все средства от клиентов поступают напрямую на ваши счета Click, Payme или курьеру.',
  },

  // About Marty AI
  {
    id: 'm1',
    category: 'marty',
    question: 'Кто такой AI-консультант Марти (Marty)?',
    answer: 'Марти — это встроенный интеллектуальный продавец на базе Google Studio Flash-Lite. Он работает прямо на витрине 24/7, отвечает на вопросы покупателей о наличии, размерах и тканях, а также сам принимает заказы в переписке.',
  },
  {
    id: 'm2',
    category: 'marty',
    question: 'На каких языках общается Марти?',
    answer: 'Марти свободно и грамотно говорит на русском и узбекском языках («Assalomu alaykum!»). Он автоматически определяет язык покупателя и подстраивается под него.',
  },
  {
    id: 'm3',
    category: 'marty',
    question: 'Как Марти принимает заказы?',
    answer: 'Когда клиент пишет в чат «Хочу заказать худи размера L, меня зовут Сардор...», Марти вежливо собирает все недостающие данные, подтверждает заказ и автоматически регистрирует его в панели управления магазином, отправляя уведомление в ваш Telegram.',
  },
  {
    id: 'm4',
    category: 'marty',
    question: 'Есть ли дневной лимит запросов к Марти?',
    answer: 'Да! Для безопасности и защиты от перерасхода квоты установлен дневной лимит в 50 запросов в день на витрину. В шапке виджета Марти отображается актуальный счетчик оставшихся запросов.',
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'buyer' | 'seller' | 'marty'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ b1: true, s1: true, m1: true });
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
            <BioMartLogo className="w-8 h-8" color="#2ECC71" />
            <span>BioMart</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/shipping"
              className="text-xs font-medium text-content-secondary hover:text-content-primary transition-colors hidden sm:block"
            >
              Доставка
            </Link>
            <Link
              href="/returns"
              className="text-xs font-medium text-content-secondary hover:text-content-primary transition-colors hidden sm:block"
            >
              Возврат
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

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-smooth-in">
        {/* Title and Search Card */}
        <div className="bg-surface border border-border rounded-[20px] p-6 sm:p-10 shadow-xs space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold mx-auto">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>База знаний & FAQ</span>
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Чем мы можем вам помочь?
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Ответы на популярные вопросы о покупках, доставке, создании интернет-витрины и работе с AI-консультантом Марти.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-content-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по вопросам (например: оплата, Telegram, возврат)..."
              className="w-full text-xs py-3 pl-10 pr-4 rounded-xl bg-page border border-border text-content-primary placeholder:text-content-secondary/70 focus:outline-hidden focus:border-accent transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-page text-content-secondary hover:text-content-primary border border-border'
              }`}
            >
              Все вопросы
            </button>
            <button
              onClick={() => setActiveCategory('buyer')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === 'buyer'
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-page text-content-secondary hover:text-content-primary border border-border'
              }`}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Покупателям</span>
            </button>
            <button
              onClick={() => setActiveCategory('seller')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === 'seller'
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-page text-content-secondary hover:text-content-primary border border-border'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Продавцам</span>
            </button>
            <button
              onClick={() => setActiveCategory('marty')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === 'marty'
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-page text-content-secondary hover:text-content-primary border border-border'
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>AI Марти</span>
            </button>
          </div>
        </div>

        {/* Accordion Questions List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-border rounded-2xl space-y-2">
              <p className="text-xs text-content-secondary font-medium">
                По вашему запросу ничего не найдено.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = openItems[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-surface border border-border hover:border-accent/40 rounded-2xl overflow-hidden transition-all duration-200 shadow-xs"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-content-primary">
                      {item.question}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full bg-page text-content-secondary flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-accent bg-accent-soft' : ''
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 text-xs sm:text-sm text-content-secondary leading-relaxed border-t border-border/50 animate-smooth-in">
                      <p className="pt-3">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Banner */}
        <div className="p-6 rounded-[20px] bg-surface border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-content-primary">
              Остались вопросы или нужна персональная помощь?
            </h3>
            <p className="text-xs text-content-secondary">
              Наша служба заботы на связи каждый день с 9:00 до 22:00.
            </p>
          </div>

          <button
            onClick={() => setIsSupportOpen(true)}
            className="px-5 py-2.5 rounded-btn bg-accent text-white font-semibold text-xs shadow-xs hover:brightness-105 active:scale-95 transition-all shrink-0"
          >
            Связаться с поддержкой
          </button>
        </div>
      </main>

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        defaultCategory="other"
      />
    </div>
  );
}
