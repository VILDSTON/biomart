'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Zap, Loader2, User, Phone, MapPin, Truck, Store, AlertCircle, Tag, ShoppingBag } from 'lucide-react';
import { Order, Product, StoreSettings } from '@/types';
import { formatPrice, getContrastTextColor } from '@/lib/utils';
import { useBioMartStore } from '@/store/useStore';
import { translations } from '@/lib/i18n';

interface OneClickCheckoutModalProps {
  product: Product | null;
  storeSettings: StoreSettings;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const OneClickCheckoutModal: React.FC<OneClickCheckoutModalProps> = ({
  product,
  storeSettings,
  onClose,
  onOrderSuccess,
}) => {
  const { language } = useBioMartStore();
  const t = translations[language];

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998 ');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [variantError, setVariantError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length === 1) {
        setSelectedVariant(product.sizes[0]);
      } else {
        setSelectedVariant(null);
      }
      setVariantError(false);
      setErrorMessage(null);
      setAppliedPromo(null);
      setPromoCodeInput('');
      setPromoError(null);

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [product]);

  if (!product) return null;

  const hasVariants = product.sizes && product.sizes.length > 0;
  const variantLabel = product.variant_type || (language === 'uz' ? 'O‘lcham / variant' : 'Вариант / Размер');
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
  const currency = storeSettings.currency || 'сум';
  const customAccent = storeSettings.accent_color || '#1F7A5A';
  const accentTextColor = getContrastTextColor(customAccent);

  const subtotal = product.price;
  const discountAmount = appliedPromo ? Math.round((subtotal * appliedPromo.percent) / 100) : 0;
  const finalPrice = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = () => {
    setPromoError(null);
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) return;

    const available = storeSettings.promo_codes || [];
    const found = available.find((p) => p.code.toUpperCase() === clean && p.active !== false);

    if (found) {
      setAppliedPromo({ code: found.code, percent: found.discount_percent });
      setPromoCodeInput('');
    } else {
      setPromoError(language === 'uz' ? 'Promokod topilmadi' : 'Промокод не найден');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setCustomerPhone(val);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleFastOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (honeypot) return;

    if (hasVariants && !selectedVariant) {
      setVariantError(true);
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage(t.namePlaceholder);
      return;
    }

    const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 9) {
      setErrorMessage(t.phoneError);
      return;
    }

    if (deliveryType === 'delivery' && !address.trim()) {
      setErrorMessage(t.addressPlaceholder);
      return;
    }

    setIsSubmitting(true);

    const newOrder: Order = {
      id: Math.floor(1000 + Math.random() * 9000),
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      delivery_type: deliveryType,
      address: deliveryType === 'delivery' ? address.trim() : undefined,
      items: [
        {
          product_id: product.id,
          title: product.title,
          size: selectedVariant,
          price: product.price,
          quantity: 1,
          image: primaryImage,
        },
      ],
      total_price: finalPrice,
      promo_code: appliedPromo?.code,
      discount_amount: discountAmount > 0 ? discountAmount : undefined,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_slug: storeSettings.slug,
          seller_chat_id: storeSettings.telegram_chat_id,
          ...newOrder,
        }),
      }).catch(() => null);

      onOrderSuccess(newOrder);
      onClose();
    } catch {
      onOrderSuccess(newOrder);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface text-content-primary rounded-t-[20px] sm:rounded-card border border-border shadow-card z-10 max-h-[92vh] flex flex-col animate-slide-up-spring">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-[8px] bg-accent-soft text-accent flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-content-primary">
              Быстрый заказ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border bg-page hover:bg-surface-soft text-content-primary flex items-center justify-center transition-colors"
            aria-label="Закрыть окно"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1 overscroll-contain safe-pb">
          {/* Product Summary */}
          <div className="flex items-center gap-3 p-2.5 rounded-btn bg-page border border-border">
            <div className="relative w-12 h-14 rounded-[8px] overflow-hidden bg-surface border border-border shrink-0">
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-content-primary truncate">
                {product.title}
              </h4>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-sm font-bold text-content-primary tabular-nums">
                  {formatPrice(finalPrice, currency)}
                </span>
                {product.old_price && (
                  <span className="text-xs text-content-secondary line-through tabular-nums">
                    {formatPrice(product.old_price, currency)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleFastOrder} className="space-y-4">
            {/* Sizes Selection */}
            {hasVariants && (
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1.5">
                  {variantLabel}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((v) => {
                    const isSelected = selectedVariant === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(v);
                          setVariantError(false);
                        }}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-btn text-xs font-semibold border transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-accent text-accent-text border-accent shadow-xs ring-2 ring-accent/30'
                            : 'bg-page border-border text-content-primary hover:bg-surface-soft'
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
                {variantError && (
                  <p className="text-xs text-danger mt-1">Пожалуйста, выберите размер</p>
                )}
              </div>
            )}

            {/* Delivery Choice */}
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1.5">
                Способ получения:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`min-h-[40px] py-2 px-3 rounded-btn border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    deliveryType === 'delivery'
                      ? 'border-accent bg-accent-soft text-accent shadow-xs'
                      : 'bg-page border-border text-content-primary hover:bg-surface-soft'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{t.deliveryCourier}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`min-h-[40px] py-2 px-3 rounded-btn border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    deliveryType === 'pickup'
                      ? 'border-accent bg-accent-soft text-accent shadow-xs'
                      : 'bg-page border-border text-content-primary hover:bg-surface-soft'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{t.pickup}</span>
                </button>
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1">
                {t.name} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-secondary" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder={t.namePlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 rounded-btn text-xs border border-border bg-page text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1">
                {t.phone} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-secondary" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  onFocus={handleInputFocus}
                  placeholder="+998 90 123 45 67"
                  className="w-full pl-9 pr-3 py-2.5 rounded-btn text-xs font-mono border border-border bg-page text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Address */}
            {deliveryType === 'delivery' && (
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  {t.deliveryAddress} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-content-secondary" />
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder={t.addressPlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 rounded-btn text-xs border border-border bg-page text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent resize-none"
                  />
                </div>
              </div>
            )}

            {/* Promo code */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2 rounded-btn bg-accent-soft border border-accent/20 text-accent text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{appliedPromo.code} (-{appliedPromo.percent}%)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-content-secondary hover:text-content-primary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Промокод (если есть)"
                    className="flex-1 px-3 py-2 rounded-btn text-xs border border-border bg-page text-content-primary uppercase focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3.5 py-2 rounded-btn bg-page text-content-primary text-xs font-semibold border border-border hover:bg-surface-soft"
                  >
                    {t.apply}
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-[11px] text-danger mt-1 font-medium">{promoError}</p>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-btn bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Total and Order Button */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xs text-content-secondary">{t.totalToPay}:</span>
                <span className="text-base font-bold text-accent">
                  {formatPrice(finalPrice, currency)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] py-3 rounded-btn font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs disabled:opacity-50 bg-accent text-accent-text hover:bg-accent-hover"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Подтвердить заказ в Telegram</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
