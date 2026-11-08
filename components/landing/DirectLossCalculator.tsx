'use client';

import React, { useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function DirectLossCalculator() {
  const [dailyInquiries, setDailyInquiries] = useState<number>(25);
  const [minutesPerInquiry, setMinutesPerInquiry] = useState<number>(3);

  // Time spent per month: messages/day × minutes/message × 30 days
  const totalMinutesPerMonth = dailyInquiries * minutesPerInquiry * 30;
  const hoursSpentPerMonth = Math.round(totalMinutesPerMonth / 60);

  return (
    <div className="bg-surface border border-border rounded-[14px] p-5 sm:p-8 shadow-[0_4px_24px_rgba(26,26,26,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-colors">
      <div className="max-w-2xl mx-auto text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
          <span>Калькулятор рутины в директе</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
          Сколько времени уходит на переписку с клиентами?
        </h3>
        <p className="text-xs sm:text-sm text-content-secondary">
          Потяните ползунки, чтобы рассчитать часы на ответы в Instagram и Telegram
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-5">
        {/* Slider 1: Messages per day */}
        <div className="bg-page border border-border rounded-[12px] p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-semibold text-content-primary">
              Сообщений и вопросов в день:
            </span>
            <span className="text-base sm:text-lg font-bold text-accent tabular-nums">
              {dailyInquiries} <span className="text-xs font-normal text-content-secondary">в день</span>
            </span>
          </div>

          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={dailyInquiries}
            onChange={(e) => setDailyInquiries(Number(e.target.value))}
            aria-label="Сообщений и вопросов в день"
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
          />

          <div className="flex justify-between text-[11px] text-content-secondary font-mono">
            <span>5 запросов</span>
            <span>50 запросов</span>
            <span>100 запросов</span>
          </div>
        </div>

        {/* Slider 2: Minutes per inquiry (Requirement 3: default 3) */}
        <div className="bg-page border border-border rounded-[12px] p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-semibold text-content-primary">
              Минут на один ответ:
            </span>
            <span className="text-base sm:text-lg font-bold text-accent tabular-nums">
              {minutesPerInquiry} <span className="text-xs font-normal text-content-secondary">мин</span>
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={minutesPerInquiry}
            onChange={(e) => setMinutesPerInquiry(Number(e.target.value))}
            aria-label="Минут на один ответ"
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
          />

          <div className="flex justify-between text-[11px] text-content-secondary font-mono">
            <span>1 мин (быстрый ответ)</span>
            <span>5 мин</span>
            <span>10 мин (уточнение наличия)</span>
          </div>
        </div>

        {/* Results Card: Time calculation only */}
        <div className="bg-surface border border-border rounded-[12px] p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-[12px] bg-accent-soft text-accent flex items-center justify-center shrink-0 border border-accent/20">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl sm:text-3xl font-bold text-accent tabular-nums leading-none">
              ~{hoursSpentPerMonth} часов
            </div>
            <div className="text-xs sm:text-sm font-semibold text-content-primary mt-1">
              Уходит на переписку каждый месяц
            </div>
            <p className="text-[11px] text-content-secondary mt-0.5 leading-snug">
              Вопросы о наличии, размерах, ценах и реквизитах карты
            </p>
          </div>
        </div>

        {/* BioMart Benefit Banner */}
        <div className="bg-accent-soft/70 border border-accent/20 rounded-[12px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-accent">
              Витрина освобождает это время
            </div>
            <div className="text-xs text-content-primary mt-0.5">
              Клиент сразу видит каталог и оформляет заказ, а готовый чек приходит в Telegram.
            </div>
          </div>
          <Link
            href="/register"
            className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-xs active:scale-95"
          >
            <span>Попробовать бесплатно</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
