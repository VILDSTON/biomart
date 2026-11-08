// Subscriptions switch: Set to false while the platform is 100% free (tariffs hidden)
export const IS_SUBSCRIPTION_ENABLED = false;

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
