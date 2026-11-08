'use client';

import React, { useState } from 'react';
import { Clock, TrendingDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function DirectLossCalculator() {
  const [dailyInquiries, setDailyInquiries] = useState<number>(25);

  // Time spent per manual inquiry: ~6 minutes (price, size, color, address, card number)
  const hoursSpentPerMonth = Math.round((dailyInquiries * 6 * 30) / 60);
  // Typical dropped leads due to delayed response (> 15-30 min wait): ~12%
  const lostOrdersPerMonth = Math.round(dailyInquiries * 30 * 0.12);

  return (
    <div className="bg-surface border border-border rounded-[14px] p-4 sm:p-8 shadow-xs">
      <div className="max-w-2xl mx-auto text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-accent-soft text-accent text-xs font-semibold">
          <span>Калькулятор рутины в директе</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-content-primary tracking-tight">
          Сколько времени и продаж уходит на переписку?
        </h3>
        <p className="text-xs sm:text-sm text-content-secondary">
          Потяните ползунок, чтобы увидеть потери при ручных ответах
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-4 sm:space-y-5">
        {/* Slider Box */}
        <div className="bg-page border border-border rounded-[10px] p-3.5 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="text-xs sm:text-sm font-medium text-content-primary">
              Сообщений и вопросов в день:
            </span>
            <span className="text-base sm:text-xl font-semibold text-accent tabular-nums">
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
            className="w-full h-2 bg-border rounded-[10px] appearance-none cursor-pointer accent-accent focus:outline-none"
          />

          <div className="flex justify-between text-[11px] text-content-secondary">
            <span>5 запросов</span>
            <span>50 запросов</span>
            <span>100 запросов</span>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-surface border border-border rounded-[10px] p-3.5 sm:p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-page text-danger flex items-center justify-center shrink-0 border border-border">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-semibold text-danger tabular-nums">
                ~{hoursSpentPerMonth} часов
              </div>
              <div className="text-xs font-medium text-content-primary mt-0.5">
                Рутины каждый месяц
              </div>
              <p className="text-[11px] text-content-secondary mt-0.5 leading-snug">
                На ответы «сколько стоит?», размеры и реквизиты
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[10px] p-3.5 sm:p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-page text-danger flex items-center justify-center shrink-0 border border-border">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-semibold text-danger tabular-nums">
                ~{lostOrdersPerMonth} заказов
              </div>
              <div className="text-xs font-medium text-content-primary mt-0.5">
                Теряется из-за долгих ответов
              </div>
              <p className="text-[11px] text-content-secondary mt-0.5 leading-snug">
                Покупатели уходят, если не получают цену сразу
              </p>
            </div>
          </div>
        </div>

        {/* BioMart Benefit Banner */}
        <div className="bg-accent-soft border border-accent/20 rounded-[10px] p-3.5 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-accent">
              Витрина решает эту проблему
            </div>
            <div className="text-xs text-content-primary mt-0.5">
              Покупатель видит цены и размеры сразу, а заказ падает прямо в Telegram
            </div>
          </div>
          <Link
            href="/register"
            className="w-full sm:w-auto px-4 py-2 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <span>Попробовать</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
