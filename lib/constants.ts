// Subscriptions switch: Set to false while the platform is 100% free (tariffs hidden)
export const IS_SUBSCRIPTION_ENABLED = false;

// Base domain and app URLs (Currently running on biomart.vercel.app, ready for biomart.uz)
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'biomart.vercel.app';
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://biomart.vercel.app');

// Platform Founder & SuperAdmin Telegram Chat ID
export const FOUNDER_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID?.trim() || '5504101440';
const extraAdmins = (process.env.EXTRA_ADMIN_TELEGRAM_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
export const ADMIN_TELEGRAM_IDS = Array.from(new Set([FOUNDER_TELEGRAM_ID, ...extraAdmins]));

// Official BioMart Telegram Bot (@BioMartAssistant_bot)
export const DEFAULT_TELEGRAM_BOT_TOKEN = '9023083705:AAGCrWm3TUcNndHlIBzjDSmdoTc6Z3twlA0';
export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN?.trim() ||
  process.env.TG_BOT_TOKEN?.trim() ||
  DEFAULT_TELEGRAM_BOT_TOKEN;

export const PLAN_LIMITS = {
  start: {
    maxProducts: 10,
    maxStores: 1,
    label: 'До 10 товаров, 1 витрина',
    priceUzs: 0,
  },
  plus: {
    maxProducts: 100,
    maxStores: 2,
    label: 'До 100 товаров, 2 витрины',
    priceUzs: 59000,
  },
  pro: {
    maxProducts: Infinity,
    maxStores: 5,
    label: 'Безлимит товаров, 5 витрин',
    priceUzs: 129000,
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;
