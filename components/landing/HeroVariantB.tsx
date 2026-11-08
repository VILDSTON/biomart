'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Smartphone, Sparkles, Check } from 'lucide-react';
import { InteractiveHeroPhone } from './InteractiveHeroPhone';
import { Reveal } from './Reveal';

export const HeroVariantB: React.FC = () => {
  const [strikeAnimated, setStrikeAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStrikeAnimated(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative pt-8 sm:pt-16 pb-16 sm:pb-28 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center space-y-7">
        {/* Subtle Pill Tag */}
        <Reveal delay={60}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border text-xs font-semibold text-content-secondary shadow-xs">
            <span>Платформа онлайн-витрин для Instagram и Telegram</span>
          </div>
        </Reveal>

        {/* Large Full-Width Studio Typography Headline */}
        <div className="space-y-1.5 tracking-tight font-semibold text-content-primary">
          <div className="overflow-hidden">
            <h1 className="text-[clamp(36px,7.5vw,88px)] font-bold leading-[1.03] tracking-[-0.035em] animate-in slide-in-from-bottom-8 duration-600">
              Хватит терять продажи в переписке
            </h1>
          </div>

          <div className="overflow-hidden">
            <div className="text-[clamp(32px,6.8vw,80px)] font-bold leading-[1.03] tracking-[-0.035em] flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="text-content-secondary font-normal">Вместо</span>
              <span className="relative inline-block text-content-secondary font-medium">
                «цена в директ»
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-[3px] sm:h-[5px] bg-danger rounded-full origin-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    strikeAnimated ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </span>
            </div>
          </div>

          <div className="overflow-hidden pt-1">
            <span className="text-[clamp(36px,7.5vw,88px)] font-bold leading-[1.03] tracking-[-0.035em] text-accent block">
              Принимайте заказы в 1 клик
            </span>
          </div>
        </div>

        {/* Focused Subtitle (max 62ch) */}
        <Reveal delay={200}>
          <p className="text-xs sm:text-lg text-content-secondary max-w-[62ch] mx-auto leading-relaxed font-normal">
            Готовый мобильный каталог по короткой ссылке. Покупатель выбирает товар и размер за пару секунд, а структурированный чек падает прямо в Telegram продавца.
          </p>
        </Reveal>

        {/* Action Buttons */}
        <Reveal delay={280}>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-[12px] bg-accent hover:bg-accent-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(31,122,90,0.35)] active:scale-[0.97] group"
            >
              <span>Создать витрину бесплатно</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/demo"
              className="w-full sm:w-auto px-7 py-4 rounded-[12px] bg-surface hover:bg-surface-soft text-content-primary border border-border font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.97]"
            >
              <Smartphone className="w-4 h-4 text-accent" />
              <span>Открыть демо-витрину</span>
            </Link>
          </div>
        </Reveal>

        {/* Quiet Confident Row */}
        <Reveal delay={340}>
          <div className="text-xs text-content-secondary flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-medium">
            <span>0% комиссии с продаж</span>
            <span className="text-content-secondary/40 select-none">•</span>
            <span>Оплата напрямую вам: карта, Click или наличные</span>
            <span className="text-content-secondary/40 select-none">•</span>
            <span>Запуск за 2 минуты</span>
          </div>
        </Reveal>

        {/* Centered Large Phone Showcase below Typography */}
        <div className="pt-8 sm:pt-12 relative flex justify-center">
          <InteractiveHeroPhone />
        </div>
      </div>
    </section>
  );
};
