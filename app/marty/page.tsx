import React from 'react';
import Link from 'next/link';
import {
  Bot,
  MessageSquare,
  ShoppingBag,
  Clock,
  Globe,
  Zap,
  ArrowRight,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';

export const metadata = {
  title: 'Марти AI — Умный продавец для вашей витрины | BioMart',
  description:
    'Встроенный AI-консультант Марти для витрин BioMart. Отвечает покупателям 24/7, консультирует по каталогу и принимает заказы прямо в Telegram.',
};

const capabilities = [
  {
    icon: Clock,
    title: 'Отвечает клиентам 24/7',
    desc: 'Больше никаких потерянных заказов по ночам или в выходные. Марти мгновенно встречает покупателя и помогает с выбором.',
  },
  {
    icon: ShoppingBag,
    title: 'Принимает заказы в чате',
    desc: 'Клиент может заказать товар прямо во время переписки. Марти собирает размер, имя, телефон, адрес и сразу формирует заказ.',
  },
  {
    icon: Globe,
    title: 'Узбекский и русский языки',
    desc: 'Свободно общается на узбекском и русском. Распознает запросы покупателей и отвечает на их родном языке.',
  },
  {
    icon: MessageSquare,
    title: 'Знает весь ваш каталог',
    desc: 'Помнит цены, наличие, доступные размеры и цвета. Подбирает альтернативы и рекомендует похожие товары.',
  },
  {
    icon: Send,
    title: 'Заказы летят в ваш Telegram',
    desc: 'Каждый принятый Марти заказ мгновенно отправляется в личные сообщения или группу продавца в Telegram.',
  },
  {
    icon: ShieldCheck,
    title: 'Контроль лимитов и безопасность',
    desc: 'Встроенная защита от спама и дневные лимиты. Никаких лишних трат — только целевые продажи.',
  },
];

const chatExample = [
  {
    role: 'buyer',
    text: 'Здравствуйте! Есть кроссовки Nike Retro Runner 42 размера в наличии?',
  },
  {
    role: 'marty',
    text: 'Здравствуйте! Да, модель Nike Retro Runner в 42 размере есть в наличии в Ташкенте. Цена — 650 000 сум. Оформить вам быструю доставку через курьера Yandex?',
  },
  {
    role: 'buyer',
    text: 'Да, супер! Мой номер +998 90 123-45-67, Азиз, Чиланзар 7 дом 12.',
  },
  {
    role: 'marty',
    text: 'Отлично, Азиз! Заказ на Nike Retro Runner (размер 42) за 650 000 сум принят. Курьер привезет сегодня в течение 2 часов. Оплата курьеру при получении. Чек отправлен продавцу! 🛍️✨',
  },
];

const faqs = [
  {
    q: 'Как включить Марти на моей витрине?',
    a: 'Марти подключается автоматически при создании витрины. Он сразу видит все добавленные вами товары, цены и условия доставки.',
  },
  {
    q: 'Нужно ли мне настраивать промпты или обучать нейросеть?',
    a: 'Нет! Мы уже настроили все алгоритмы продаж под рынок Узбекистана: Марти понимает местную специфику доставки, оплаты Click/Payme и двуязычные запросы.',
  },
  {
    q: 'Может ли Марти назвать неправильную цену или товар?',
    a: 'Нет. Марти строго ориентируется только на товары из вашего каталога BioMart. Он не выдумывает несуществующие товары и цены.',
  },
  {
    q: 'Сколько это стоит?',
    a: 'На тарифах BioMart консультант доступен с включенным пакетом запросов в день, чтобы вы могли протестировать его в реальных продажах.',
  },
];

export default function MartyPage() {
  return (
    <div className="min-h-screen bg-page text-content-primary">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 h-16 bg-surface/85 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-lg text-content-primary hover:opacity-90 transition-opacity"
          >
            <BioMartLogo className="w-8 h-8 shrink-0" color="#1F7A5A" />
            <span className="tracking-tight">BioMart</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-[10px] text-xs font-semibold text-content-secondary hover:text-content-primary hover:bg-surface-soft transition-colors"
            >
              Демо-витрина
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <span>Создать витрину</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 border-b border-border bg-gradient-to-b from-surface/50 to-page">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft text-accent text-xs font-semibold border border-accent/20">
            <Bot className="w-4 h-4" />
            <span>Интеллектуальный помощник продаж</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-content-primary leading-[1.1]">
            Марти — ваш лучший продавец, который не спит
          </h1>

          <p className="text-base sm:text-lg text-content-secondary max-w-2xl mx-auto leading-relaxed">
            Автоматический AI-консультант для вашей витрины в Узбекистане. Знает ваш каталог, быстро отвечает покупателям на узбекском и русском языках и сразу принимает заказы в Telegram.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <span>Подключить к своей витрине</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-btn bg-surface hover:bg-surface-soft border border-border text-content-primary text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-accent" />
              <span>Попробовать в демо</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Visual Interactive Chat Preview */}
      <section className="py-16 sm:py-24 px-4 border-b border-border bg-page">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Реальный диалог</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              От первого вопроса до готового чека за 60 секунд
            </h2>
            <p className="text-sm text-content-secondary leading-relaxed">
              Покупателям не нужно блуждать по сложным формам заказа. Марти ведет живой, вежливый диалог, уточняет детали и передает заказ продавцу без единого лишнего клика.
            </p>
            <div className="pt-2 space-y-2 text-xs font-semibold text-content-primary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Автоматическое распознавание узбекского языка</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Фиксация адреса и телефона в заказе</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Мгновенный Telegram-алерт владельцу</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="max-w-md mx-auto rounded-3xl border border-border bg-surface shadow-xl overflow-hidden">
              {/* Chat Header */}
              <div className="px-4 py-3 bg-page/80 border-b border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-content-primary">Марти • Онлайн-консультант</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● В сети 24/7</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-3 bg-page/30 text-xs">
                {chatExample.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.role === 'buyer' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed shadow-2xs ${
                        m.role === 'buyer'
                          ? 'bg-accent text-white rounded-br-xs'
                          : 'bg-surface border border-border text-content-primary rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-16 sm:py-24 px-4 border-b border-border bg-surface/40">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-content-primary">
              Все возможности консультанта
            </h2>
            <p className="text-sm text-content-secondary max-w-xl mx-auto">
              Разработан специально для ритейла и локальных магазинов одежды, обуви, электроники и подарков в Узбекистане.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-card bg-surface border border-border hover:border-accent/40 transition-all space-y-3 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-content-primary">{item.title}</h3>
                <p className="text-xs text-content-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 px-4 border-b border-border bg-page">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Частые вопросы продавцов о Марти
            </h2>
            <p className="text-sm text-content-secondary">
              Всё, что нужно знать перед подключением к витрине
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-surface border border-border space-y-2 shadow-2xs"
              >
                <h4 className="text-sm font-bold text-content-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-content-secondary leading-relaxed pl-3.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Block */}
      <section className="py-16 sm:py-20 px-4 text-center bg-gradient-to-t from-surface to-page">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
            Готовы автоматизировать заказы?
          </h2>
          <p className="text-sm text-content-secondary">
            Создайте витрину BioMart за 2 минуты и продавайте без рутины.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <span>Создать витрину с Марти</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
