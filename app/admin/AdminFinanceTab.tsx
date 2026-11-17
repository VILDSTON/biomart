'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  TrendingUp,
  Clock,
  Send,
  Phone,
  Copy,
  Check,
  Save,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PlatformSettingsMap } from '@/lib/platform-settings';
import { SubscriptionPaymentOrder } from '@/app/api/subscription-payments/route';

interface AdminFinanceTabProps {
  payments: SubscriptionPaymentOrder[];
  storesList: any[];
  onRefresh?: () => void;
}

export function AdminFinanceTab({ payments, storesList, onRefresh }: AdminFinanceTabProps) {
  const [settings, setSettings] = useState<PlatformSettingsMap | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for requisites and pricing
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [plusPrice, setPlusPrice] = useState(59000);
  const [proPrice, setProPrice] = useState(129000);
  const [plusLimit, setPlusLimit] = useState(100);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/platform/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          setCardNumber(data.settings.payment_requisites?.card_number || '');
          setCardHolder(data.settings.payment_requisites?.card_holder || '');
          setBankName(data.settings.payment_requisites?.bank_name || '');
          setPaymentInstructions(data.settings.payment_requisites?.payment_instructions || '');
          setPlusPrice(data.settings.pricing_plans?.plus_price || 59000);
          setProPrice(data.settings.pricing_plans?.pro_price || 129000);
          setPlusLimit(data.settings.pricing_plans?.plus_limit || 100);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch platform settings', err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 1. Calculate Pulse of Revenue (Пульс выручки)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const d7Str = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
  const d30Str = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

  let revenueToday = 0;
  let revenue7d = 0;
  let revenue30d = 0;
  let revenueTotal = 0;

  payments
    .filter((p) => p.status === 'approved')
    .forEach((p) => {
      const amt = Number(p.amountUzs || 0);
      const createdStr = p.createdAt ? p.createdAt.split('T')[0] : '';
      revenueTotal += amt;
      if (createdStr === todayStr) revenueToday += amt;
      if (createdStr >= d7Str) revenue7d += amt;
      if (createdStr >= d30Str) revenue30d += amt;
    });

  // Calculate MRR from active stores
  let plusCount = 0;
  let proCount = 0;
  storesList.forEach((s) => {
    const plan = (s.settings?.plan || s.plan || 'start').toLowerCase();
    if (plan === 'plus') plusCount += 1;
    if (plan === 'pro') proCount += 1;
  });
  const currentMrr = plusCount * plusPrice + proCount * proPrice;

  // 2. Renewal Queue (Очередь продлений - 3-5 days left)
  const renewalQueue: Array<{
    slug: string;
    store_name: string;
    plan: string;
    price: number;
    days_left: number;
    telegram?: string | null;
    phone?: string | null;
  }> = [];

  storesList.forEach((s) => {
    const plan = (s.settings?.plan || s.plan || 'start').toLowerCase();
    const storeName = s.settings?.store_name || s.store_name || s.slug;
    const createdAt = s.settings?.created_at || s.created_at;
    const tg = s.settings?.telegram_username || s.telegram_username;
    const phone = s.settings?.phone || s.phone;

    if (createdAt) {
      const createdTime = new Date(createdAt).getTime();
      const daysPassed = Math.floor((now.getTime() - createdTime) / 86400000);
      // Trial is 14 days, standard sub period is 30 days
      const cycleDays = plan === 'start' ? 14 : 30;
      const daysLeft = cycleDays - (daysPassed % cycleDays);

      if (daysLeft >= 1 && daysLeft <= 5) {
        renewalQueue.push({
          slug: s.slug,
          store_name: storeName,
          plan: plan === 'pro' ? 'Pro' : plan === 'plus' ? 'Plus' : 'Start (Trial)',
          price: plan === 'pro' ? proPrice : plusPrice,
          days_left: daysLeft,
          telegram: tg ? tg.replace(/^@/, '') : null,
          phone,
        });
      }
    }
  });

  renewalQueue.sort((a, b) => a.days_left - b.days_left);

  const handleSaveRequisites = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await Promise.all([
        fetch('/api/platform/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'payment_requisites',
            value: {
              card_number: cardNumber.trim(),
              card_holder: cardHolder.trim(),
              bank_name: bankName.trim(),
              payment_instructions: paymentInstructions.trim(),
            },
          }),
        }),
        fetch('/api/platform/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'pricing_plans',
            value: {
              plus_price: Number(plusPrice),
              pro_price: Number(proPrice),
              plus_limit: Number(plusLimit),
              pro_limit: 999999,
            },
          }),
        }),
      ]);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Failed to update settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyRenewalMessage = (item: (typeof renewalQueue)[0]) => {
    const text = `Здравствуйте, ${item.store_name}! 👋

Напоминаем, что ваша подписка на BioMart (${item.plan}) для витрины biomart.uz/${item.slug} заканчивается через ${item.days_left} дн.

💳 Реквизиты для продления:
Карта: ${cardNumber || '8600 ...'} (${cardHolder || 'BioMart'})
Банк: ${bankName || 'Click / Payme'}
Сумма: ${formatPrice(item.price)}

После перевода отправьте скриншот чека в ответ на это сообщение, и мы мгновенно продлим доступ! Спасибо, что развиваете продажи с BioMart 🚀`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.slug);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. PULSE OF REVENUE (ПУЛЬС ВЫРУЧКИ) */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span>Пульс выручки платформы</span>
            </h2>
            <p className="text-xs text-content-secondary">
              Подтвержденные платежи за подписки и прогнозируемый ежемесячный доход (MRR)
            </p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-btn bg-surface border border-border text-content-secondary hover:text-content-primary transition-colors"
              title="Обновить"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface border border-border rounded-card p-4 space-y-1">
            <span className="text-[11px] text-content-secondary font-medium">Сегодня</span>
            <div className="text-lg sm:text-xl font-bold text-accent tabular-nums truncate">
              {formatPrice(revenueToday)}
            </div>
            <div className="text-[10px] text-content-secondary">Подтверждено сегодня</div>
          </div>

          <div className="bg-surface border border-border rounded-card p-4 space-y-1">
            <span className="text-[11px] text-content-secondary font-medium">За 7 дней</span>
            <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums truncate">
              {formatPrice(revenue7d)}
            </div>
            <div className="text-[10px] text-content-secondary">За последнюю неделю</div>
          </div>

          <div className="bg-surface border border-border rounded-card p-4 space-y-1">
            <span className="text-[11px] text-content-secondary font-medium">За 30 дней</span>
            <div className="text-lg sm:text-xl font-bold text-content-primary tabular-nums truncate">
              {formatPrice(revenue30d)}
            </div>
            <div className="text-[10px] text-content-secondary">За последний месяц</div>
          </div>

          <div className="bg-surface border border-border rounded-card p-4 space-y-1">
            <span className="text-[11px] text-content-secondary font-medium">Текущий MRR</span>
            <div className="text-lg sm:text-xl font-bold text-accent tabular-nums truncate">
              {formatPrice(currentMrr)}
            </div>
            <div className="text-[10px] text-content-secondary tabular-nums">
              Plus ({plusCount}) • Pro ({proCount})
            </div>
          </div>
        </div>
      </div>

      {/* 2. RENEWAL QUEUE (ОЧЕРЕДЬ ПРОДЛЕНИЙ) */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Очередь продлений (заканчиваются через 1–5 дней)</span>
            </h3>
            <p className="text-[11px] text-content-secondary">
              Отправьте напоминание в Telegram с готовыми реквизитами для закрытия повторной оплаты
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20 tabular-nums self-start sm:self-auto">
            {renewalQueue.length} витрин
          </span>
        </div>

        {renewalQueue.length === 0 ? (
          <div className="p-6 rounded-[12px] bg-page border border-border text-center text-xs text-content-secondary">
            На ближайшие 5 дней нет подписок, требующих продления. Все активные витрины оплачены.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {renewalQueue.map((item) => {
              const tgText = encodeURIComponent(
                `Здравствуйте, ${item.store_name}! 👋\n\nНапоминаем, что ваша подписка на BioMart (${item.plan}) для витрины biomart.uz/${item.slug} заканчивается через ${item.days_left} дн.\n\n💳 Реквизиты для продления:\nКарта: ${cardNumber || '8600 ...'} (${cardHolder || 'BioMart'})\nСумма: ${formatPrice(item.price)}\n\nОтправьте чек сюда, и мы продлим витрину!`
              );
              const tgLink = item.telegram
                ? `https://t.me/${item.telegram}?text=${tgText}`
                : null;

              return (
                <div
                  key={item.slug}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-content-primary">
                        {item.store_name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-page border border-border text-accent uppercase">
                        {item.plan}
                      </span>
                      <span className="text-[11px] font-mono text-content-secondary">
                        biomart.uz/{item.slug}
                      </span>
                    </div>
                    <div className="text-[11px] text-content-secondary mt-0.5 tabular-nums">
                      Сумма продления: <b>{formatPrice(item.price)}</b> • Истекает через:{' '}
                      <span className="text-amber-500 font-semibold">{item.days_left} дн.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyRenewalMessage(item)}
                      className="min-h-[44px] px-3 py-1.5 rounded-btn bg-page border border-border hover:bg-surface text-content-primary text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Скопировать готовое сообщение для Instagram / SMS"
                    >
                      {copiedId === item.slug ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-accent" />
                          <span className="text-accent">Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-content-secondary" />
                          <span>Скопировать текст</span>
                        </>
                      )}
                    </button>

                    {tgLink && (
                      <a
                        href={tgLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-3.5 py-1.5 rounded-btn bg-[#229ED9] hover:bg-[#1e8ec3] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Открыть в Telegram</span>
                      </a>
                    )}

                    {item.phone && (
                      <a
                        href={`tel:${item.phone.replace(/\D/g, '')}`}
                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-btn bg-page border border-border hover:bg-surface text-content-primary flex items-center justify-center transition-colors"
                        title={`Позвонить ${item.phone}`}
                      >
                        <Phone className="w-4 h-4 text-accent" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. REQUISITES & PRICING EDITOR (РЕДАКТОР РЕКВИЗИТОВ И ЦЕН) */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-accent" />
            <span>Управление реквизитами оплаты и тарифами платформы</span>
          </h3>
          <p className="text-[11px] text-content-secondary">
            Меняйте номер карты Uzcard / Humo, имя получателя и стоимость тарифов прямо отсюда без изменения кода и перезапуска Vercel
          </p>
        </div>

        <form onSubmit={handleSaveRequisites} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Номер карты Uzcard / Humo (для Click & Payme)
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="8600 0000 0000 0000"
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary font-mono focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                ФИО получателя карты
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="VILDSTON A."
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Банк / Примечание к карте
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Kapitalbank / Click / Payme"
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Инструкция покупателю для подтверждения
              </label>
              <input
                type="text"
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                placeholder="После оплаты отправьте чек боту @BioMartAssistant_bot"
                className="w-full px-3.5 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border/80">
            <h4 className="text-xs font-bold text-content-primary mb-3">
              Цены тарифов и лимиты
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Цена тарифа Plus (сум/мес)
                </label>
                <input
                  type="number"
                  value={plusPrice}
                  onChange={(e) => setPlusPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary font-mono tabular-nums focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Лимит товаров на Plus
                </label>
                <input
                  type="number"
                  value={plusLimit}
                  onChange={(e) => setPlusLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary font-mono tabular-nums focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Цена тарифа Pro (сум/мес)
                </label>
                <input
                  type="number"
                  value={proPrice}
                  onChange={(e) => setProPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary font-mono tabular-nums focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[44px] px-5 py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Сохранить реквизиты и тарифы</span>
                </>
              )}
            </button>

            {saveSuccess && (
              <span className="text-xs text-accent font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Настройки успешно обновлены!</span>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
