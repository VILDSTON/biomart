import { PLAN_LIMITS } from './constants';

export interface SubscriptionPromo {
  code: string;
  discountPercent: number; // e.g. 100 for free, 50 for 50%
  targetPlan?: 'plus' | 'pro'; // if specific to a plan, or undefined for any
  description: string;
}

export const SUBSCRIPTION_PROMOS: Record<string, SubscriptionPromo> = {
  TESTPRO: {
    code: 'TESTPRO',
    discountPercent: 100,
    targetPlan: 'pro',
    description: '100% скидка на тариф PRO VIP (Тестовый доступ)',
  },
  PROTEST: {
    code: 'PROTEST',
    discountPercent: 100,
    targetPlan: 'pro',
    description: '100% скидка на тариф PRO VIP (Тестовый доступ)',
  },
  FREEPLUS: {
    code: 'FREEPLUS',
    discountPercent: 100,
    targetPlan: 'plus',
    description: '100% скидка на тариф PLUS (Бесплатный доступ)',
  },
  PLUSTEST: {
    code: 'PLUSTEST',
    discountPercent: 100,
    targetPlan: 'plus',
    description: '100% скидка на тариф PLUS (Тестовый доступ)',
  },
  BIOMART2026: {
    code: 'BIOMART2026',
    discountPercent: 100,
    description: '100% скидка на любой тариф (Специальный промокод платформы)',
  },
  VIP: {
    code: 'VIP',
    discountPercent: 100,
    targetPlan: 'pro',
    description: 'VIP доступ — 100% скидка на тариф PRO VIP',
  },
  SALE50: {
    code: 'SALE50',
    discountPercent: 50,
    description: 'Скидка 50% на подписку',
  },
  FOUNDER: {
    code: 'FOUNDER',
    discountPercent: 100,
    targetPlan: 'pro',
    description: 'Founder Pass — 100% доступ к тарифу PRO VIP',
  },
};

export function validateSubscriptionPromo(rawCode: string, targetPlan: 'plus' | 'pro'): {
  isValid: boolean;
  promo?: SubscriptionPromo;
  discountedPrice?: number;
  error?: string;
} {
  const clean = rawCode.trim().toUpperCase();
  if (!clean) return { isValid: false, error: 'Введите промокод' };

  const promo = SUBSCRIPTION_PROMOS[clean];
  if (!promo) {
    return { isValid: false, error: 'Неверный или недействительный промокод' };
  }

  if (promo.targetPlan && promo.targetPlan !== targetPlan) {
    return {
      isValid: false,
      error: `Промокод «${clean}» действует только для тарифа ${promo.targetPlan.toUpperCase()}`,
    };
  }

  const basePrice = PLAN_LIMITS[targetPlan].priceUzs;
  const discountedPrice = Math.round(basePrice * (1 - promo.discountPercent / 100));

  return {
    isValid: true,
    promo,
    discountedPrice,
  };
}
