'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  ShoppingBag,
  Eye,
  ExternalLink,
  RefreshCw,
  Phone,
  Send,
  Zap,
  Award,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface TrialExpiringStore {
  slug: string;
  store_name: string;
  days_left: number;
  phone: string | null;
  phone_link: string | null;
  telegram_username: string | null;
  telegram_link: string | null;
  created_at: string;
}

interface LeaderboardStore {
  id: string;
  slug: string;
  store_name: string;
  views: number;
  orders_count: number;
  revenue: number;
  products_count: number;
  plan: string;
}

interface PlatformAnalyticsData {
  stores: {
    total: number;
    active: number;
    stuck: number;
    new_today: number;
    new_7d: number;
    new_30d: number;
  };
  subscriptions: {
    free_or_trial: number;
    plus: number;
    pro: number;
    trials_expiring_soon: TrialExpiringStore[];
  };
  traffic_and_gmv: {
    gmv_total: number;
    gmv_today: number;
    gmv_7d: number;
    gmv_30d: number;
    orders_total: number;
    orders_today: number;
    orders_7d: number;
    orders_30d: number;
    views_total: number;
    views_today: number;
    views_7d: number;
    views_30d: number;
  };
  leaderboard: LeaderboardStore[];
}

export function PlatformAnalytics() {
  const [data, setData] = useState<PlatformAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analytics/admin');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Не удалось загрузить аналитику платформы');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stores = data?.stores || {
    total: 0,
    active: 0,
    stuck: 0,
    new_today: 0,
    new_7d: 0,
    new_30d: 0,
  };

  const subs = data?.subscriptions || {
    free_or_trial: 0,
    plus: 0,
    pro: 0,
    trials_expiring_soon: [],
  };

  const gmv = data?.traffic_and_gmv || {
    gmv_total: 0,
    gmv_today: 0,
    gmv_7d: 0,
    gmv_30d: 0,
    orders_total: 0,
    orders_today: 0,
    orders_7d: 0,
    orders_30d: 0,
    views_total: 0,
    views_today: 0,
    views_7d: 0,
    views_30d: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <span>Аналитика и метрики платформы BioMart</span>
          </h2>
          <p className="text-xs text-content-secondary">
            Общая выручка (GMV), витрины, активность и окончание триалов
          </p>
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

      {error && (
        <div className="p-3.5 rounded-card bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* BLOCK 1: Platform-wide GMV, Orders & Views (Today, 7d, 30d, Total) */}
      <div>
        <h3 className="text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">
          Торговый оборот и активность платформы (GMV)
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* GMV Total */}
          <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-content-secondary">
              <span className="text-[11px] font-medium">Общий GMV (Все время)</span>
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums truncate">
              {formatPrice(gmv.gmv_total)}
            </div>
            <div className="text-[10px] text-content-secondary tabular-nums">
              Сегодня: {formatPrice(gmv.gmv_today)} • 7дн: {formatPrice(gmv.gmv_7d)}
            </div>
          </div>

          {/* Orders Total */}
          <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-content-secondary">
              <span className="text-[11px] font-medium">Всего заказов</span>
              <ShoppingBag className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums">
              {gmv.orders_total.toLocaleString('ru-RU')}
            </div>
            <div className="text-[10px] text-content-secondary tabular-nums">
              Сегодня: +{gmv.orders_today} • 7дн: +{gmv.orders_7d}
            </div>
          </div>

          {/* Views Total */}
          <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-content-secondary">
              <span className="text-[11px] font-medium">Просмотры витрин</span>
              <Eye className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums">
              {gmv.views_total.toLocaleString('ru-RU')}
            </div>
            <div className="text-[10px] text-content-secondary tabular-nums">
              Сегодня: +{gmv.views_today} • 7дн: +{gmv.views_7d}
            </div>
          </div>

          {/* Stores Total */}
          <div className="bg-surface border border-border rounded-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-content-secondary">
              <span className="text-[11px] font-medium">Витрин на платформе</span>
              <Store className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums">
              {stores.total.toLocaleString('ru-RU')}
            </div>
            <div className="text-[10px] text-content-secondary tabular-nums">
              Активных: {stores.active} • На онбординге: {stores.stuck}
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK 2: Stores & Onboarding Funnel + Subscriptions Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Onboarding Funnel */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Воронка онбординга продавцов</span>
            </h3>
            <span className="text-[11px] text-content-secondary tabular-nums">
              Сегодня: +{stores.new_today}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-page border border-border rounded-[10px] p-3 text-center space-y-1">
              <div className="text-[11px] text-content-secondary font-medium">Всего витрин</div>
              <div className="text-base sm:text-lg font-bold text-content-primary tabular-nums">
                {stores.total}
              </div>
              <div className="text-[10px] text-content-secondary tabular-nums">
                + {stores.new_7d} за 7 дн.
              </div>
            </div>

            <div className="bg-page border border-border rounded-[10px] p-3 text-center space-y-1">
              <div className="text-[11px] text-content-primary font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                <span>Активные</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-accent tabular-nums">
                {stores.active}
              </div>
              <div className="text-[10px] text-content-secondary">
                Товары добавлены
              </div>
            </div>

            <div className="bg-page border border-border rounded-[10px] p-3 text-center space-y-1">
              <div className="text-[11px] text-content-secondary font-medium flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Без товаров</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-amber-500 tabular-nums">
                {stores.stuck}
              </div>
              <div className="text-[10px] text-content-secondary">
                Нужна помощь
              </div>
            </div>
          </div>

          <p className="text-[11px] text-content-secondary leading-relaxed">
            Витрины «Без товаров» — это продавцы, которые создали магазин, но пока не заполнили каталог. Свяжитесь с ними в Telegram, чтобы помочь запустить первые продажи.
          </p>
        </div>

        {/* Subscriptions Breakdown */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent" />
              <span>Тарифы и подписки</span>
            </h3>
            <span className="text-[11px] text-content-secondary">
              Тарифная сетка
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-page border border-border rounded-[10px] p-3 text-center space-y-1">
              <div className="text-[11px] text-content-secondary font-medium">Free / Trial</div>
              <div className="text-base sm:text-lg font-bold text-content-primary tabular-nums">
                {subs.free_or_trial}
              </div>
              <div className="text-[10px] text-content-secondary">0 сум</div>
            </div>

            <div className="bg-page border border-border rounded-[10px] p-3 text-center space-y-1">
              <div className="text-[11px] text-content-primary font-medium">Plus (59k)</div>
              <div className="text-base sm:text-lg font-bold text-accent tabular-nums">
                {subs.plus}
              </div>
              <div className="text-[10px] text-content-secondary">До 100 тов.</div>
            </div>

            <div className="bg-page border border-border rounded-[10px] p-3 text-center space-y-1">
              <div className="text-[11px] text-content-primary font-medium">Pro (129k)</div>
              <div className="text-base sm:text-lg font-bold text-purple-400 tabular-nums">
                {subs.pro}
              </div>
              <div className="text-[10px] text-content-secondary">Безлимит</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-[10px] bg-page border border-border">
            <span className="text-content-secondary">Потенциальный MRR подписок:</span>
            <span className="font-bold text-accent tabular-nums">
              {formatPrice(subs.plus * 59000 + subs.pro * 129000)} / мес.
            </span>
          </div>
        </div>
      </div>

      {/* BLOCK 3: Trials Expiring Soon (Next 3 Days) - High Priority Follow-up */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Триалы, истекающие в ближайшие 3 дня</span>
            </h3>
            <p className="text-[11px] text-content-secondary">
              Свяжитесь с владельцами витрин для продления или перехода на платный тариф
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold tabular-nums">
            {subs.trials_expiring_soon.length} магазинов
          </span>
        </div>

        {subs.trials_expiring_soon.length === 0 ? (
          <div className="p-4 rounded-[10px] bg-page border border-border text-center text-xs text-content-secondary">
            На ближайшие 3 дня нет триалов с истекающим сроком действия.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {subs.trials_expiring_soon.map((store) => (
              <div
                key={store.slug}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-content-primary">
                      {store.store_name}
                    </h4>
                    <Link
                      href={`/${store.slug}`}
                      target="_blank"
                      className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
                    >
                      <span>biomart.uz/{store.slug}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="text-[11px] text-content-secondary mt-0.5">
                    Создан: {store.created_at.slice(0, 10)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-[6px] bg-amber-500/10 text-amber-500 font-semibold tabular-nums">
                    Осталось {store.days_left} дн.
                  </span>

                  {store.telegram_link && (
                    <a
                      href={store.telegram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-3 py-1.5 rounded-btn bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>@{store.telegram_username}</span>
                    </a>
                  )}

                  {store.phone_link && (
                    <a
                      href={store.phone_link}
                      className="min-h-[44px] px-3 py-1.5 rounded-btn bg-page border border-border hover:bg-surface text-content-primary text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-accent" />
                      <span>{store.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BLOCK 4: Top 10 Stores Leaderboard */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              <span>Лидерборд: Топ-10 витрин по популярности</span>
            </h3>
            <p className="text-[11px] text-content-secondary">
              Рейтинг магазинов по суммарным просмотрам и заказам
            </p>
          </div>
        </div>

        {(!data?.leaderboard || data.leaderboard.length === 0) ? (
          <div className="text-center py-6 text-xs text-content-secondary">
            Пока нет данных о витринах.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-content-secondary font-semibold">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Витрина</th>
                  <th className="py-2.5 px-2">Товаров</th>
                  <th className="py-2.5 px-2">Просмотров</th>
                  <th className="py-2.5 px-2">Заказов</th>
                  <th className="py-2.5 px-2">Тариф</th>
                  <th className="py-2.5 px-2 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.leaderboard.map((store, idx) => (
                  <tr key={store.slug} className="hover:bg-page/50 transition-colors">
                    <td className="py-3 px-2 font-bold text-content-secondary tabular-nums">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-2 font-semibold text-content-primary">
                      <div>{store.store_name}</div>
                      <div className="text-[11px] text-content-secondary font-normal font-mono">
                        /{store.slug}
                      </div>
                    </td>
                    <td className="py-3 px-2 tabular-nums">
                      {store.products_count}
                    </td>
                    <td className="py-3 px-2 font-semibold text-accent tabular-nums">
                      {store.views.toLocaleString('ru-RU')}
                    </td>
                    <td className="py-3 px-2 font-semibold text-content-primary tabular-nums">
                      {store.orders_count}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-page border border-border">
                        {store.plan}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        href={`/${store.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                      >
                        <span>Витрина</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
