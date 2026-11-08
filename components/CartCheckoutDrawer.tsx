'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Trash2, ArrowRight, Loader2, Truck, Store, MapPin, Phone, User, MessageSquare, Tag } from 'lucide-react';
import { CartItem, Order, OrderItem, StoreSettings } from '@/types';
import { formatPrice, getContrastTextColor } from '@/lib/utils';
import { useBioMartStore } from '@/store/useStore';
import { translations } from '@/lib/i18n';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  storeSettings: StoreSettings;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  items,
  storeSettings,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
}) => {
  const { language } = useBioMartStore();
  const t = translations[language];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998 ');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currency = storeSettings.currency || 'сум';
  const customAccent = storeSettings.accent_color || '#1F7A5A';
  const accentTextColor = getContrastTextColor(customAccent);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountAmount = appliedPromo ? Math.round(subtotal * (appliedPromo.percent / 100)) : 0;
  const totalSum = Math.max(0, subtotal - discountAmount);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setCustomerPhone(val);
  };

  const handleApplyPromo = () => {
    setPromoError('');
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) return;

    const matched = storeSettings.promo_codes?.find(
      (p) => p.code.toUpperCase() === clean && p.active
    );

    if (matched) {
      setAppliedPromo({ code: matched.code, percent: matched.discount_percent });
      setPromoCodeInput('');
    } else {
      setPromoError(language === 'uz' ? 'Promokod topilmadi' : 'Промокод не найден');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Scroll input into visible area when soft keyboard opens
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (honeypot) return; // bot detection

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

    const orderItems: OrderItem[] = items.map((i) => ({
      product_id: i.product.id,
      title: i.product.title,
      size: i.selected_size,
      price: i.product.price,
      quantity: i.quantity,
      image: i.product.images?.[0],
    }));

    const newOrder: Order = {
      id: Math.floor(1000 + Math.random() * 9000),
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      delivery_type: deliveryType,
      address: deliveryType === 'delivery' ? address.trim() : undefined,
      comment: comment.trim() || undefined,
      items: orderItems,
      total_price: totalSum,
      promo_code: appliedPromo?.code,
      discount_amount: discountAmount > 0 ? discountAmount : undefined,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    try {
      // Simulate / send to orders API
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
      onClearCart();
      onClose();
    } catch {
      onOrderSuccess(newOrder);
      onClearCart();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface text-content-primary h-full flex flex-col z-10 shadow-card animate-slide-up sm:animate-none">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-content-primary tracking-tight">
              {t.cart} ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-content-secondary hover:text-content-primary hover:bg-surface-soft transition-colors"
            aria-label="Закрыть корзину"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-5">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-xs text-content-secondary">{t.emptyCart}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Items List */}
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="flex items-center gap-3 p-2.5 rounded-btn border border-border bg-page"
                  >
                    <div className="relative w-12 h-14 rounded-[8px] overflow-hidden bg-surface border border-border shrink-0">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-content-primary truncate">
                        {item.product.title}
                      </h4>
                      {item.selected_size && (
                        <span className="text-[10px] text-content-secondary block">
                          Размер: {item.selected_size}
                        </span>
                      )}
                      <span className="text-xs font-bold text-content-primary tabular-nums mt-0.5 block">
                        {formatPrice(item.product.price)}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 border border-border bg-surface rounded-[8px] p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cart_item_id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold hover:bg-surface-soft"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold px-1.5 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cart_item_id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold hover:bg-surface-soft"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.cart_item_id)}
                      className="p-1 text-content-secondary hover:text-danger"
                      aria-label="Удалить товар"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Type */}
              <div className="pt-2">
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

              {/* Delivery Address */}
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

              {/* Comment */}
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  {t.comment}
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-content-secondary" />
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder={t.commentPlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 rounded-btn text-xs border border-border bg-page text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent resize-none"
                  />
                </div>
              </div>

              {/* Honeypot field for bot protection */}
              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Promo code block */}
              <div className="pt-1">
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
                      aria-label="Удалить промокод"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder={t.promoCode}
                      className="flex-1 px-3 py-2 rounded-btn text-xs uppercase font-mono border border-border bg-page text-content-primary focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3.5 py-2 rounded-btn bg-page border border-border text-content-primary text-xs font-semibold hover:bg-surface-soft"
                    >
                      {t.apply}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-[11px] text-danger mt-1">{promoError}</p>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-btn bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
                  {errorMessage}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Sticky Checkout Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border bg-surface space-y-3 shrink-0 safe-pb">
            {/* Price Breakdown */}
            <div className="space-y-1 text-xs tabular-nums">
              {appliedPromo && (
                <div className="flex justify-between text-content-secondary">
                  <span>Сумма:</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-accent font-semibold">
                  <span>Скидка ({appliedPromo?.percent}%):</span>
                  <span>-{formatPrice(discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline text-sm font-bold text-content-primary">
                <span>Итого к оплате:</span>
                <span className="text-base text-accent">
                  {formatPrice(totalSum, currency)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full min-h-[44px] py-3 px-4 text-xs font-bold rounded-btn flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98] shadow-xs bg-accent text-accent-text hover:bg-accent-hover"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.submitting}</span>
                </>
              ) : (
                <>
                  <span>Подтвердить заказ в Telegram</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-content-secondary">
              Заказ мгновенно поступит продавцу в Telegram
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
