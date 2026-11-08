export type ThemeMode = 'light' | 'dark' | 'system';
export type CatalogLayout = 'grid' | 'list';
export type PlanType = 'start' | 'plus' | 'pro';
export type StoreThemePreset = 'minimal' | 'warm' | 'streetwear' | 'boutique' | 'cyber' | 'vintage' | 'organic' | 'editorial';
export type StoreNiche = 'clothing' | 'electronics' | 'beauty' | 'food' | 'flowers' | 'universal';

export interface TrustBadgeItem {
  id: string;
  icon: 'zap' | 'package' | 'message' | 'shield' | 'clock' | 'check' | 'sparkles' | 'heart';
  title: string;
  subtitle: string;
}

export interface StoreReview {
  id: string;
  author_name: string;
  rating: number; // 1 to 5
  text: string;
  date: string;
  is_verified?: boolean;
}

export type StoreFontPreset = 'neutral' | 'strict' | 'boutique';
export type StoreRadiiPreset = 'sharp' | 'medium' | 'round';
export type StoreCardStyle = 'grid2' | 'single' | 'compact';
export type StoreButtonText = 'buy' | 'order' | 'cart';

export interface PromoCode {
  code: string;
  discount_percent: number;
  active: boolean;
}

export interface ThemeSettings {
  preset: StoreThemePreset;
  accent_color: string;
  theme: ThemeMode;
  avatar_url?: string;
  banner_url?: string;
  catalog_layout: CatalogLayout;
  radii_preset: StoreRadiiPreset;
  button_text: StoreButtonText;
  show_old_price: boolean;
  announcement_active: boolean;
  announcement_text: string;
  hide_branding?: boolean;
  niche?: StoreNiche;
  show_trust_badges?: boolean;
  custom_badges?: TrustBadgeItem[];
  show_reviews?: boolean;
}

export interface StoreSettings {
  id: string;
  slug: string;
  store_name: string;
  description: string;
  avatar_url: string;
  banner_url?: string;
  instagram_url: string;
  telegram_username: string;
  telegram_chat_id?: string; // Telegram Chat ID продавца для получения заказов!
  phone: string;
  currency: string;
  delivery_info: string;
  accent_color: string;
  theme: ThemeMode;
  catalog_layout: CatalogLayout;
  hide_branding?: boolean;
  plan?: PlanType;
  promo_codes?: PromoCode[];

  // Unified single theme_settings object
  theme_settings?: ThemeSettings;

  // Extended Design System customization
  theme_preset?: StoreThemePreset;
  font_preset?: StoreFontPreset;
  radii_preset?: StoreRadiiPreset;
  card_style?: StoreCardStyle;
  show_old_price?: boolean;
  show_stock?: boolean;
  show_sizes_on_card?: boolean;
  button_text?: StoreButtonText;
  announcement_active?: boolean;
  announcement_text?: string;
  default_language?: 'ru' | 'uz';
  is_verified?: boolean;
  niche?: StoreNiche;
  show_trust_badges?: boolean;
  custom_badges?: TrustBadgeItem[];
  show_reviews?: boolean;
  reviews?: StoreReview[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  old_price?: number | null;
  images: string[];
  variant_type?: string; // 'Размер' | 'Объём' | 'Цвет'
  sizes: string[]; // Options e.g. ['S', 'M', 'L'] or ['50ml', '100ml'] or []
  in_stock: boolean;
  created_at?: string;
}

export interface CartItem {
  cart_item_id: string; // unique id combining product.id and selected_size
  product: Product;
  selected_size?: string | null;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  title: string;
  size?: string | null;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: number | string;
  shop_slug?: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: 'delivery' | 'pickup';
  address?: string;
  comment?: string;
  items: OrderItem[];
  total_price: number;
  promo_code?: string;
  discount_amount?: number;
  status: 'new' | 'completed' | 'cancelled';
  created_at: string;
}

export interface CheckoutFormData {
  customer_name: string;
  customer_phone: string;
  delivery_type: 'delivery' | 'pickup';
  address?: string;
  comment?: string;
}

export interface ShopAccount {
  username: string;
  password?: string;
  shop_slug: string;
}
