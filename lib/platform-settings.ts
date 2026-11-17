import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export interface PaymentRequisites {
  card_number: string;
  card_holder: string;
  bank_name: string;
  payment_instructions: string;
}

export interface PricingPlansSettings {
  plus_price: number;
  plus_limit: number;
  pro_price: number;
  pro_limit: number;
}

export interface GlobalBannerSettings {
  is_active: boolean;
  text: string;
  link?: string;
}

export interface PlatformSettingsMap {
  payment_requisites: PaymentRequisites;
  pricing_plans: PricingPlansSettings;
  global_banner: GlobalBannerSettings;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsMap = {
  payment_requisites: {
    card_number: '8600 0410 1234 5678',
    card_holder: 'VILDSTON A.',
    bank_name: 'Kapitalbank / Click / Payme',
    payment_instructions: 'После перевода отправьте скриншот чека боту @BioMartAssistant_bot или загрузите в форме',
  },
  pricing_plans: {
    plus_price: 59000,
    plus_limit: 100,
    pro_price: 129000,
    pro_limit: 999999,
  },
  global_banner: {
    is_active: false,
    text: '🚀 Скидка 20% при оплате тарифа Pro на 3 месяца! Напишите в поддержку для активации.',
    link: '/dashboard?tab=tariff',
  },
};

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'platform_settings.json');

export async function getPlatformSettings<K extends keyof PlatformSettingsMap>(
  key: K
): Promise<PlatformSettingsMap[K]> {
  // 1. Try Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('platform_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (!error && data?.value) {
        return { ...DEFAULT_PLATFORM_SETTINGS[key], ...data.value };
      }
    } catch {}
  }

  // 2. Fallback to local JSON file
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed[key]) {
        return { ...DEFAULT_PLATFORM_SETTINGS[key], ...parsed[key] };
      }
    }
  } catch {}

  return DEFAULT_PLATFORM_SETTINGS[key];
}

export async function getAllPlatformSettings(): Promise<PlatformSettingsMap> {
  const result: PlatformSettingsMap = { ...DEFAULT_PLATFORM_SETTINGS };

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('platform_settings')
        .select('key, value');

      if (!error && data) {
        data.forEach((row) => {
          if (row.key in result) {
            (result as any)[row.key] = { ...(result as any)[row.key], ...row.value };
          }
        });
        return result;
      }
    } catch {}
  }

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...result, ...parsed };
    }
  } catch {}

  return result;
}

export async function setPlatformSetting<K extends keyof PlatformSettingsMap>(
  key: K,
  value: Partial<PlatformSettingsMap[K]>,
  adminId: string = 'admin'
): Promise<PlatformSettingsMap[K]> {
  const current = await getPlatformSettings(key);
  const updated = { ...current, ...value };

  // 1. Save to Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      await supabaseAdmin.from('platform_settings').upsert({
        key,
        value: updated,
        updated_at: new Date().toISOString(),
        updated_by: adminId,
      });
    } catch (err) {
      console.warn('[Platform Settings] Supabase upsert error:', err);
    }
  }

  // 2. Save to local JSON
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let existing: any = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      } catch {}
    }
    existing[key] = updated;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Platform Settings] File write error:', err);
  }

  return updated;
}
