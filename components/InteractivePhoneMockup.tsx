'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Check, X, Send, MapPin, Phone, MessageSquare, RotateCcw } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_STORE_SETTINGS } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

export const InteractivePhoneMockup: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>('M');
  const [cartCount, setCartCount] = useState(1);
  const [cartTotal, setCartTotal] = useState(320000);
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showTelegramReceipt, setShowTelegramReceipt] = useState(false);
  const [acceptedOrder, setAcceptedOrder] = useState(false);

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'cat-1', name: 'Худи' },
    { id: 'cat-2', name: 'Обувь' },
    { id: 'cat-3', name: 'Парфюм' },
  ];

  const filtered = MOCK_PRODUCTS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category_id === activeCategory;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.sizes?.[0] || 'M');
  };

  const handleOrderClick = () => {
    setSelectedProduct(null);
    setShowTelegramReceipt(true);
    setAcceptedOrder(false);
  };

  const handleFastAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setCartCount((c) => c + 1);
    setCartTotal((t) => t + product.price);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2000);
  };

  const currentOrderedTitle = selectedProduct ? selectedProduct.title : 'Худи Oversize Tashkent Underground';
  const currentOrderedPrice = selectedProduct ? selectedProduct.price : 320000;
  const currentOrderedSize = selectedVariant || 'M';

  return (
    <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-6 lg:gap-8">
      {/* Smartphone Frame */}
      <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[340px] shrink-0">
        <div className="relative rounded-[32px] border-[6px] border-[#1A1A1A] bg-surface shadow-card overflow-hidden">
          {/* Speaker / Notch */}
          <div className="absolute top-2 inset-x-0 z-40 flex justify-center pointer-events-none">
            <div className="w-20 h-3 bg-[#1A1A1A] rounded-full" />
          </div>

          {/* Screen Viewport */}
          <div className="bg-page h-[560px] overflow-y-auto no-scrollbar relative flex flex-col pt-6 pb-16">
            {/* Demo URL Bar */}
            <div className="bg-surface border-b border-border text-content-primary text-[11px] font-medium py-1.5 px-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-content-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>biomart.vercel.app/tashkent_drip</span>
              </div>
              <span className="text-[9px] text-accent font-semibold px-1.5 py-0.5 rounded bg-accent-soft">ДЕМО</span>
            </div>

            {/* Store Header inside Phone */}
            <div className="relative bg-surface border-b border-border p-3">
              <div className="flex items-center gap-2.5">
                <div className="relative w-11 h-11 rounded-[10px] overflow-hidden bg-page border border-border shrink-0">
                  {!avatarError ? (
                    <Image
                      src={MOCK_STORE_SETTINGS.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      sizes="44px"
                      unoptimized
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-accent flex items-center justify-center text-white font-semibold text-xs">
                      TD
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-semibold text-content-primary truncate">
                      TASHKENT DRIP
                    </h4>
                    <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-brand-soft text-brand text-[8px] font-semibold border border-brand-border shrink-0 select-none">
                      <Check className="w-2 h-2 stroke-[3]" />
                      <span>подтверждено BioMart</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-content-secondary truncate">
                    Streetwear & Sneakers в Ташкенте
                  </p>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-[10px] shrink-0 transition-colors ${
                      activeCategory === c.id
                        ? 'bg-accent text-white'
                        : 'bg-page border border-border text-content-primary hover:bg-surface'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid inside Phone */}
            <div className="p-2.5 grid grid-cols-2 gap-2">
              {filtered.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className="bg-surface border border-border rounded-[10px] overflow-hidden cursor-pointer flex flex-col hover:border-accent transition-colors"
                >
                  <div className="relative aspect-[4/5] w-full bg-page overflow-hidden">
                    <Image
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="150px"
                      unoptimized
                    />
                    {p.old_price && (
                      <span className="absolute top-1 left-1 bg-content-primary text-white text-[9px] font-semibold px-1 py-0.5 rounded-[4px]">
                        Скидка
                      </span>
                    )}
                  </div>
                  <div className="p-2 flex flex-col flex-1 justify-between">
                    <div className="text-[10px] font-medium text-content-primary line-clamp-1">
                      {p.title}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] font-semibold text-content-primary">
                        {formatPrice(p.price)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleFastAdd(p, e)}
                        className="w-5 h-5 rounded-[6px] bg-accent-soft text-accent hover:bg-accent hover:text-white flex items-center justify-center text-xs font-semibold transition-colors"
                        title="Добавить"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Cart in Phone */}
            <div
              onClick={handleOrderClick}
              className="absolute bottom-2 inset-x-2.5 bg-accent text-white p-2.5 rounded-[10px] flex items-center justify-between shadow-sm cursor-pointer hover:opacity-95 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{cartCount} шт. • {formatPrice(cartTotal)}</span>
              </div>
              <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-[6px]">
                Заказать →
              </span>
            </div>

            {/* Quick Success Toast */}
            {isSuccessToast && (
              <div className="absolute top-14 inset-x-4 bg-content-primary text-white text-[11px] py-1.5 px-3 rounded-[10px] text-center shadow-md animate-fade-in z-30">
                Товар добавлен в корзину
              </div>
            )}

            {/* Bottom Sheet Card inside Phone */}
            {selectedProduct && (
              <div className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end animate-fade-in">
                <div className="bg-surface rounded-t-[16px] p-3.5 space-y-2.5 border-t border-border animate-slide-up-spring">
                  <div className="w-8 h-1 bg-border rounded-full mx-auto -mt-1 mb-1" />
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-semibold text-content-primary pr-2">
                      {selectedProduct.title}
                    </h5>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="p-1 text-content-secondary hover:text-content-primary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs font-semibold text-accent">
                    {formatPrice(selectedProduct.price)}
                  </div>
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <span className="text-[10px] text-content-secondary block mb-1">Размер:</span>
                      <div className="flex gap-1.5">
                        {selectedProduct.sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedVariant(s)}
                            className={`text-[10px] px-2.5 py-1 rounded-[6px] border font-medium transition-all ${
                              selectedVariant === s
                                ? 'bg-accent text-white border-accent'
                                : 'border-border text-content-primary bg-page hover:bg-surface'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleOrderClick}
                    className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-[10px] transition-all shadow-xs"
                  >
                    Заказать сразу
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hint under phone on desktop */}
        <p className="text-[11px] text-center text-content-secondary mt-2">
          👆 Нажмите товар и «Заказать», чтобы увидеть чек
        </p>
      </div>

      {/* Animated Telegram Bot Receipt Message (ШАГ 1: Появляется рядом или под телефоном за 300-400 мс) */}
      <div className="w-full max-w-[340px] sm:max-w-[360px]">
        {showTelegramReceipt ? (
          <div className="animate-receipt bg-surface border border-border rounded-[18px] p-4 shadow-card text-content-primary space-y-3 relative overflow-hidden">
            {/* Telegram Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1 font-semibold text-xs text-content-primary">
                    <span>BioMart Bot</span>
                    <Check className="w-3 h-3 text-sky-500 stroke-[3]" />
                  </div>
                  <span className="text-[10px] text-content-secondary">бот • только что</span>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-soft text-accent font-semibold">
                Заказ #1042
              </span>
            </div>

            {/* Receipt Body */}
            <div className="space-y-2 text-xs font-sans">
              <div className="bg-page rounded-[10px] p-2.5 border border-border space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-content-primary">{currentOrderedTitle}</span>
                </div>
                <div className="flex justify-between text-content-secondary text-[11px]">
                  <span>Размер: <b className="text-content-primary">{currentOrderedSize}</b> • 1 шт.</span>
                  <span className="font-semibold text-content-primary">{formatPrice(currentOrderedPrice)}</span>
                </div>
              </div>

              {/* Customer and Delivery info */}
              <div className="text-[11px] space-y-1 text-content-secondary pt-0.5">
                <div className="flex items-center justify-between">
                  <span>Клиент:</span>
                  <span className="font-medium text-content-primary">Сардор Алимов</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Телефон:</span>
                  <span className="font-medium text-content-primary">+998 90 123 45 67</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Доставка:</span>
                  <span className="font-medium text-content-primary">Курьер Yandex</span>
                </div>
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-border">
                  <span className="shrink-0 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-accent shrink-0" />
                    <span>Адрес:</span>
                  </span>
                  <span className="text-right text-content-primary font-medium">
                    Ташкент, Чиланзар 9, д. 14, кв. 28
                  </span>
                </div>
                <div className="text-right">
                  <a
                    href="https://yandex.uz/maps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-sky-500 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Открыть на Яндекс Картах</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-semibold">
                <span>Итого к оплате:</span>
                <span className="text-sm font-bold text-accent">{formatPrice(currentOrderedPrice)}</span>
              </div>
            </div>

            {/* Telegram Action Buttons */}
            <div className="pt-1 space-y-1.5">
              {!acceptedOrder ? (
                <button
                  type="button"
                  onClick={() => setAcceptedOrder(true)}
                  className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Принять заказ</span>
                </button>
              ) : (
                <div className="w-full py-2 bg-brand-soft text-brand rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 border border-brand/20">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Заказ передан в доставку</span>
                </div>
              )}

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowTelegramReceipt(false);
                    setAcceptedOrder(false);
                  }}
                  className="flex-1 py-1.5 bg-page hover:bg-surface-soft border border-border text-content-secondary hover:text-content-primary rounded-[10px] text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сбросить демо</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface/60 border border-dashed border-border rounded-[18px] p-5 text-center space-y-2">
            <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
              <Send className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold text-content-primary">
              Чек в Telegram в реальном времени
            </h4>
            <p className="text-[11px] text-content-secondary leading-relaxed">
              Нажмите любой товар в телефоне и кнопку «Заказать». Чек с составом заказа, адресом и суммой моментально появится здесь.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
