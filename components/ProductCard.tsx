'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Check, Image as ImageIcon } from 'lucide-react';
import { CatalogLayout, Product, StoreSettings } from '@/types';
import { calculateDiscount, formatPrice, getContrastTextColor } from '@/lib/utils';
import { useBioMartStore } from '@/store/useStore';
import { translations } from '@/lib/i18n';

interface ProductCardProps {
  product: Product;
  storeSettings: StoreSettings;
  layout?: CatalogLayout;
  onOpenDetail: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onOneClickBuy?: (product: Product) => void;
  isInCart?: boolean;
}

function formatSizesLabel(sizes?: string[]): string | null {
  if (!sizes || sizes.length === 0) return null;
  if (sizes.length === 1) return sizes[0];
  const first = sizes[0].trim();
  const last = sizes[sizes.length - 1].trim();
  if (first.length <= 4 && last.length <= 4) {
    return `${first}–${last}`;
  }
  const count = sizes.length;
  if (count === 1) return '1 размер';
  if (count >= 2 && count <= 4) return `${count} размера`;
  return `${count} размеров`;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  storeSettings,
  layout = 'grid',
  onOpenDetail,
  onQuickAdd,
  isInCart = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { language } = useBioMartStore();
  const t = translations[language];

  const discount = calculateDiscount(product.price, product.old_price);
  const rawImage = product.images?.[0];
  const hasImage = Boolean(rawImage) && !imageError;
  const sizesLabel = formatSizesLabel(product.sizes);
  const customAccent = storeSettings.accent_color || '#1F7A5A';
  const accentTextColor = getContrastTextColor(customAccent);

  // Settings toggles
  const showOldPrice = storeSettings.show_old_price !== false;
  const showStock = storeSettings.show_stock !== false;
  const showSizesOnCard = storeSettings.show_sizes_on_card !== false;

  const handleCardClick = () => {
    onOpenDetail(product);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.in_stock) return;

    if (product.sizes && product.sizes.length > 0) {
      onOpenDetail(product);
    } else {
      onQuickAdd(product);
    }
  };

  // =========================================================================
  // LIST VIEW OR COMPACT LAYOUT
  // =========================================================================
  if (layout === 'list' || storeSettings.card_style === 'compact') {
    return (
      <div
        onClick={handleCardClick}
        className="group relative flex gap-3 p-3 rounded-card border border-border bg-surface hover:border-accent/40 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
      >
        {/* Left: 4:5 image with blur-up */}
        <div className="relative w-20 aspect-[4/5] rounded-[10px] overflow-hidden bg-page border border-border shrink-0">
          {hasImage ? (
            <Image
              src={rawImage!}
              alt={product.title}
              fill
              sizes="80px"
              className={`object-cover transition-all duration-300 ${imageLoaded ? 'blur-0 scale-100 opacity-100' : 'blur-xs scale-105 opacity-80'}`}
              onLoad={() => setImageLoaded(true)}
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center text-content-secondary">
              <ImageIcon className="w-4 h-4 mb-0.5 opacity-60" />
              <span className="text-[9px]">Нет фото</span>
            </div>
          )}

          {showOldPrice && discount !== null && product.in_stock && (
            <div className="absolute top-1 left-1 bg-accent text-accent-text font-bold text-[9px] px-1 py-0.2 rounded-[4px] tabular-nums shadow-xs">
              -{discount}%
            </div>
          )}

          {!product.in_stock && (
            <div className="absolute inset-0 bg-page/85 backdrop-blur-[1px] flex items-center justify-center p-1 text-center">
              <span className="text-[9px] font-medium text-content-secondary">
                {t.outOfStock}
              </span>
            </div>
          )}
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-content-primary tabular-nums">
                {formatPrice(product.price)}
              </span>
              {showOldPrice && product.old_price && product.old_price > product.price && (
                <span className="text-xs text-content-secondary line-through tabular-nums">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>

            <h3 className="text-xs font-medium text-content-primary line-clamp-2 mt-0.5 overflow-wrap-anywhere">
              {product.title}
            </h3>

            {showSizesOnCard && sizesLabel && product.in_stock && (
              <span className="inline-block text-[10px] text-content-secondary bg-page border border-border px-1.5 py-0.5 rounded-[6px] mt-1.5">
                {sizesLabel}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            {showStock && (
              <span className={`text-[11px] font-medium ${product.in_stock ? 'text-accent' : 'text-content-secondary'}`}>
                {product.in_stock ? 'В наличии' : 'Нет в наличии'}
              </span>
            )}

            {product.in_stock && (
              <button
                type="button"
                onClick={handleQuickAddClick}
                className={`w-8 h-8 rounded-btn flex items-center justify-center text-xs font-semibold transition-all active:scale-95 shadow-xs ${
                  isInCart
                    ? 'bg-accent-soft text-accent'
                    : 'bg-accent text-accent-text hover:bg-accent-hover'
                }`}
                title="Добавить в заказ"
                aria-label="Добавить в заказ"
              >
                {isInCart ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SINGLE LARGE CARD VIEW (1 column)
  // =========================================================================
  if (storeSettings.card_style === 'single') {
    return (
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col rounded-card overflow-hidden border border-border bg-surface hover:border-accent/40 transition-all cursor-pointer shadow-xs active:scale-[0.99] mb-3"
      >
        <div className="relative aspect-[16/10] w-full bg-page overflow-hidden border-b border-border">
          {hasImage ? (
            <Image
              src={rawImage!}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className={`object-cover transition-all duration-300 ${imageLoaded ? 'blur-0 scale-100 opacity-100' : 'blur-xs scale-105 opacity-80'}`}
              onLoad={() => setImageLoaded(true)}
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-content-secondary">
              <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
              <span className="text-xs font-medium">Нет фото</span>
            </div>
          )}

          {showOldPrice && discount !== null && product.in_stock && (
            <div className="absolute top-2.5 left-2.5 bg-accent text-accent-text font-bold text-xs px-2 py-0.5 rounded-[6px] tabular-nums shadow-xs">
              -{discount}%
            </div>
          )}

          {showSizesOnCard && sizesLabel && product.in_stock && (
            <div className="absolute bottom-2.5 left-2.5 bg-surface/90 backdrop-blur-xs border border-border text-content-primary text-xs font-medium px-2 py-0.5 rounded-[6px]">
              {sizesLabel}
            </div>
          )}
        </div>

        <div className="p-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-content-primary line-clamp-1 overflow-wrap-anywhere">
              {product.title}
            </h3>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold text-content-primary tabular-nums">
                {formatPrice(product.price)}
              </span>
              {showOldPrice && product.old_price && product.old_price > product.price && (
                <span className="text-xs text-content-secondary line-through tabular-nums">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>
          </div>

          {product.in_stock && (
            <button
              type="button"
              onClick={handleQuickAddClick}
              className={`px-4 py-2 rounded-btn text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs shrink-0 ${
                isInCart
                  ? 'bg-accent-soft text-accent'
                  : 'bg-accent text-accent-text hover:bg-accent-hover'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{language === 'uz' ? 'Buyurtmada' : 'В заказе'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {storeSettings.button_text === 'buy'
                      ? (language === 'uz' ? 'Xarid' : 'Купить')
                      : storeSettings.button_text === 'order'
                      ? (language === 'uz' ? 'Buyurtma' : 'Заказать')
                      : (language === 'uz' ? 'Savatga' : 'В корзину')}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STANDARD GRID VIEW (2 columns, 4:5 image)
  // =========================================================================
  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-card overflow-hidden border border-border bg-surface hover:border-accent/40 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
    >
      {/* 4:5 Aspect Ratio Photo with Blur-up */}
      <div className="relative aspect-[4/5] w-full bg-page overflow-hidden border-b border-border">
        {hasImage ? (
          <Image
            src={rawImage!}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className={`object-cover transition-all duration-300 ${imageLoaded ? 'blur-0 scale-100 opacity-100' : 'blur-xs scale-105 opacity-80'}`}
            onLoad={() => setImageLoaded(true)}
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-content-secondary">
            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
            <span className="text-xs font-medium">Нет фото</span>
          </div>
        )}

        {/* Discount Badge */}
        {showOldPrice && discount !== null && product.in_stock && (
          <div className="absolute top-2 left-2 bg-accent text-accent-text font-bold text-[10px] px-1.5 py-0.5 rounded-[4px] tabular-nums shadow-xs">
            -{discount}%
          </div>
        )}

        {/* Sizes Badge */}
        {showSizesOnCard && sizesLabel && product.in_stock && (
          <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-xs border border-border text-content-primary text-[10px] font-medium px-1.5 py-0.5 rounded-[6px]">
            {sizesLabel}
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-page/80 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
            <span className="bg-surface border border-border text-content-secondary font-medium text-xs px-2.5 py-1 rounded-[10px] shadow-xs">
              {t.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Info & Action */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1">
        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-content-primary tabular-nums">
              {formatPrice(product.price)}
            </span>
            {showOldPrice && product.old_price && product.old_price > product.price && (
              <span className="text-[11px] text-content-secondary line-through tabular-nums">
                {formatPrice(product.old_price)}
              </span>
            )}
          </div>

          {/* Title (Supports long titles without breaking) */}
          <h3 className="text-xs text-content-primary font-medium line-clamp-2 mt-1 leading-snug overflow-wrap-anywhere">
            {product.title}
          </h3>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          {showStock && (
            <span className={`text-[10px] font-medium ${product.in_stock ? 'text-accent' : 'text-content-secondary'}`}>
              {product.in_stock ? 'В наличии' : 'Нет в наличии'}
            </span>
          )}

          {product.in_stock && (
            <button
              type="button"
              onClick={handleQuickAddClick}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-btn flex items-center justify-center transition-all active:scale-95 shadow-xs ${
                isInCart
                  ? 'bg-accent-soft text-accent'
                  : 'bg-accent text-accent-text hover:bg-accent-hover'
              }`}
              title="Добавить в заказ"
              aria-label="Добавить в заказ"
            >
              {isInCart ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
