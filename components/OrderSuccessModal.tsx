'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, ShoppingBag } from 'lucide-react';
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
        <div className="rounded-btn p-3.5 border border-border bg-page text-left mb-4 space-y-1.5 tabular-nums text-xs">
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
          <div className="flex justify-between border-t border-border pt-2 mt-2 font-medium">
            <span className="text-content-primary font-semibold">{t.totalToPay}:</span>
            <span className="text-sm font-bold text-accent">
              {formatPrice(order.total_price, storeSettings.currency)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {telegramUsername && (
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] py-2.5 px-4 rounded-btn font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs bg-accent text-accent-text hover:bg-accent-hover"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.contactSellerTelegram}</span>
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
