import fs from 'fs';
import path from 'path';
import { FOUNDER_TELEGRAM_ID, SITE_URL } from '@/lib/constants';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const VERIFIED_STORES_FILE = path.join(DATA_DIR, 'verified_stores.json');
const REGISTERED_STORES_FILE = path.join(DATA_DIR, 'registered_stores.json');
const BANNED_STORES_FILE = path.join(DATA_DIR, 'banned_stores.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export interface NewStoreNotificationData {
  slug: string;
  store_name: string;
  email?: string | null;
  phone?: string | null;
  instagram_url?: string | null;
  telegram_username?: string | null;
  telegram_chat_id?: string | null;
  description?: string | null;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: any
): Promise<boolean> {
  const botToken =
    process.env.TELEGRAM_BOT_TOKEN?.trim() ||
    process.env.TG_BOT_TOKEN?.trim();

  if (!botToken || !chatId) {
    console.warn('[Telegram] Cannot send message: botToken or chatId missing');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        reply_markup: replyMarkup,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.warn('[Telegram] Send message failed:', data);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Telegram] Send message error:', err);
    return false;
  }
}

export function isStoreVerifiedInFile(slug: string): boolean {
  try {
    const clean = slug.toLowerCase().trim();
    if (clean === 'tashkent_drip' || clean === 'samarkand_sweets') return true;
    if (!fs.existsSync(VERIFIED_STORES_FILE)) return false;
    const raw = fs.readFileSync(VERIFIED_STORES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Boolean(data[clean]?.verified);
  } catch {
    return false;
  }
}

export function setStoreVerifiedInFile(slug: string, verified: boolean = true): void {
  try {
    ensureDataDir();
    const clean = slug.toLowerCase().trim();
    let data: Record<string, any> = {};
    if (fs.existsSync(VERIFIED_STORES_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(VERIFIED_STORES_FILE, 'utf-8'));
      } catch {
        data = {};
      }
    }
    data[clean] = {
      slug: clean,
      verified,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(VERIFIED_STORES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Telegram] Error writing verified store:', err);
  }
}

export function isStoreBannedInFile(slug: string): boolean {
  try {
    const clean = slug.toLowerCase().trim();
    if (!fs.existsSync(BANNED_STORES_FILE)) return false;
    const raw = fs.readFileSync(BANNED_STORES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Boolean(data[clean]?.banned);
  } catch {
    return false;
  }
}

export function setStoreBannedInFile(slug: string, banned: boolean = true): void {
  try {
    ensureDataDir();
    const clean = slug.toLowerCase().trim();
    let data: Record<string, any> = {};
    if (fs.existsSync(BANNED_STORES_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(BANNED_STORES_FILE, 'utf-8'));
      } catch {
        data = {};
      }
    }
    data[clean] = {
      slug: clean,
      banned,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(BANNED_STORES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Telegram] Error writing banned store:', err);
  }
}

export function recordRegisteredStore(storeData: NewStoreNotificationData): void {
  try {
    ensureDataDir();
    const clean = storeData.slug.toLowerCase().trim();
    let data: Record<string, any> = {};
    if (fs.existsSync(REGISTERED_STORES_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(REGISTERED_STORES_FILE, 'utf-8'));
      } catch {
        data = {};
      }
    }
    const currentCount = Object.keys(data).length;
    const isFounding = currentCount < 100;
    const foundingNumber = currentCount + 1;

    data[clean] = {
      ...storeData,
      slug: clean,
      is_founding_seller: isFounding,
      founding_number: isFounding ? foundingNumber : undefined,
      registered_at: new Date().toISOString(),
    };
    fs.writeFileSync(REGISTERED_STORES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Telegram] Error recording registered store:', err);
  }
}

export function getFoundingSellerStatus(slug: string): { isFounding: boolean; foundingNumber?: number } {
  try {
    const clean = slug.toLowerCase().trim();
    if (clean === 'tashkent_drip') return { isFounding: true, foundingNumber: 1 };
    if (clean === 'samarkand_sweets') return { isFounding: true, foundingNumber: 2 };
    if (clean === 'volt_gadgets') return { isFounding: true, foundingNumber: 3 };
    if (clean === 'aura_perfume') return { isFounding: true, foundingNumber: 4 };

    if (!fs.existsSync(REGISTERED_STORES_FILE)) return { isFounding: true, foundingNumber: 5 };
    const raw = fs.readFileSync(REGISTERED_STORES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (data[clean]) {
      return {
        isFounding: Boolean(data[clean].is_founding_seller ?? true),
        foundingNumber: data[clean].founding_number || 5,
      };
    }
    const totalCount = Object.keys(data).length;
    if (totalCount < 100) {
      return { isFounding: true, foundingNumber: totalCount + 5 };
    }
    return { isFounding: false };
  } catch {
    return { isFounding: true, foundingNumber: 1 };
  }
}

export function getAllRegisteredStores(): Record<string, any> {
  try {
    if (!fs.existsSync(REGISTERED_STORES_FILE)) return {};
    const raw = fs.readFileSync(REGISTERED_STORES_FILE, 'utf-8');
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

/**
 * Notifies the Founder Telegram ID (5504101440) when a new store is created on BioMart.
 * Includes interactive inline action buttons to view and verify.
 */
export async function notifyFounderNewStore(data: NewStoreNotificationData): Promise<boolean> {
  recordRegisteredStore(data);

  const cleanSlug = data.slug.toLowerCase().trim();
  const storeUrl = `${SITE_URL}/${cleanSlug}`;
  const isAlreadyVerified = isStoreVerifiedInFile(cleanSlug);

  const messageText = `🏪 <b>НОВЫЙ МАГАЗИН ЗАРЕГИСТРИРОВАН!</b>
━━━━━━━━━━━━━━━━━━━━━
🏷 <b>Название:</b> ${escapeHtml(data.store_name || cleanSlug)}
🔗 <b>Адрес:</b> <code>${cleanSlug}</code>
🌐 <b>Витрина:</b> <a href="${storeUrl}">${storeUrl}</a>
👤 <b>Email:</b> ${escapeHtml(data.email || 'Не указан')}
📞 <b>Телефон:</b> ${escapeHtml(data.phone || 'Не указан')}
📸 <b>Instagram:</b> ${escapeHtml(data.instagram_url || 'Не указан')}
✈️ <b>Telegram:</b> ${data.telegram_username ? `@${escapeHtml(data.telegram_username.replace('@', ''))}` : 'Не привязан'}
${data.description ? `📝 <b>Описание:</b> <i>${escapeHtml(data.description)}</i>\n` : ''}━━━━━━━━━━━━━━━━━━━━━
Статус: ${isAlreadyVerified ? '🟢 <b>Верифицирован (Verified ✅)</b>' : '🟡 <b>Ожидает проверки модератором</b>'}`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🌐 Открыть витрину', url: storeUrl },
      ],
      [
        { text: '✅ Выдать Verified', callback_data: `verify_${cleanSlug}` },
        { text: '❌ Заблокировать', callback_data: `ban_${cleanSlug}` },
      ],
      [
        { text: '👑 Панель управления', callback_data: 'admin_panel' },
        { text: '📋 Все магазины', callback_data: 'admin_stores' },
      ],
    ],
  };

  return await sendTelegramMessage(FOUNDER_TELEGRAM_ID, messageText, inlineKeyboard);
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
