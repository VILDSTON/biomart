'use client';

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { StoreSettings } from '@/types';
import { formatPrice, getContrastTextColor } from '@/lib/utils';

import { useBioMartStore } from '@/store/useStore';

interface FloatingCartBarProps {
  itemCount: number;
  totalPrice: number;
  storeSettings: StoreSettings;
  onClickCheckout: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  itemCount,
  totalPrice,
  storeSettings,
  onClickCheckout,
}) => {
  const { language } = useBioMartStore();
  if (itemCount <= 0) return null;

  const currency = storeSettings.currency || 'сум';
  const customAccent = storeSettings.accent_color || '#1F7A5A';
  const accentTextColor = getContrastTextColor(customAccent);

  const buttonLabel = storeSettings.button_text === 'buy'
    ? (language === 'uz' ? 'Xarid' : 'Купить')
    : storeSettings.button_text === 'order'
    ? (language === 'uz' ? 'Buyurtma' : 'Заказать')
    : (language === 'uz' ? 'Savatga' : 'В корзину');

  const countLabel = language === 'uz'
    ? `${itemCount} ta buyurtmada`
    : `${itemCount} шт. в заказе`;

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 max-w-md mx-auto px-3 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="pointer-events-auto rounded-card p-2.5 pl-3.5 flex items-center justify-between border border-border bg-surface text-content-primary shadow-card animate-slide-up transition-all">
        {/* Cart Count & Total Price */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-btn flex items-center justify-center shrink-0 shadow-xs bg-accent text-accent-text"
          >
            <ShoppingBag className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <span
              key={itemCount}
              className="text-[11px] text-content-secondary animate-fade-in"
            >
              {countLabel}
            </span>
            <span className="text-sm font-bold text-content-primary tabular-nums">
              {formatPrice(totalPrice, currency)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClickCheckout}
          className="min-h-[40px] flex items-center gap-1.5 font-semibold text-xs py-2 px-4 rounded-btn transition-all shrink-0 active:scale-95 shadow-xs bg-accent text-accent-text hover:bg-accent-hover"
        >
          <span>{buttonLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
