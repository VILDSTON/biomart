'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Smartphone, Sparkles, MessageCircle, RotateCcw } from 'lucide-react';
import { InteractiveHeroPhone } from './InteractiveHeroPhone';
import { Reveal } from './Reveal';

export const HeroVariantA: React.FC = () => {
  const [strikeAnimated, setStrikeAnimated] = useState(false);
  // Stage sequence: 'questions' (chaos in DM) -> 'dissolving' -> 'phone' (clean storefront emerges)
  const [stage, setStage] = useState<'questions' | 'dissolving' | 'phone'>('questions');

  useEffect(() => {
    // 1. Animate strikethrough after 500ms
    const strikeTimer = setTimeout(() => setStrikeAnimated(true), 500);

    // 2. Questions dissolve after 2.2s
    const dissolveTimer = setTimeout(() => {
      setStage('dissolving');
    }, 2200);

    // 3. Phone emerges smoothly at 2.7s
    const phoneTimer = setTimeout(() => {
      setStage('phone');
    }, 2700);

    return () => {
      clearTimeout(strikeTimer);
      clearTimeout(dissolveTimer);
      clearTimeout(phoneTimer);
    };
  }, []);

  const handleReplaySequence = () => {
    setStage('questions');
    setTimeout(() => setStage('dissolving'), 2200);
    setTimeout(() => setStage('phone'), 2700);
  };

  return (
    <section className="relative pt-6 sm:pt-12 pb-16 sm:pb-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Masked Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Emerald pill badge matching "Сравнение опыта" */}
            <Reveal delay={60}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Витрины для Instagram и Telegram в Узбекистане</span>
              </div>
            </Reveal>

            {/* Line-by-line masked typography headline */}
            <div className="space-y-1 tracking-tight font-semibold text-content-primary">
              <div className="overflow-hidden">
                <h1 className="text-[clamp(34px,5.5vw,68px)] font-bold leading-[1.05] tracking-[-0.03em] animate-in slide-in-from-bottom-8 duration-600">
                  Перестаньте терять заказы
                </h1>
              </div>

              <div className="overflow-hidden">
                <div className="text-[clamp(32px,5.2vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
                  <span className="text-content-secondary font-normal">Вместо</span>
                  <span className="relative inline-block text-content-secondary font-medium">
                    «цена в директ»
                    {/* Strikethrough line drawing from left to right */}
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-[3px] sm:h-[4px] bg-danger rounded-full origin-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        strikeAnimated ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </span>
                </div>
              </div>

              <div className="overflow-hidden pt-1">
                <span className="text-[clamp(34px,5.5vw,68px)] font-bold leading-[1.05] tracking-[-0.03em] text-accent block">
                  Принимайте заказы в 1 клик
                </span>
              </div>
            </div>

            {/* Subtitle max 62ch */}
            <Reveal delay={200}>
              <p className="text-xs sm:text-base text-content-secondary max-w-[62ch] mx-auto lg:mx-0 leading-relaxed font-normal">
                Покупатель открывает витрину прямо в браузере Instagram, выбирает размер и подтверждает покупку. Готовый чек с адресом и составом сразу падает вам в Telegram.
              </p>
            </Reveal>

            {/* Action Buttons */}
            <Reveal delay={280}>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-accent hover:bg-accent-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(31,122,90,0.3)] active:scale-[0.97] group"
                >
                  <span>Создать витрину бесплатно</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/demo"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-surface hover:bg-surface-soft text-content-primary border border-border font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.97]"
                >
                  <Smartphone className="w-4 h-4 text-accent" />
                  <span>Попробовать демо-витрину</span>
                </Link>
              </div>
            </Reveal>

            {/* Clean minimal trust line (0% комиссии and способы оплаты removed per request) */}
            <Reveal delay={340}>
              <div className="pt-2 text-xs text-content-secondary flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 font-medium">
                <span>Запуск витрины за 2 минуты</span>
                <span className="text-content-secondary/40 select-none">•</span>
                <span>Без скачивания приложений</span>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Stage Choreography (Questions Dissolve -> Phone Emerges) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[580px] mt-6 lg:mt-0">
            {/* STAGE 1: Chaotic Direct Messages in the center (visible first, then dissolves) */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center space-y-3.5 z-20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage === 'questions'
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-90 -translate-y-8 pointer-events-none'
              }`}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-semibold text-content-secondary shadow-xs mb-1">
                <span>Вопросы покупателей в директе:</span>
              </div>

              <div className="w-full max-w-[320px] p-3.5 rounded-[16px] bg-surface border border-border shadow-card flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-content-primary leading-tight">
                  «Здравствуйте, сколько стоит худи?»
                </span>
              </div>

              <div className="w-full max-w-[320px] p-3.5 rounded-[16px] bg-surface border border-border shadow-card flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-400 delay-100">
                <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-content-primary leading-tight">
                  «А размер M есть в наличии?»
                </span>
              </div>

              <div className="w-full max-w-[320px] p-3.5 rounded-[16px] bg-surface border border-border shadow-card flex items-center gap-2.5 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-content-primary leading-tight">
                  «Куда скинуть чек об оплате на карту?»
                </span>
              </div>

              <span className="text-[11px] text-content-secondary font-medium pt-1">
                Переводим хаос переписки в витрину...
              </span>
            </div>

            {/* STAGE 2: Interactive Phone emerges after questions disappear */}
            <div
              className={`w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage === 'phone'
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
              }`}
            >
              <InteractiveHeroPhone />

              <div className="text-center pt-3">
                <button
                  type="button"
                  onClick={handleReplaySequence}
                  className="inline-flex items-center gap-1.5 text-[11px] text-content-secondary hover:text-content-primary font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Повторить анимацию</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
