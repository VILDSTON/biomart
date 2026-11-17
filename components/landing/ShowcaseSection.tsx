'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Sparkles, ShoppingBag, Star, ShieldCheck } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  name: string;
  category: string;
  tagline: string;
  itemCount: number;
  highlight: string;
  href?: string;
  isReal?: boolean;
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
  const [featuredStores, setFeaturedStores] = useState<ShowcaseItem[]>([]);

  useEffect(() => {
    fetch('/api/stores/featured')
      .then((res) => res.json())
      .then((data) => {
        if (data.featured && data.featured.length > 0) {
          const mapped: ShowcaseItem[] = data.featured.map((f: any) => ({
            id: f.slug,
            name: f.store_name,
            category: 'Реальный магазин BioMart',
            tagline: f.description || 'Успешная витрина в Instagram и Telegram на платформе BioMart',
            itemCount: 1,
            highlight: 'Проверено платформой',
            href: `/${f.slug}`,
            isReal: true,
          }));
          setFeaturedStores(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const displayStores = featuredStores.length > 0 ? featuredStores.slice(0, 3) : DEMO_STORES;

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
          {displayStores.map((demo) => {
            const linkHref = demo.href || `/demo?store=${demo.id}`;
            return (
              <Link
                key={demo.id}
                href={linkHref}
                target={demo.isReal ? '_blank' : undefined}
                className="group bg-page border border-border hover:border-accent/50 rounded-[14px] p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-[0_4px_16px_rgba(26,26,26,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {demo.isReal ? (
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Кейс BioMart</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-accent bg-accent-soft px-2 py-0.5 rounded-full">
                        Демо
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-content-secondary">
                      {demo.isReal ? 'Активная витрина' : `${demo.itemCount} товаров`}
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

                  <p className="text-xs text-content-secondary leading-relaxed line-clamp-3">
                    {demo.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-content-primary flex items-center gap-1">
                    {demo.isReal && <ShieldCheck className="w-3.5 h-3.5 text-accent" />}
                    <span>{demo.highlight}</span>
                  </span>
                  <span className="text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                    <span>Открыть</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
