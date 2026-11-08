'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useBioMartStore } from '@/store/useStore';
import { StoreHeader } from '@/components/StoreHeader';
import { CategoryBar } from '@/components/CategoryBar';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { OneClickCheckoutModal } from '@/components/OneClickCheckoutModal';
import { FloatingCartBar } from '@/components/FloatingCartBar';
import { CartCheckoutDrawer } from '@/components/CartCheckoutDrawer';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { ViralBioMartBadge } from '@/components/ViralBioMartBadge';
import { Category, Order, Product, StoreSettings } from '@/types';
import { PackageSearch } from 'lucide-react';
import { translations } from '@/lib/i18n';
import { computeStoreTokens, getEffectiveThemeSettings } from '@/lib/theme';
import { StoreTrustBadges } from '@/components/StoreTrustBadges';
import { StoreReviews } from '@/components/StoreReviews';

export function StorefrontSkeleton() {
  return (
    <main className="max-w-md mx-auto min-h-[100dvh] bg-surface border-x border-border p-4 space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="w-16 h-16 rounded-[14px] bg-page" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-4 bg-page rounded" />
          <div className="w-48 h-3 bg-page rounded" />
        </div>
      </div>
      {/* Category pills skeleton */}
      <div className="flex gap-2 py-1">
        <div className="w-16 h-7 rounded-btn bg-page" />
        <div className="w-20 h-7 rounded-btn bg-page" />
        <div className="w-20 h-7 rounded-btn bg-page" />
      </div>
      {/* Product cards skeleton */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="rounded-card border border-border bg-page overflow-hidden space-y-2 pb-3">
            <div className="aspect-[4/5] w-full bg-border/40" />
            <div className="px-2 space-y-1">
              <div className="w-16 h-3 bg-border/60 rounded" />
              <div className="w-24 h-3 bg-border/40 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

interface StorefrontClientProps {
  initialSlug: string;
  initialSettings?: StoreSettings;
  initialCategories?: Category[];
  initialProducts?: Product[];
  isDemo?: boolean;
}

export function StorefrontClient({
  initialSlug,
  initialSettings,
  initialCategories,
  initialProducts,
  isDemo = false,
}: StorefrontClientProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawSlug = (params?.slug as string) || initialSlug || 'tashkent_drip';
  const shopSlug = rawSlug.toLowerCase();
  const itemIdParam = searchParams?.get('item') || searchParams?.get('product');

  const [isClient, setIsClient] = useState(false);
  const [flyAnimation, setFlyAnimation] = useState<{ x: number; y: number } | null>(null);
  const [localThemeOverride, setLocalThemeOverride] = useState<any>(null);

  // Zustand Store
  const {
    getShopData,
    addShopOrder,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearShopCart,
    getCartTotal,
    getCartCount,
    isCartDrawerOpen,
    setCartDrawerOpen,
    activeProductModal,
    setActiveProductModal,
    oneClickProduct,
    setOneClickProduct,
    searchQuery,
    setSearchQuery,
    activeCategorySlug,
    setActiveCategorySlug,
    catalogLayout,
    setCatalogLayout,
    isOrderSuccessOpen,
    setOrderSuccessOpen,
    lastCompletedOrder,
    setLastCompletedOrder,
    language,
    setLanguage,
  } = useBioMartStore();

  const t = translations[language];

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(`biomart_store_theme_${shopSlug}`) || localStorage.getItem(`biomart_theme_${shopSlug}`);
      if (stored) {
        setLocalThemeOverride(JSON.parse(stored));
      }
    } catch {}

    const onUpdate = (e: any) => {
      if (e?.detail?.slug === shopSlug && e?.detail?.themeSettings) {
        setLocalThemeOverride(e.detail.themeSettings);
      }
    };
    window.addEventListener('biomart_theme_updated', onUpdate);
    return () => window.removeEventListener('biomart_theme_updated', onUpdate);
  }, [shopSlug]);

  const shopData = useMemo(() => {
    return getShopData(shopSlug);
  }, [shopSlug, getShopData]);

  // Merge shopData with initialSettings fallback
  const currentSettings = isDemo && initialSettings ? initialSettings : (shopData?.settings || initialSettings);
  const currentCategories = useMemo(() => {
    const source = isDemo && initialCategories && initialCategories.length > 0
      ? initialCategories
      : (initialCategories && initialCategories.length > 0 ? initialCategories : (shopData?.categories || []));
    const hasAll = source.some((c) => c.slug === 'all');
    if (!hasAll && source.length > 0) {
      return [{ id: 'cat-all', name: 'Все', slug: 'all', sort_order: 0 }, ...source];
    }
    return source;
  }, [isDemo, initialCategories, shopData]);

  const currentProducts = useMemo(() => {
    if (isDemo && initialProducts && initialProducts.length > 0) {
      return initialProducts;
    }
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts;
    }
    return shopData?.products || [];
  }, [isDemo, initialProducts, shopData]);

  // Effective unified theme settings (Priority: URL query > Local save override > SSR initialSettings > Zustand)
  const queryAccent = searchParams?.get('accent');
  const queryTheme = searchParams?.get('theme') as 'light' | 'dark' | null;
  const queryPreset = searchParams?.get('preset') as any;

  const themeSettings = useMemo(() => {
    const merged = isDemo && initialSettings?.theme_settings
      ? initialSettings.theme_settings
      : {
          ...(currentSettings?.theme_settings || {}),
          ...(initialSettings?.theme_settings || {}),
          ...(localThemeOverride || {}),
        };
    const effective = getEffectiveThemeSettings(merged, currentSettings);
    return {
      ...effective,
      accent_color: queryAccent ? (queryAccent.startsWith('#') ? queryAccent : `#${queryAccent}`) : effective.accent_color,
      theme: queryTheme || effective.theme,
      preset: queryPreset || effective.preset,
    };
  }, [isDemo, currentSettings, initialSettings, localThemeOverride, queryAccent, queryTheme, queryPreset]);

  // Apply default store settings (Theme, Layout, Language)
  useEffect(() => {
    if (!isClient) return;

    // 1. Theme application: URL override takes precedence, then buyer preference, then shop default
    let targetTheme: 'light' | 'dark' = 'light';

    if (queryTheme === 'dark' || queryTheme === 'light') {
      targetTheme = queryTheme;
    } else {
      const buyerTheme = localStorage.getItem('biomart_buyer_theme');
      if (buyerTheme === 'dark' || buyerTheme === 'light') {
        targetTheme = buyerTheme;
      } else if (themeSettings.theme === 'dark') {
        targetTheme = 'dark';
      } else if (themeSettings.theme === 'system') {
        targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    }

    if (targetTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }

    // 2. Default catalog layout
    const savedLayout = localStorage.getItem(`biomart_layout_${shopSlug}`);
    if (savedLayout === 'grid' || savedLayout === 'list') {
      setCatalogLayout(savedLayout);
    } else if (themeSettings.catalog_layout) {
      setCatalogLayout(themeSettings.catalog_layout);
    }

    // 3. Default language
    if (currentSettings?.default_language && !localStorage.getItem('biomart_user_lang')) {
      setLanguage(currentSettings.default_language);
    }
  }, [isClient, shopSlug, themeSettings, currentSettings, setCatalogLayout, setLanguage]);

  // Compute dynamic tokens for the storefront root
  const isDarkCurrent = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const tokens = useMemo(() => {
    return computeStoreTokens(themeSettings.accent_color, isDarkCurrent || themeSettings.theme === 'dark');
  }, [themeSettings.accent_color, isDarkCurrent, themeSettings.theme]);

  // Synchronize CSS variables to document.documentElement for full portal/modal reactivity
  useEffect(() => {
    if (!isClient) return;
    const root = document.documentElement;
    root.style.setProperty('--store-accent', tokens.accent);
    root.style.setProperty('--store-accent-hover', tokens.accentHover);
    root.style.setProperty('--store-accent-soft', tokens.accentSoft);
    root.style.setProperty('--store-on-accent', tokens.onAccent);
    root.style.setProperty('--accent', tokens.accent);
    root.style.setProperty('--accent-hover', tokens.accentHover);
    root.style.setProperty('--accent-soft', tokens.accentSoft);
    root.style.setProperty('--accent-text', tokens.onAccent);

    return () => {
      root.style.removeProperty('--store-accent');
      root.style.removeProperty('--store-accent-hover');
      root.style.removeProperty('--store-accent-soft');
      root.style.removeProperty('--store-on-accent');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-hover');
      root.style.removeProperty('--accent-soft');
      root.style.removeProperty('--accent-text');
    };
  }, [isClient, tokens]);

  // Auto-open product modal & scroll to product if directed (?product=ID or ?item=ID)
  useEffect(() => {
    if (isClient && itemIdParam && currentProducts.length > 0) {
      const cleanTarget = itemIdParam.trim().toLowerCase();
      const target = currentProducts.find(
        (p) =>
          p.id.toLowerCase() === cleanTarget ||
          p.title.toLowerCase().replace(/\s+/g, '-') === cleanTarget
      );
      if (target) {
        setActiveProductModal(target);
        setTimeout(() => {
          const el = document.getElementById(`product-${target.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [isClient, itemIdParam, currentProducts, setActiveProductModal]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return currentProducts.filter((product) => {
      let matchesCategory = true;
      if (activeCategorySlug !== 'all') {
        const cat = currentCategories.find((c) => c.slug === activeCategorySlug);
        if (cat) {
          matchesCategory = product.category_id === cat.id;
        }
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = product.title.toLowerCase().includes(q);
        const inDesc = product.description?.toLowerCase().includes(q) || false;
        const inSizes = product.sizes?.some((s) => s.toLowerCase().includes(q)) || false;
        matchesSearch = inTitle || inDesc || inSizes;
      }

      return matchesCategory && matchesSearch;
    });
  }, [currentProducts, activeCategorySlug, currentCategories, searchQuery]);

  // Dynamic count per category
  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      all: currentProducts.length,
    };
    currentCategories.forEach((cat) => {
      if (cat.slug !== 'all') {
        counts[cat.slug] = currentProducts.filter((p) => p.category_id === cat.id).length;
      }
    });
    return counts;
  }, [currentProducts, currentCategories]);

  const handleQuickAdd = (product: Product) => {
    addToCart(product, null, 1, shopSlug);
    setFlyAnimation({ x: 0, y: 0 });
    setTimeout(() => setFlyAnimation(null), 500);
  };

  const handleOneClickBuy = (product: Product) => {
    setOneClickProduct(product);
  };

  const handleOrderSuccess = (order: Order) => {
    addShopOrder(shopSlug, order);
    clearShopCart(shopSlug);
    setLastCompletedOrder(order);
    setOrderSuccessOpen(true);
  };

  const handleLayoutChange = (newLayout: 'grid' | 'list') => {
    setCatalogLayout(newLayout);
    try {
      localStorage.setItem(`biomart_layout_${shopSlug}`, newLayout);
    } catch {}
  };

  // Cart scoped strictly to current shop
  const currentCart = useMemo(() => {
    return cart.filter((item) => !item.shop_slug || item.shop_slug === shopSlug);
  }, [cart, shopSlug]);

  const cartTotal = useMemo(() => {
    return currentCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [currentCart]);

  const cartCount = useMemo(() => {
    return currentCart.reduce((count, item) => count + item.quantity, 0);
  }, [currentCart]);

  if (!isClient && !initialSettings) {
    return <StorefrontSkeleton />;
  }

  const themePreset = themeSettings.preset || 'minimal';
  const radiiPreset = themeSettings.radii_preset || 'medium';

  // Construct combined settings ensuring theme_settings overrides legacy
  const effectiveSettings: StoreSettings = {
    ...currentSettings,
    accent_color: themeSettings.accent_color,
    theme: themeSettings.theme,
    catalog_layout: themeSettings.catalog_layout,
    avatar_url: themeSettings.avatar_url || currentSettings.avatar_url,
    banner_url: themeSettings.banner_url || currentSettings.banner_url,
    radii_preset: themeSettings.radii_preset,
    button_text: themeSettings.button_text,
    show_old_price: themeSettings.show_old_price,
    announcement_active: themeSettings.announcement_active,
    announcement_text: themeSettings.announcement_text,
    hide_branding: themeSettings.hide_branding,
    theme_settings: themeSettings,
  };

  return (
    <div
      id="storefront-root"
      data-theme-preset={themePreset}
      data-radii-preset={radiiPreset}
      style={{
        ['--store-accent' as any]: tokens.accent,
        ['--store-accent-hover' as any]: tokens.accentHover,
        ['--store-accent-soft' as any]: tokens.accentSoft,
        ['--store-on-accent' as any]: tokens.onAccent,
        ['--accent' as any]: tokens.accent,
        ['--accent-hover' as any]: tokens.accentHover,
        ['--accent-soft' as any]: tokens.accentSoft,
        ['--accent-text' as any]: tokens.onAccent,
      }}
      className="min-h-[100dvh] bg-page text-content-primary transition-colors"
    >
      {/* Centered Mobile Frame (Always max-w-md on desktop with clean border and solid background) */}
      <main className="max-w-md mx-auto min-h-[100dvh] relative flex flex-col pb-36 border-x border-border bg-surface shadow-subtle">
        {/* 1. Store Header Profile with Banner & Announcement */}
        <StoreHeader
          settings={effectiveSettings}
          isDemo={isDemo || shopSlug === 'tashkent_drip' || shopSlug === 'volt_gadgets' || shopSlug === 'aura_perfume'}
          totalProducts={currentProducts.length}
        />

        {/* 2. Sticky Category Bar & Search */}
        <CategoryBar
          categories={currentCategories}
          activeSlug={activeCategorySlug}
          onSelectCategory={setActiveCategorySlug}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          productCountByCategory={productCountByCategory}
          layout={catalogLayout}
          onToggleLayout={handleLayoutChange}
          storeSettings={effectiveSettings}
        />

        {/* Store Trust & Guarantees (Non-carousel, sleek 2x2 grid, customized by niche or seller) */}
        <div className="px-3 pt-1">
          <StoreTrustBadges settings={effectiveSettings} />
        </div>

        {/* 3. Products Grid / List */}
        <section id="catalog-section" className="p-3 flex-1 scroll-mt-14">
          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-between text-[11px] font-semibold text-content-secondary mb-2 px-0.5">
              <span>
                {language === 'uz' ? 'Katalog' : 'Каталог'} ({filteredProducts.length})
              </span>
              <span className="text-[10px] text-content-tertiary flex items-center gap-1">
                <span>{language === 'uz' ? 'Pastga suring' : 'Листайте вниз'}</span>
                <span>↓</span>
              </span>
            </div>
          )}
          {filteredProducts.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center mb-2.5 border border-border bg-page text-content-secondary">
                <PackageSearch className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-xs font-semibold text-content-primary">{t.noProducts}</h3>
              <p className="text-xs text-content-secondary mt-0.5 max-w-[240px]">
                {searchQuery
                  ? (language === 'uz' ? `«${searchQuery}» bo‘yicha hech narsa topilmadi.` : `По запросу «${searchQuery}» ничего не найдено.`)
                  : (language === 'uz' ? 'Bu toifada hali mahsulotlar yo‘q.' : 'В этой категории пока нет товаров.')}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-semibold underline text-accent hover:opacity-80"
                >
                  {t.clearSearch}
                </button>
              )}
            </div>
          ) : (
            <div className={catalogLayout === 'grid' && effectiveSettings.card_style !== 'single' ? 'grid grid-cols-2 gap-2.5' : 'flex flex-col gap-2.5'}>
              {filteredProducts.map((product) => {
                const isInCart = currentCart.some((c) => c.product.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storeSettings={effectiveSettings}
                    layout={catalogLayout}
                    onOpenDetail={(p) => setActiveProductModal(p)}
                    onQuickAdd={handleQuickAdd}
                    onOneClickBuy={handleOneClickBuy}
                    isInCart={isInCart}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* 4. Customer Reviews Section */}
        <StoreReviews settings={effectiveSettings} />

        {/* 5. Discreet BioMart Watermark (Uses platform brand color, not store accent) */}
        <ViralBioMartBadge
          hideBranding={Boolean(effectiveSettings.hide_branding)}
          accentColor={effectiveSettings.accent_color}
        />

        {/* 5. Floating Bottom Cart Bar */}
        <FloatingCartBar
          itemCount={cartCount}
          totalPrice={cartTotal}
          storeSettings={effectiveSettings}
          onClickCheckout={() => setCartDrawerOpen(true)}
        />

        {/* 6. Product Detail Modal / Bottom Sheet */}
        <ProductDetailModal
          product={activeProductModal}
          storeSettings={effectiveSettings}
          onClose={() => setActiveProductModal(null)}
          onAddToCart={(p, s, q) => addToCart(p, s, q, shopSlug)}
          onBuyOneClick={(p) => {
            setActiveProductModal(null);
            setOneClickProduct(p);
          }}
        />

        {/* 7. One-Click Fast Order Modal */}
        <OneClickCheckoutModal
          product={oneClickProduct}
          storeSettings={effectiveSettings}
          onClose={() => setOneClickProduct(null)}
          onOrderSuccess={handleOrderSuccess}
        />

        {/* 8. Full Cart & Checkout Drawer */}
        <CartCheckoutDrawer
          isOpen={isCartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          items={currentCart}
          storeSettings={effectiveSettings}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={() => clearShopCart(shopSlug)}
          onOrderSuccess={handleOrderSuccess}
        />

        {/* 9. Order Success Modal */}
        <OrderSuccessModal
          isOpen={isOrderSuccessOpen}
          order={lastCompletedOrder}
          storeSettings={effectiveSettings}
          onClose={() => setOrderSuccessOpen(false)}
        />

        {/* Flying animation particle */}
        {flyAnimation && (
          <div className="fixed bottom-16 right-1/2 translate-x-1/2 z-50 pointer-events-none">
            <span className="w-4 h-4 rounded-full bg-accent text-accent-text flex items-center justify-center text-[9px] font-bold shadow-md animate-fly-to-cart">
              +1
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
