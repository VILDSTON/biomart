import { z } from 'zod';

export const RESERVED_SLUGS = [
  'admin',
  'api',
  'auth',
  'login',
  'register',
  'onboarding',
  'dashboard',
  'demo',
  'settings',
  'pricing',
  'terms',
  'privacy',
  'biomart',
  'support',
  'help',
  'www',
  'static',
  '_next',
  'favicon.ico',
] as const;

/**
 * Escapes characters for Telegram Bot HTML parse mode.
 * Replaces &, <, >, and " to prevent HTML injection and bot crashes.
 */
export function escapeTelegramHtml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Validates slug format: 3 to 30 chars, lowercase alphanumeric, hyphens, underscores.
 */
export function isSlugValid(slug: string): boolean {
  const clean = slug.trim().toLowerCase();
  if (clean.length < 3 || clean.length > 30) return false;
  if (!/^[a-z0-9-_]+$/.test(clean)) return false;
  return !RESERVED_SLUGS.includes(clean as any);
}

// Order Item Schema: Note price is calculated on the server, not trusted from client!
export const orderItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  size: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(99),
  // Title and price are optional hints; server looks up actual price
  title: z.string().optional(),
  price: z.number().optional(),
});

export const createOrderSchema = z.object({
  shop_slug: z.string().min(2).max(50),
  seller_chat_id: z.string().max(50).optional(),
  customer_name: z.string().min(1, 'Укажите ваше имя').max(60, 'Имя слишком длинное'),
  customer_phone: z
    .string()
    .min(9, 'Слишком короткий номер телефона')
    .max(20, 'Номер телефона слишком длинный')
    .regex(/^[\d+\s()-]+$/, 'Некорректный формат телефона'),
  delivery_type: z.enum(['delivery', 'pickup']),
  address: z.string().max(200, 'Адрес слишком длинный').optional().nullable(),
  comment: z.string().max(300, 'Комментарий слишком длинный').optional().nullable(),
  promo_code: z.string().max(30).optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Корзина не должна быть пустой'),
  // Honeypot field for bot spam detection
  website_url: z.string().optional(),
});

export const aiDescriptionSchema = z.object({
  title: z.string().min(2, 'Укажите название товара').max(120),
  category: z.string().max(60).optional(),
  notes: z.string().max(300).optional(),
  language: z.enum(['ru', 'uz']).default('ru'),
});

export const storeSettingsSchema = z.object({
  store_name: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
  instagram_url: z.string().max(120).optional(),
  telegram_username: z.string().max(80).optional(),
  telegram_chat_id: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  currency: z.string().max(10).default('сум'),
  delivery_info: z.string().max(200).optional(),
  accent_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Неверный HEX-код').default('#171717'),
  theme: z.enum(['light', 'dark']).default('light'),
  catalog_layout: z.enum(['grid', 'list']).default('grid'),
  hide_branding: z.boolean().default(false),
  avatar_url: z.string().url().or(z.string().length(0)).optional(),
  banner_url: z.string().url().or(z.string().length(0)).optional(),
});
