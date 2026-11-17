'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Eye,
  Users,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  Percent,
  RefreshCw,
  AlertCircle,
  Instagram,
  Send,
  Compass,
  Globe,
  Package,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface DailyTrendItem {
  date: string;
  views: number;
  unique_visitors: number;
  product_clicks: number;
  orders_count: number;
  orders_revenue: number;
}

interface TopProductItem {
  id: string;
  title: string;
  price: number;
  images?: string[];
  views_count?: number;
  in_stock?: boolean;
}

interface SellerAnalyticsData {
  summary: {
    views: number;
    unique_visitors: number;
    product_clicks: number;
    orders_count: number;
    orders_revenue: number;
    conversion_rate: number;
  };
  sources: {
    instagram: number;
    telegram: number;
    direct: number;
    other: number;
  };
  daily_trend: DailyTrendItem[];
  top_products: TopProductItem[];
}

export function SellerAnalytics({ storeSlug }: { storeSlug: string }) {
  const [days, setDays] = useState<7 | 30>(7);
  const [data, setData] = useState<SellerAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!storeSlug) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/analytics/seller?store_slug=${encodeURIComponent(storeSlug)}&days=${days}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Не удалось загрузить аналитику');
    } finally {
      setIsLoading(false);
    }
  }, [storeSlug, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = data?.summary || {
    views: 0,
    unique_visitors: 0,
    product_clicks: 0,
    orders_count: 0,
    orders_revenue: 0,
    conversion_rate: 0,
  };

  const sources = data?.sources || { instagram: 0, telegram: 0, direct: 0, other: 0 };
  const totalSourceCount = sources.instagram + sources.telegram + sources.direct + sources.other || 1;

  // Max views in daily trend for proportional bar scaling
  const maxViews = Math.max(...(data?.daily_trend?.map((d) => d.views) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Top Header & Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <span>Статистика и аналитика витрины</span>
          </h2>
          <p className="text-xs text-content-secondary">
            Данные о посещаемости, источниках переходов и заказах без спам-ботов
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 7 vs 30 days toggle (44px min tap target) */}
          <div className="inline-flex p-1 bg-surface border border-border rounded-btn">
            <button
              type="button"
              onClick={() => setDays(7)}
              className={`min-h-[44px] min-w-[70px] px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                days === 7
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              7 дней
            </button>
            <button
              type="button"
              onClick={() => setDays(30)}
              className={`min-h-[44px] min-w-[70px] px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                days === 30
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              30 дней
            </button>
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={isLoading}
            title="Обновить аналитику"
            aria-label="Обновить аналитику"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-btn bg-surface border border-border text-content-secondary hover:text-content-primary flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-card bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Views */}
        <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-medium">Просмотры</span>
            <Eye className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums">
            {summary.views.toLocaleString('ru-RU')}
          </div>
          <div className="text-[10px] text-content-secondary">Всего показов витрины</div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-medium">Посетители</span>
            <Users className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums">
            {summary.unique_visitors.toLocaleString('ru-RU')}
          </div>
          <div className="text-[10px] text-content-secondary">Уникальные люди</div>
        </div>

        {/* Product Clicks */}
        <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-medium">Клики на товары</span>
            <MousePointerClick className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums">
            {summary.product_clicks.toLocaleString('ru-RU')}
          </div>
          <div className="text-[10px] text-content-secondary">Открытий карточек</div>
        </div>

        {/* Orders */}
        <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-medium">Заказы</span>
            <ShoppingBag className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums">
            {summary.orders_count.toLocaleString('ru-RU')}
          </div>
          <div className="text-[10px] text-content-secondary">Оформлено заявок</div>
        </div>

        {/* Revenue */}
        <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-medium">Выручка</span>
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums truncate">
            {formatPrice(summary.orders_revenue)}
          </div>
          <div className="text-[10px] text-content-secondary">Сумма всех покупок</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-medium">Конверсия</span>
            <Percent className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums">
            {summary.conversion_rate}%
          </div>
          <div className="text-[10px] text-content-secondary">Из посетителя в заказ</div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Trend Chart (CSS-only, Zero heavy npm dependencies) */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-content-primary">
              Динамика посещаемости по дням
            </h3>
            <span className="text-[11px] text-content-secondary tabular-nums">
              За последние {days} дн.
            </span>
          </div>

          <div className="pt-4 pb-2">
            <div className="h-44 sm:h-52 flex items-end gap-1.5 sm:gap-3 w-full border-b border-border/60 pb-2">
              {(data?.daily_trend || []).map((item) => {
                const heightPercent = Math.max(Math.round((item.views / maxViews) * 100), 4);
                const dayLabel = item.date.slice(5).replace('-', '.');

                return (
                  <div
                    key={item.date}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 z-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-page border border-border rounded-[8px] p-1.5 text-[10px] text-content-primary shadow-md whitespace-nowrap tabular-nums">
                      <div className="font-bold">{item.date}</div>
                      <div>{item.views} просм. • {item.orders_count} зак.</div>
                    </div>

                    {/* Order indicator badge */}
                    {item.orders_count > 0 && (
                      <span className="mb-1 text-[9px] font-bold text-accent tabular-nums">
                        +{item.orders_count}
                      </span>
                    )}

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-[6px] transition-all ${
                        item.views > 0
                          ? 'bg-accent hover:opacity-85'
                          : 'bg-border/40'
                      }`}
                    />

                    {/* Date label */}
                    <span className="mt-2 text-[10px] text-content-secondary tabular-nums">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-content-secondary pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
              <span>Просмотры витрины</span>
            </div>
            <div className="tabular-nums">
              Пик: <b>{maxViews}</b> просм./день
            </div>
          </div>
        </div>

        {/* Traffic Sources Breakdown */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-content-primary">
            Источники переходов
          </h3>

          <div className="space-y-3.5 pt-1">
            {/* Instagram */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-content-primary font-medium">
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram (Stories/Bio)</span>
                </span>
                <span className="tabular-nums font-semibold text-content-primary">
                  {sources.instagram}{' '}
                  <span className="text-[10px] text-content-secondary font-normal">
                    ({Math.round((sources.instagram / totalSourceCount) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-page rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all"
                  style={{ width: `${Math.round((sources.instagram / totalSourceCount) * 100)}%` }}
                />
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-content-primary font-medium">
                  <Send className="w-3.5 h-3.5 text-sky-500" />
                  <span>Telegram (Каналы/Боты)</span>
                </span>
                <span className="tabular-nums font-semibold text-content-primary">
                  {sources.telegram}{' '}
                  <span className="text-[10px] text-content-secondary font-normal">
                    ({Math.round((sources.telegram / totalSourceCount) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-page rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{ width: `${Math.round((sources.telegram / totalSourceCount) * 100)}%` }}
                />
              </div>
            </div>

            {/* Direct */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-content-primary font-medium">
                  <Compass className="w-3.5 h-3.5 text-accent" />
                  <span>Прямые переходы (Ссылка)</span>
                </span>
                <span className="tabular-nums font-semibold text-content-primary">
                  {sources.direct}{' '}
                  <span className="text-[10px] text-content-secondary font-normal">
                    ({Math.round((sources.direct / totalSourceCount) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-page rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${Math.round((sources.direct / totalSourceCount) * 100)}%` }}
                />
              </div>
            </div>

            {/* Other */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-content-primary font-medium">
                  <Globe className="w-3.5 h-3.5 text-content-secondary" />
                  <span>Прочие сайты / Поиск</span>
                </span>
                <span className="tabular-nums font-semibold text-content-primary">
                  {sources.other}{' '}
                  <span className="text-[10px] text-content-secondary font-normal">
                    ({Math.round((sources.other / totalSourceCount) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-page rounded-full overflow-hidden">
                <div
                  className="h-full bg-content-secondary/40 rounded-full transition-all"
                  style={{ width: `${Math.round((sources.other / totalSourceCount) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Most Viewed Products */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <Package className="w-4 h-4 text-accent" />
              <span>Топ просматриваемых товаров</span>
            </h3>
            <p className="text-[11px] text-content-secondary">
              Товары, которые привлекают больше всего внимания покупателей
            </p>
          </div>
        </div>

        {(!data?.top_products || data.top_products.length === 0) ? (
          <div className="text-center py-6 text-xs text-content-secondary">
            Пока нет данных о просмотрах товаров. Они появятся сразу после первых посещений витрины.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {data.top_products.map((product, idx) => (
              <div
                key={product.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs font-bold text-content-secondary tabular-nums">
                    #{idx + 1}
                  </span>

                  <div className="w-10 h-10 rounded-[8px] bg-page border border-border overflow-hidden shrink-0 relative">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-content-secondary text-[10px]">
                        Фото
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-content-primary truncate">
                      {product.title}
                    </h4>
                    <p className="text-[11px] text-content-secondary tabular-nums">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-content-primary tabular-nums">
                    {(product.views_count || 0).toLocaleString('ru-RU')}
                  </div>
                  <div className="text-[10px] text-content-secondary">просмотров</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
