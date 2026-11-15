import fs from 'fs';
import path from 'path';
import { FOUNDER_TELEGRAM_ID, SITE_URL } from '@/lib/constants';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

const DATA_DIR = path.join(process.cwd(), 'data');

function getSafeFilePath(filename: string): string {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return path.join(DATA_DIR, filename);
  } catch {
    const tmpDir = path.join('/tmp', 'biomart_data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {}
    return path.join(tmpDir, filename);
  }
}

function readJsonFileSafe(filename: string): Record<string, any> {
  const filePath = getSafeFilePath(filename);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`[Telegram Storage] Error reading ${filename}:`, err);
  }
  return {};
}

function writeJsonFileSafe(filename: string, data: Record<string, any>): void {
  const filePath = getSafeFilePath(filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[Telegram Storage] Error writing ${filename}:`, err);
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
    const data = readJsonFileSafe('verified_stores.json');
    if (data[clean] !== undefined) {
      return Boolean(data[clean]?.verified ?? data[clean]);
    }
    // Default initial seed for demo stores if not explicitly modified
    const defaultVerified = ['tashkent_drip', 'samarkand_sweets', 'volt_gadgets', 'aura_perfume'];
    return defaultVerified.includes(clean);
  } catch {
    return false;
  }
}

export function setStoreVerifiedInFile(slug: string, verified: boolean = true): void {
  try {
    const clean = slug.toLowerCase().trim();
    const data = readJsonFileSafe('verified_stores.json');
    data[clean] = {
      slug: clean,
      verified,
      updated_at: new Date().toISOString(),
    };
    writeJsonFileSafe('verified_stores.json', data);
  } catch (err) {
    console.warn('[Telegram] Error writing verified store:', err);
  }
}

export function isStoreBannedInFile(slug: string): boolean {
  try {
    const clean = slug.toLowerCase().trim();
    const data = readJsonFileSafe('banned_stores.json');
    return Boolean(data[clean]?.banned);
  } catch {
    return false;
  }
}

export function setStoreBannedInFile(slug: string, banned: boolean = true): void {
  try {
    const clean = slug.toLowerCase().trim();
    const data = readJsonFileSafe('banned_stores.json');
    data[clean] = {
      slug: clean,
      banned,
      updated_at: new Date().toISOString(),
    };
    writeJsonFileSafe('banned_stores.json', data);
  } catch (err) {
    console.warn('[Telegram] Error writing banned store:', err);
  }
}

export function recordRegisteredStore(storeData: NewStoreNotificationData): void {
  try {
    const clean = storeData.slug.toLowerCase().trim();
    const data = readJsonFileSafe('registered_stores.json');
    data[clean] = {
      ...storeData,
      slug: clean,
      registered_at: new Date().toISOString(),
    };
    writeJsonFileSafe('registered_stores.json', data);
  } catch (err) {
    console.warn('[Telegram] Error recording registered store:', err);
  }
}

export function getFoundingSellerStatus(_slug: string): { isFounding: boolean; foundingNumber?: number } {
  return { isFounding: false };
}

export function getAllRegisteredStores(): Record<string, any> {
  return readJsonFileSafe('registered_stores.json');
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
