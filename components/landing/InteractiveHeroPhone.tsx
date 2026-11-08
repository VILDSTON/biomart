'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Check,
  Send,
  X,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductItem {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  sizes: string[];
}

const DEMO_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    title: 'Худи Oversize «Tashkent Underground»',
    price: 320000,
    oldPrice: 390000,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'p2',
    title: 'Футболка Heavyweight Black Boxy',
    price: 190000,
    oldPrice: 240000,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: 'p3',
    title: 'Кроссовки Street Runner V2',
    price: 650000,
    oldPrice: 780000,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    sizes: ['40', '41', '42', '43'],
  },
];

interface InteractiveHeroPhoneProps {
  onOrderCompleted?: () => void;
  showOverlayReceiptOnMobile?: boolean;
}

export const InteractiveHeroPhone: React.FC<InteractiveHeroPhoneProps> = ({
  onOrderCompleted,
  showOverlayReceiptOnMobile = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [orderStep, setOrderStep] = useState<number>(0);
  const [isTelegramOpen, setIsTelegramOpen] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [simulatedTouch, setSimulatedTouch] = useState<{ x: number; y: number } | null>(null);

  // Parallax tilt (Desktop only)
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSpecialApp = /instagram|fban|fbav|telegram/i.test(navigator.userAgent);
    setIsTouchDevice(isTouch || isSpecialApp);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // max 4 degrees tilt
    const tiltX = -(y / (rect.height / 2)) * 4;
    const tiltY = (x / (rect.width / 2)) * 4;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Automated walkthrough sequence when user hasn't touched the mockup
  useEffect(() => {
    if (userInteracted) return;

    let timer: NodeJS.Timeout;

    // Sequence stages:
    // 0: Start -> 1: Open Product (1.2s) -> 2: Select M (2.4s) -> 3: Click Order (3.6s) -> 4: Telegram Receipt (4.4s) -> Reset (10.5s)
    const runCycle = () => {
      // Step 1: Open first product
      timer = setTimeout(() => {
        if (userInteracted) return;
        setSelectedProduct(DEMO_PRODUCTS[0]);
        setSelectedSize('S');

        // Step 2: Select Size M
        timer = setTimeout(() => {
          if (userInteracted) return;
          setSelectedSize('M');

          // Step 3: Trigger order
          timer = setTimeout(() => {
            if (userInteracted) return;
            setSelectedProduct(null);
            setIsTelegramOpen(true);
            if (onOrderCompleted) onOrderCompleted();

            // Step 4: Stay 6 seconds with receipt, then reset
            timer = setTimeout(() => {
              if (userInteracted) return;
              setIsTelegramOpen(false);
              // Restart next cycle
              runCycle();
            }, 6000);
          }, 1200);
        }, 1200);
      }, 1400);
    };

    runCycle();

    return () => clearTimeout(timer);
  }, [userInteracted, onOrderCompleted]);

  const handleManualProductClick = (prod: ProductItem) => {
    setUserInteracted(true);
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes[0] || 'M');
  };

  const handleManualOrderSubmit = () => {
    setUserInteracted(true);
    setSelectedProduct(null);
    setIsTelegramOpen(true);
    if (onOrderCompleted) onOrderCompleted();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[340px] xs:max-w-[360px] sm:max-w-[380px] mx-auto select-none"
      style={{
        transform:
          tilt.x !== 0 || tilt.y !== 0
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 200ms ease-out',
      }}
    >
      {/* Outer Phone Shell */}
      <div className="relative rounded-[36px] p-2 bg-[#1A1A1A] border border-[#2C2C2C] shadow-[0_24px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.5)]">
        {/* Speaker Notch */}
        <div className="absolute top-3.5 inset-x-0 z-40 flex justify-center pointer-events-none">
          <div className="w-20 h-3.5 bg-[#121212] rounded-full flex items-center justify-end px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1F7A5A]/60" />
          </div>
        </div>

        {/* Screen Bezel & Display */}
        <div className="relative rounded-[28px] overflow-hidden bg-page border border-border h-[560px] flex flex-col pt-7 pb-2 text-content-primary">
          {/* Top Mockup URL Bar */}
          <div className="bg-surface border-b border-border px-3 py-1.5 flex items-center justify-between text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-content-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>biomart.uz/tashkent_drip</span>
            </div>
            <span className="text-[9px] font-semibold text-accent bg-accent-soft px-1.5 py-0.2 rounded-full">
              ДЕМО
            </span>
          </div>

          {/* Store Info Banner */}
          <div className="bg-surface border-b border-border p-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-accent text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                TD
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-content-primary truncate leading-tight">
                  TASHKENT DRIP
                </h4>
                <p className="text-[10px] text-content-secondary truncate mt-0.5">
                  Одежда & Streetwear в Ташкенте
                </p>
              </div>
            </div>

            {/* Quick Category Tabs */}
            <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
              <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-semibold bg-accent text-white shrink-0">
                Все товары
              </span>
              <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-medium bg-page border border-border text-content-secondary shrink-0">
                Худи
              </span>
              <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-medium bg-page border border-border text-content-secondary shrink-0">
                Футболки
              </span>
              <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-medium bg-page border border-border text-content-secondary shrink-0">
                Обувь
              </span>
            </div>
          </div>

          {/* Product Grid inside Phone */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleManualProductClick(prod)}
                  className="bg-surface border border-border rounded-[12px] p-2 flex flex-col justify-between cursor-pointer hover:border-accent/50 transition-all active:scale-[0.98]"
                >
                  <div className="relative aspect-square w-full rounded-[8px] overflow-hidden bg-surface-soft mb-1.5">
                    <Image
                      src={prod.image}
                      alt={prod.title}
                      fill
                      className="object-cover"
                      sizes="140px"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-content-primary line-clamp-2 leading-tight">
                      {prod.title}
                    </h5>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[11px] font-bold text-accent">
                        {formatPrice(prod.price, 'сум')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-1.5 w-full py-1 rounded-[6px] bg-accent-soft hover:bg-accent text-accent hover:text-white text-[9px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Выбрать</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Sheet Modal (Product Detail) */}
          {selectedProduct && (
            <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-2xs flex flex-col justify-end">
              <div className="bg-surface border-t border-border rounded-t-[20px] p-3.5 space-y-3 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold uppercase text-accent tracking-wider block">
                      Быстрое оформление
                    </span>
                    <h4 className="text-xs font-bold text-content-primary line-clamp-1 mt-0.5">
                      {selectedProduct.title}
                    </h4>
                    <span className="text-xs font-bold text-accent">
                      {formatPrice(selectedProduct.price, 'сум')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserInteracted(true);
                      setSelectedProduct(null);
                    }}
                    className="p-1 text-content-secondary hover:text-content-primary rounded-full hover:bg-surface-soft"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Size Selector */}
                <div>
                  <span className="text-[10px] font-semibold text-content-secondary block mb-1">
                    Выберите размер:
                  </span>
                  <div className="flex gap-1.5">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setUserInteracted(true);
                          setSelectedSize(s);
                        }}
                        className={`w-8 h-8 rounded-[8px] text-[10px] font-bold flex items-center justify-center transition-all ${
                          selectedSize === s
                            ? 'bg-accent text-white shadow-xs scale-105'
                            : 'bg-page border border-border text-content-primary hover:border-accent/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Button */}
                <button
                  type="button"
                  onClick={handleManualOrderSubmit}
                  className="w-full py-2.5 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Заказать в 1 клик ({selectedSize})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Telegram Receipt Notification */}
      {isTelegramOpen && (
        <div className="absolute -bottom-6 -right-3 xs:-right-6 sm:-right-8 z-50 w-[92%] xs:w-[320px] bg-surface border-2 border-accent rounded-[16px] p-3.5 sm:p-4 shadow-[0_16px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
                <Send className="w-2.5 h-2.5" />
              </div>
              <span className="text-[11px] font-bold text-content-primary">
                @BioMartBot
              </span>
            </div>
            <span className="text-[9px] font-mono text-accent bg-accent-soft px-1.5 py-0.2 rounded-full font-semibold">
              Сразу в Telegram
            </span>
          </div>

          <div className="space-y-1.5 pt-2 text-[11px] font-mono">
            <div className="flex items-center justify-between font-bold text-content-primary">
              <span>⚡️ ЗАКАЗ #1042</span>
              <span className="text-accent">320 000 сум</span>
            </div>
            <div className="text-[10px] font-sans text-content-primary font-medium leading-tight">
              🛍 Худи Oversize «Tashkent» ({selectedSize}) × 1 шт.
            </div>
            <div className="text-[10px] font-sans text-content-secondary leading-tight">
              👤 Сардор Алимов • +998 90 123 45 67
            </div>
            <div className="text-[10px] font-sans text-content-secondary leading-tight flex items-center gap-1">
              <MapPin className="w-3 h-3 text-accent shrink-0" />
              <span>Ташкент, Чиланзар 9, д. 14, кв. 28</span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[10px] font-sans text-accent font-semibold">
              <span>🚚 Курьер Yandex</span>
              <span>Оплата Click</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between">
            <span className="text-[9px] text-content-secondary">
              Заказ уже готов к отправке
            </span>
            <button
              type="button"
              onClick={() => setIsTelegramOpen(false)}
              className="text-[10px] text-accent font-bold hover:underline cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
