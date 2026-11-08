'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Check, AlertCircle, ChevronLeft, ChevronRight, ShoppingBag, Share2 } from 'lucide-react';
import { Product, StoreSettings } from '@/types';
import { calculateDiscount, formatPrice, getContrastTextColor } from '@/lib/utils';
import { useBioMartStore } from '@/store/useStore';
import { translations } from '@/lib/i18n';

interface ProductDetailModalProps {
  product: Product | null;
  storeSettings: StoreSettings;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string | null, quantity?: number) => void;
  onBuyOneClick?: (product: Product, size?: string | null, quantity?: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  storeSettings,
  onClose,
  onAddToCart,
}) => {
  const { language } = useBioMartStore();
  const t = translations[language];

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variantError, setVariantError] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const handleShareProduct = () => {
    if (!product) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://biomart.vercel.app';
    const slug = storeSettings.slug || 'shop';
    const url = `${origin}/${slug}?product=${product.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  // Swipe / Drag down to dismiss state
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const galleryTouchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.sizes && product.sizes.length === 1 ? product.sizes[0] : null);
      setActiveImageIndex(0);
      setQuantity(1);
      setVariantError(false);
      setIsAddedFeedback(false);
      setDragOffset(0);
    }
  }, [product]);

  // Lock background scroll when bottom sheet is open (Rule: prevent background scroll)
  useEffect(() => {
    if (!product) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Support browser back button closing sheet rather than leaving page
    window.history.pushState({ biomartModal: 'product' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [product, onClose]);

  if (!product) return null;

  const currency = storeSettings.currency || 'сум';
  const customAccent = storeSettings.accent_color || '#1F7A5A';
  const accentTextColor = getContrastTextColor(customAccent);
  const variantTitle = product.variant_type || (language === 'uz' ? 'O‘lcham / variant' : 'Размер / вариант');
  const discount = calculateDiscount(product.price, product.old_price);
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];
  const hasVariants = product.sizes && product.sizes.length > 0;

  // Touch handlers for sheet drag-down to close
  const handleSheetTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleSheetTouchEnd = () => {
    if (dragOffset > 90) {
      onClose();
    }
    setDragOffset(0);
    touchStartY.current = null;
  };

  // Touch handlers for photo gallery swipe
  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    galleryTouchStartX.current = e.touches[0].clientX;
  };

  const handleGalleryTouchEnd = (e: React.TouchEvent) => {
    if (galleryTouchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - galleryTouchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        // Swipe left -> next image
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swipe right -> previous image
        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }
    galleryTouchStartX.current = null;
  };

  const handleAddToCart = () => {
    if (!product.in_stock) return;
    if (hasVariants && !selectedVariant) {
      setVariantError(true);
      return;
    }
    onAddToCart(product, selectedVariant, quantity);
    setIsAddedFeedback(true);
    setTimeout(() => {
      setIsAddedFeedback(false);
      onClose();
    }, 500);
  };

  // Button text preset mapping
  const buttonLabel = storeSettings.button_text === 'buy'
    ? (language === 'uz' ? 'Sotib olish' : 'Купить')
    : storeSettings.button_text === 'order'
    ? (language === 'uz' ? 'Buyurtma berish' : 'Заказать')
    : (language === 'uz' ? 'Savatga' : 'В корзину');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        onTouchStart={handleSheetTouchStart}
        onTouchMove={handleSheetTouchMove}
        onTouchEnd={handleSheetTouchEnd}
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: dragOffset > 0 ? 'none' : 'transform 200ms ease-out',
        }}
        className="relative w-full max-w-md rounded-t-[20px] sm:rounded-card max-h-[92vh] overflow-hidden flex flex-col z-10 bg-surface border border-border text-content-primary shadow-card animate-slide-up-spring"
      >
        {/* Top Handle for mobile swipe down gesture */}
        <div className="sm:hidden w-12 h-1.5 bg-border rounded-full mx-auto my-2.5 shrink-0 cursor-grab" />

        {/* Close Button - High contrast, visible on dark & light photos */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-surface/95 dark:bg-black/75 backdrop-blur-md border border-border text-content-primary hover:scale-105 active:scale-95 shadow-md flex items-center justify-center transition-all"
          aria-label="Закрыть окно"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Main Image with swipe support */}
          <div
            onTouchStart={handleGalleryTouchStart}
            onTouchEnd={handleGalleryTouchEnd}
            className="relative aspect-[4/5] w-full bg-page border-b border-border select-none"
          >
            <Image
              src={images[activeImageIndex]}
              alt={product.title}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 448px"
              priority
              unoptimized
            />

            {discount !== null && product.in_stock && (
              <div className="absolute top-3 left-3 bg-accent text-accent-text font-bold text-xs px-2 py-0.5 rounded-[6px] tabular-nums shadow-xs">
                -{discount}%
              </div>
            )}

            {!product.in_stock && (
              <div className="absolute inset-0 bg-page/80 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-surface border border-border text-content-secondary font-semibold text-xs px-3.5 py-1.5 rounded-[10px] shadow-xs">
                  {t.outOfStock}
                </span>
              </div>
            )}

            {/* Gallery Navigation Arrows - High contrast, visible on dark & light photos */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-surface/95 dark:bg-black/75 backdrop-blur-md border border-border text-content-primary hover:scale-110 active:scale-95 shadow-md flex items-center justify-center transition-all"
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-surface/95 dark:bg-black/75 backdrop-blur-md border border-border text-content-primary hover:scale-110 active:scale-95 shadow-md flex items-center justify-center transition-all"
                  aria-label="Следующее фото"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Dot Pagination Indicators */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImageIndex === i
                          ? 'w-4 bg-accent'
                          : 'w-1.5 bg-border/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info Section */}
          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-1 tabular-nums">
                <span className="text-xl font-bold text-content-primary">
                  {formatPrice(product.price, currency)}
                </span>
                {product.old_price && (
                  <span className="text-xs font-normal text-content-secondary line-through">
                    {formatPrice(product.old_price, currency)}
                  </span>
                )}
              </div>
              <h2 className="text-base font-semibold text-content-primary leading-snug overflow-wrap-anywhere">
                {product.title}
              </h2>
            </div>

            {/* Variation Selection (Sizes) */}
            {hasVariants && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-content-secondary">
                    {variantTitle}:
                  </span>
                  {selectedVariant && (
                    <span className="text-xs font-semibold text-accent">
                      {selectedVariant}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((variant) => {
                    const isSelected = selectedVariant === variant;
                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(variant);
                          setVariantError(false);
                        }}
                        className={`min-w-10 min-h-[40px] px-3.5 py-1.5 rounded-[10px] text-xs font-semibold border transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-accent text-accent-text border-accent shadow-xs ring-2 ring-accent/30'
                            : 'bg-page text-content-primary border-border hover:bg-surface-soft'
                        }`}
                      >
                        {variant}
                      </button>
                    );
                  })}
                </div>

                {variantError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Пожалуйста, выберите нужный размер</span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Controls */}
            {product.in_stock && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-content-secondary">Количество:</span>
                <div className="flex items-center gap-2 border border-border bg-page rounded-[10px] p-0.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-[8px] bg-surface border border-border text-xs font-semibold flex items-center justify-center disabled:opacity-40 text-content-primary"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold px-2 tabular-nums text-content-primary">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-[8px] bg-surface border border-border text-xs font-semibold flex items-center justify-center text-content-primary"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-content-secondary leading-relaxed whitespace-pre-line overflow-wrap-anywhere">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Bottom Bar (Touch target >= 44px) */}
        <div className="p-3 border-t border-border bg-surface flex gap-2 safe-pb items-center">
          <button
            type="button"
            onClick={handleShareProduct}
            className="min-h-[44px] px-3 rounded-[10px] border border-border bg-page hover:bg-surface-soft text-content-primary flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors active:scale-95 shrink-0"
            title="Скопировать ссылку на товар"
            aria-label="Скопировать ссылку на товар"
          >
            {isLinkCopied ? (
              <>
                <Check className="w-4 h-4 text-accent stroke-[3]" />
                <span className="text-accent text-[11px]">{language === 'uz' ? 'Nusxalandi!' : 'Ссылка скопирована!'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-content-secondary" />
                <span className="text-[11px] text-content-primary">{language === 'uz' ? 'Ulashish' : 'Поделиться'}</span>
              </>
            )}
          </button>

          {product.in_stock ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 min-h-[44px] py-2.5 rounded-[10px] font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs bg-accent text-accent-text hover:bg-accent-hover"
            >
              {isAddedFeedback ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Добавлено в заказ!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{buttonLabel} • {formatPrice(product.price * quantity, currency)}</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full min-h-[44px] py-2.5 rounded-[10px] bg-page text-content-secondary text-xs font-medium text-center border border-border flex items-center justify-center">
              Товара нет в наличии
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
