import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, CatalogLayout, Category, Order, Product, StoreSettings, ShopData } from '@/types';
import { StoreLanguage } from '@/lib/i18n';
import {
  MOCK_CATEGORIES,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_STORE_SETTINGS,
  DEMO_PRESET_SHOPS,
  getStarterProductsForShop,
} from '@/lib/mock-data';

export type { ShopData };

interface BioMartMultiStoreState {
  // Current active shop for dashboard / storefront session
  activeSlug: string;
  setActiveSlug: (slug: string) => void;

  // Multi-shop registry
  shops: Record<string, ShopData>;
  registerShop: (slug: string, storeName: string, instagramUsername?: string, email?: string, adminPassword?: string) => ShopData;
  updateAdminPassword: (slug: string, newPassword: string) => void;
  addShopReview: (slug: string, review: import('@/types').StoreReview) => void;
  getShopData: (slug: string) => ShopData;
  updateShopSettings: (slug: string, settings: Partial<StoreSettings>) => void;
  addShopProduct: (slug: string, product: Omit<Product, 'id'>) => void;
  updateShopProduct: (slug: string, productId: string, productData: Partial<Product>) => void;
  duplicateShopProduct: (slug: string, productId: string) => Product | undefined;
  toggleShopProductStock: (slug: string, productId: string) => void;
  deleteShopProduct: (slug: string, productId: string) => void;
  addShopOrder: (slug: string, order: Order) => void;
  updateShopOrderStatus: (slug: string, orderId: number | string, status: 'new' | 'completed' | 'cancelled') => void;
  addShopCategory: (slug: string, name: string) => Category;
  deleteShopCategory: (slug: string, categoryId: string) => void;
  renameShopSlug: (oldSlug: string, newSlug: string) => boolean;
  addStoreMember: (slug: string, member: { name: string; phone: string; role: import('@/types').StoreMemberRole }) => void;
  removeStoreMember: (slug: string, memberId: string) => void;

  // Multi-lingual state for customer storefront
  language: StoreLanguage;
  setLanguage: (lang: StoreLanguage) => void;

  // Cart (Scoped to active session / current shop)
  cart: CartItem[];
  addToCart: (product: Product, size?: string | null, quantity?: number, shopSlug?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  clearShopCart: (shopSlug: string) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getShopCart: (shopSlug: string) => CartItem[];
  getShopCartTotal: (shopSlug: string) => number;
  getShopCartCount: (shopSlug: string) => number;

  // UI state for storefront modal / bottom sheet
  isCartDrawerOpen: boolean;
  setCartDrawerOpen: (isOpen: boolean) => void;
  activeProductModal: Product | null;
  setActiveProductModal: (product: Product | null) => void;
  oneClickProduct: Product | null;
  setOneClickProduct: (product: Product | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategorySlug: string;
  setActiveCategorySlug: (slug: string) => void;
  catalogLayout: CatalogLayout;
  setCatalogLayout: (layout: CatalogLayout) => void;
  isOrderSuccessOpen: boolean;
  setOrderSuccessOpen: (isOpen: boolean) => void;
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;

  // Reset to default demo data
  resetDemoData: () => void;
}

const DEFAULT_DEMO_SHOP: ShopData = {
  settings: MOCK_STORE_SETTINGS,
  categories: MOCK_CATEGORIES,
  products: MOCK_PRODUCTS,
  orders: MOCK_ORDERS,
};

export const useBioMartStore = create<BioMartMultiStoreState>()(
  persist(
    (set, get) => ({
      activeSlug: 'tashkent_drip',
      setActiveSlug: (slug) => set({ activeSlug: slug }),

      shops: {
        tashkent_drip: DEMO_PRESET_SHOPS.tashkent_drip || DEFAULT_DEMO_SHOP,
        volt_gadgets: DEMO_PRESET_SHOPS.volt_gadgets,
        aura_perfume: DEMO_PRESET_SHOPS.aura_perfume,
      },

      registerShop: (rawSlug, storeName, instagramUsername = '', email = '', adminPassword = '') => {
        const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '') || `shop_${Date.now()}`;
        const existing = get().shops[cleanSlug];
        if (existing) {
          set({ activeSlug: cleanSlug });
          return existing;
        }

        const defaultThemeSettings = {
          preset: 'minimal' as const,
          accent_color: '#111827',
          theme: 'light' as const,
          avatar_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80',
          banner_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
          catalog_layout: 'grid' as const,
          radii_preset: 'medium' as const,
          button_text: 'cart' as const,
          show_old_price: true,
          announcement_active: false,
          announcement_text: '',
          hide_branding: false,
        };

        const newShop: ShopData = {
          settings: {
            id: `store-${Date.now()}`,
            slug: cleanSlug,
            store_name: storeName.trim(),
            description: '',
            avatar_url: defaultThemeSettings.avatar_url,
            banner_url: defaultThemeSettings.banner_url,
            instagram_url: instagramUsername ? `https://instagram.com/${instagramUsername.replace('@', '')}` : '',
            telegram_username: '',
            telegram_chat_id: '',
            phone: '',
            email: email.trim(),
            admin_password: adminPassword?.trim() || 'admin123',
            custom_links: [],
            reviews: [],
            currency: 'сум',
            delivery_info: 'Доставка по Ташкенту и всему Узбекистану.',
            accent_color: defaultThemeSettings.accent_color,
            theme: defaultThemeSettings.theme,
            catalog_layout: defaultThemeSettings.catalog_layout,
            hide_branding: false,
            plan: 'start',
            theme_settings: defaultThemeSettings,
          },
          categories: [
            { id: 'cat-all', name: 'Все', slug: 'all', sort_order: 0 },
            { id: 'cat-new', name: 'Новинки', slug: 'new', sort_order: 1 },
          ],
          products: [],
          orders: [],
        };

        set({
          activeSlug: cleanSlug,
          shops: {
            ...get().shops,
            [cleanSlug]: newShop,
          },
        });

        return newShop;
      },

      updateAdminPassword: (slug, newPassword) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;
        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              settings: {
                ...shop.settings,
                admin_password: newPassword,
              },
            },
          },
        });
      },

      addShopReview: (slug, review) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;
        const currentReviews = shop.settings.reviews || [];
        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              settings: {
                ...shop.settings,
                reviews: [review, ...currentReviews],
              },
            },
          },
        });
      },

      getShopData: (slug) => {
        const clean = slug?.toLowerCase();
        if (get().shops[clean]) {
          return get().shops[clean];
        }
        if (DEMO_PRESET_SHOPS[clean]) {
          return DEMO_PRESET_SHOPS[clean];
        }
        // Fallback to default demo shop
        return get().shops['tashkent_drip'] || DEMO_PRESET_SHOPS.tashkent_drip || DEFAULT_DEMO_SHOP;
      },

      updateShopSettings: (slug, newSettings) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;

        // Ensure theme_settings and top-level mirrored fields stay 100% in sync
        const mergedSettings = { ...shop.settings, ...newSettings };
        if (newSettings.theme_settings) {
          const ts = newSettings.theme_settings;
          mergedSettings.accent_color = ts.accent_color;
          mergedSettings.theme = ts.theme;
          mergedSettings.catalog_layout = ts.catalog_layout;
          if (ts.avatar_url !== undefined) mergedSettings.avatar_url = ts.avatar_url;
          if (ts.banner_url !== undefined) mergedSettings.banner_url = ts.banner_url;
          if (ts.radii_preset) mergedSettings.radii_preset = ts.radii_preset;
          if (ts.button_text) mergedSettings.button_text = ts.button_text;
          if (ts.show_old_price !== undefined) mergedSettings.show_old_price = ts.show_old_price;
          if (ts.announcement_active !== undefined) mergedSettings.announcement_active = ts.announcement_active;
          if (ts.announcement_text !== undefined) mergedSettings.announcement_text = ts.announcement_text;
          if (ts.hide_branding !== undefined) mergedSettings.hide_branding = ts.hide_branding;
        }

        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              settings: mergedSettings,
            },
          },
        });
      },

      addShopProduct: (slug, productData) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;

        const newProduct: Product = {
          ...productData,
          id: `prod-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              products: [newProduct, ...shop.products],
            },
          },
        });
      },

      updateShopProduct: (slug, productId, productData) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;

        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              products: shop.products.map((p) =>
                p.id === productId ? { ...p, ...productData } : p
              ),
            },
          },
        });
      },

      duplicateShopProduct: (slug, productId) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;
        const target = shop.products.find((p) => p.id === productId);
        if (!target) return;

        const duplicated: Product = {
          ...target,
          id: `prod-${Date.now()}`,
          title: `${target.title} (Копия)`,
          created_at: new Date().toISOString(),
          in_stock: true,
        };

        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              products: [duplicated, ...shop.products],
            },
          },
        });

        return duplicated;
      },

      toggleShopProductStock: (slug, productId) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;

        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              products: shop.products.map((p) =>
                p.id === productId ? { ...p, in_stock: !p.in_stock } : p
              ),
            },
          },
        });
      },

      deleteShopProduct: (slug, productId) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;

        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              products: shop.products.filter((p) => p.id !== productId),
            },
          },
        });
      },

      addShopOrder: (slug, order) => {
        const clean = (slug || order.shop_slug || get().activeSlug).toLowerCase();
        const shop = get().shops[clean] || get().shops['tashkent_drip'];
        if (!shop) return;

        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              orders: [order, ...shop.orders],
            },
          },
        });
      },

      updateShopOrderStatus: (slug, orderId, status) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;

        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              orders: shop.orders.map((o) =>
                o.id === orderId ? { ...o, status } : o
              ),
            },
          },
        });
      },

      addShopCategory: (slug, name) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return { id: '', name: '', slug: '', sort_order: 0 };
        const trimmed = name.trim();
        const catSlug = trimmed.toLowerCase().replace(/[^a-z0-9а-яё]+/g, '-').replace(/^-|-$/g, '') || `cat-${Date.now()}`;
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name: trimmed,
          slug: catSlug,
          sort_order: shop.categories.length,
        };
        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              categories: [...shop.categories, newCat],
            },
          },
        });
        return newCat;
      },

      deleteShopCategory: (slug, categoryId) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop || categoryId === 'cat-all') return;
        set({
          shops: {
            ...get().shops,
            [clean]: {
              ...shop,
              categories: shop.categories.filter((c) => c.id !== categoryId),
              products: shop.products.map((p) =>
                p.category_id === categoryId ? { ...p, category_id: shop.categories.find(c => c.id !== categoryId && c.id !== 'cat-all')?.id || 'cat-1' } : p
              ),
            },
          },
        });
      },

      renameShopSlug: (oldSlug, newSlug) => {
        const cleanOld = oldSlug.toLowerCase().trim();
        const cleanNew = newSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();
        if (!cleanNew || cleanNew.length < 3) return false;
        if (cleanOld === cleanNew) return true;
        const shops = { ...get().shops };
        if (shops[cleanNew]) return false; // collision
        const shop = shops[cleanOld];
        if (!shop) return false;

        const updatedSettings = {
          ...shop.settings,
          slug: cleanNew,
        };
        shops[cleanNew] = {
          ...shop,
          settings: updatedSettings,
        };
        delete shops[cleanOld];

        set({
          shops,
          activeSlug: get().activeSlug === cleanOld ? cleanNew : get().activeSlug,
        });
        return true;
      },

      addStoreMember: (slug, member) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;
        const currentMembers = shop.settings.team_members || [];
        const newMember = {
          id: `mem-${Date.now()}`,
          name: member.name,
          phone: member.phone,
          role: member.role,
          addedAt: new Date().toISOString().slice(0, 10),
        };
        get().updateShopSettings(clean, {
          team_members: [...currentMembers, newMember],
        });
      },

      removeStoreMember: (slug, memberId) => {
        const clean = slug?.toLowerCase();
        const shop = get().shops[clean];
        if (!shop) return;
        const currentMembers = shop.settings.team_members || [];
        get().updateShopSettings(clean, {
          team_members: currentMembers.filter((m) => m.id !== memberId),
        });
      },

      // Multi-lingual
      language: 'ru',
      setLanguage: (lang) => set({ language: lang }),

      // Cart
      cart: [],
      addToCart: (product, size = null, quantity = 1, shopSlug?: string) => {
        const cleanSlug = (shopSlug || get().activeSlug || 'tashkent_drip').toLowerCase();
        const cartItemId = `${cleanSlug}_${product.id}_${size || 'default'}`;
        const existingItemIndex = get().cart.findIndex(
          (item) => item.cart_item_id === cartItemId
        );

        if (existingItemIndex > -1) {
          const updated = [...get().cart];
          updated[existingItemIndex].quantity += quantity;
          set({ cart: updated });
        } else {
          set({
            cart: [
              ...get().cart,
              {
                cart_item_id: cartItemId,
                shop_slug: cleanSlug,
                product,
                selected_size: size,
                quantity,
              },
            ],
          });
        }
      },
      removeFromCart: (cartItemId) => {
        set({
          cart: get().cart.filter((item) => item.cart_item_id !== cartItemId),
        });
      },
      updateQuantity: (cartItemId, delta) => {
        const item = get().cart.find((i) => i.cart_item_id === cartItemId);
        if (!item) return;

        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          get().removeFromCart(cartItemId);
        } else {
          set({
            cart: get().cart.map((i) =>
              i.cart_item_id === cartItemId ? { ...i, quantity: newQuantity } : i
            ),
          });
        }
      },
      clearCart: () => set({ cart: [] }),
      clearShopCart: (shopSlug: string) => {
        const clean = shopSlug.toLowerCase();
        set({
          cart: get().cart.filter((item) => item.shop_slug && item.shop_slug !== clean),
        });
      },
      getCartTotal: () => {
        return get().cart.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },
      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
      getShopCart: (shopSlug: string) => {
        const clean = shopSlug.toLowerCase();
        return get().cart.filter((item) => !item.shop_slug || item.shop_slug === clean);
      },
      getShopCartTotal: (shopSlug: string) => {
        const clean = shopSlug.toLowerCase();
        return get().cart
          .filter((item) => !item.shop_slug || item.shop_slug === clean)
          .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },
      getShopCartCount: (shopSlug: string) => {
        const clean = shopSlug.toLowerCase();
        return get().cart
          .filter((item) => !item.shop_slug || item.shop_slug === clean)
          .reduce((count, item) => count + item.quantity, 0);
      },

      // UI State
      isCartDrawerOpen: false,
      setCartDrawerOpen: (isOpen) => set({ isCartDrawerOpen: isOpen }),
      activeProductModal: null,
      setActiveProductModal: (product) => set({ activeProductModal: product }),
      oneClickProduct: null,
      setOneClickProduct: (product) => set({ oneClickProduct: product }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      activeCategorySlug: 'all',
      setActiveCategorySlug: (slug) => set({ activeCategorySlug: slug }),
      catalogLayout: 'grid',
      setCatalogLayout: (layout) => set({ catalogLayout: layout }),
      isOrderSuccessOpen: false,
      setOrderSuccessOpen: (isOpen) => set({ isOrderSuccessOpen: isOpen }),
      lastCompletedOrder: null,
      setLastCompletedOrder: (order) => set({ lastCompletedOrder: order }),

      resetDemoData: () => {
        set({
          activeSlug: 'tashkent_drip',
          shops: {
            tashkent_drip: DEMO_PRESET_SHOPS.tashkent_drip || DEFAULT_DEMO_SHOP,
            volt_gadgets: DEMO_PRESET_SHOPS.volt_gadgets,
            aura_perfume: DEMO_PRESET_SHOPS.aura_perfume,
          },
          cart: [],
        });
      },
    }),
    {
      name: 'biomart_multi_store_v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeSlug: state.activeSlug,
        shops: state.shops,
        cart: state.cart,
        language: state.language,
      }),
    }
  )
);
