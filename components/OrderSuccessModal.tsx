'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, ShoppingBag, CreditCard, Copy, Check } from 'lucide-react';
import { Order, StoreSettings } from '@/types';
import { formatPrice, getContrastTextColor } from '@/lib/utils';
import { useBioMartStore } from '@/store/useStore';
import { translations } from '@/lib/i18n';

interface OrderSuccessModalProps {
  isOpen: boolean;
  order: Order | null;
  storeSettings: StoreSettings;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  order,
  storeSettings,
  onClose,
}) => {
  const { language } = useBioMartStore();
  const t = translations[language];

  const [copiedCard, setCopiedCard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const accent = storeSettings.theme_settings?.accent_color || storeSettings.accent_color || '#111827';
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: [accent, '#FFFFFF', '#1A1A1A'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen, storeSettings]);

  if (!isOpen || !order) return null;

  const telegramUsername = storeSettings.telegram_username?.replace('@', '') || '';
  const customAccent = storeSettings.accent_color || '#1F7A5A';
  const accentTextColor = getContrastTextColor(customAccent);

  const cardNumber = storeSettings.card_number || storeSettings.theme_settings?.card_number || '';
  const cardHolder = storeSettings.card_holder || storeSettings.theme_settings?.card_holder || '';
  const isCardPayment = order.payment_method === 'card' || Boolean(cardNumber);

  const handleCopyCard = () => {
    if (!cardNumber) return;
    const cleanDigits = cardNumber.replace(/\s+/g, '');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cleanDigits);
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    }
  };

  const formatCard = (num: string) => {
    const clean = num.replace(/\D/g, '');
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-sm rounded-card p-6 text-center shadow-card bg-surface border border-border text-content-primary animate-slide-up-spring">
        {/* Animated Success Icon */}
        <div className="w-12 h-12 rounded-[12px] bg-accent-soft text-accent flex items-center justify-center mx-auto mb-3 shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        {/* Order Badge */}
        <div className="inline-block px-2.5 py-1 rounded-[6px] bg-page border border-border text-xs font-semibold text-content-secondary mb-2 tabular-nums">
          {t.orderNum(order.id)}
        </div>

        <h3 className="text-lg font-bold tracking-tight text-content-primary mb-1">
          {t.orderSuccessTitle}
        </h3>

        <p className="text-xs text-content-secondary leading-relaxed mb-4">
          {t.orderSuccessDesc}
        </p>

        {/* Order Summary Box */}
        <div className="rounded-btn p-3.5 border border-border bg-page text-left mb-3 space-y-1.5 tabular-nums text-xs">
          <div className="flex justify-between text-content-secondary">
            <span>{t.recipient}:</span>
            <span className="font-semibold text-content-primary">{order.customer_name}</span>
          </div>
          <div className="flex justify-between text-content-secondary">
            <span>{t.method}:</span>
            <span className="font-semibold text-content-primary">
              {order.delivery_type === 'delivery' ? t.deliveryCourier : t.pickup}
            </span>
          </div>
          <div className="flex justify-between text-content-secondary">
            <span>Оплата:</span>
            <span className="font-semibold text-content-primary">
              {order.payment_method === 'card' ? '💳 Click / Payme' : '💵 Наличными'}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2 font-medium">
            <span className="text-content-primary font-semibold">{t.totalToPay}:</span>
            <span className="text-sm font-bold text-accent">
              {formatPrice(order.total_price, storeSettings.currency)}
            </span>
          </div>
        </div>

        {/* Card Payment Requisites Box (Uzcard / Humo for Click & Payme direct transfer) */}
        {isCardPayment && cardNumber && (
          <div className="rounded-btn p-3 border border-accent/25 bg-accent-soft text-left mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Оплата на карту Click / Payme</span>
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface border border-border text-content-secondary">
                Uzcard / Humo
              </span>
            </div>

            <div className="flex items-center justify-between bg-surface border border-border px-3 py-2 rounded-[8px] gap-2">
              <span className="font-mono font-bold text-xs sm:text-sm text-content-primary tracking-wider">
                {formatCard(cardNumber)}
              </span>
              <button
                type="button"
                onClick={handleCopyCard}
                className="px-2.5 py-1 rounded-[6px] text-[11px] font-semibold bg-accent text-accent-text hover:bg-accent-hover transition-colors flex items-center gap-1 shrink-0"
              >
                {copiedCard ? (
                  <>
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Копировать</span>
                  </>
                )}
              </button>
            </div>

            {cardHolder && (
              <div className="text-[11px] text-content-secondary flex justify-between px-0.5">
                <span>Владелец карты:</span>
                <span className="font-semibold text-content-primary uppercase">{cardHolder}</span>
              </div>
            )}

            <p className="text-[10px] text-content-secondary leading-snug px-0.5">
              💡 Переведите сумму через приложение <b>Click</b> или <b>Payme</b> и отправьте чек продавцу в Telegram.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {telegramUsername && (
            <a
              href={`https://t.me/${telegramUsername}?text=${encodeURIComponent(
                order.payment_method === 'card'
                  ? `Здравствуйте! Оформил(а) заказ №${order.id} на сумму ${formatPrice(order.total_price, storeSettings.currency)}. Отправляю чек об оплате на карту:`
                  : `Здравствуйте! Я оформил(а) заказ №${order.id} на сумму ${formatPrice(order.total_price, storeSettings.currency)}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] py-2.5 px-4 rounded-btn font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs bg-accent text-accent-text hover:bg-accent-hover"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{order.payment_method === 'card' ? 'Отправить чек в Telegram' : t.contactSellerTelegram}</span>
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-btn font-semibold text-xs flex items-center justify-center gap-2 transition-colors bg-page hover:bg-surface-soft text-content-primary border border-border"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.backToCatalog}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
