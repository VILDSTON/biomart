'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Sparkles, ShoppingBag } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  name: string;
  category: string;
  tagline: string;
  itemCount: number;
  highlight: string;
}

const DEMO_STORES: ShowcaseItem[] = [
  {
    id: 'tashkent_drip',
    name: 'Tashkent Drip',
    category: 'Одежда и streetwear',
    tagline: 'Худи, оверсайз футболки и кроссовки с примеркой перед оплатой',
    itemCount: 6,
    highlight: 'Выбор размера в 1 клик',
  },
  {
    id: 'volt_gadgets',
    name: 'Volt Gadgets',
    category: 'Электроника и аксессуары',
    tagline: 'Гаджеты, наушники и зарядные станции с гарантией и проверкой при курьере',
    itemCount: 6,
    highlight: 'Чек сразу в Telegram',
  },
  {
    id: 'aura_perfume',
    name: 'Aura Perfume',
    category: 'Селективный парфюм',
    tagline: 'Оригинальные флаконы и распивы с пробником в подарок к каждому заказу',
    itemCount: 6,
    highlight: 'Прямая связь с продавцом',
  },
];

export const ShowcaseSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 px-4 border-b border-border bg-surface transition-colors">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Примеры витрин</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            Готовые витрины для любых товаров
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary max-w-xl mx-auto">
            Посмотрите, как витрина выглядит для покупателя в Instagram и Telegram. Открывается мгновенно прямо в браузере.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DEMO_STORES.map((demo) => (
            <Link
              key={demo.id}
              href={`/demo?store=${demo.id}`}
              className="group bg-page border border-border hover:border-accent/50 rounded-[14px] p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-[0_4px_16px_rgba(26,26,26,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-accent bg-accent-soft px-2 py-0.5 rounded-full">
                    Демо
                  </span>
                  <span className="text-[11px] font-mono text-content-secondary">
                    {demo.itemCount} товаров
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-content-primary group-hover:text-accent transition-colors">
                    {demo.name}
                  </h3>
                  <p className="text-[11px] text-content-secondary font-medium mt-0.5">
                    {demo.category}
                  </p>
                </div>

                <p className="text-xs text-content-secondary leading-relaxed">
                  {demo.tagline}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-content-primary">
                  {demo.highlight}
                </span>
                <span className="text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                  <span>Открыть</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            <span>Попробовать оформление заказа на демо-витрине</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
