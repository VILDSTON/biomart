/**
 * BioMart Moderation & Content Safety Engine
 * Multi-language Stop-List (Russian, Uzbek, English) with Anti-Bypass Normalization
 */

// 1. Core Stop-List Roots (Categorized)
export const STOP_WORDS = [
  // Prohibited Goods & Contraband (Weapons, Drugs, Tobacco/Vapes, Counterfeit Scam)
  'наркотик', 'наркота', 'мефедрон', 'героин', 'кокаин', 'марихуана', 'гашиш', 'спайс', 'соли', 'закладка',
  'оружие', 'пистолет', 'автомат', 'боеприпасы', 'патроны', 'граната', 'взрывчатка',
  'порно', 'сексшоп', 'интим', 'проститутка', 'шлюха',
  'лохотрон', 'казино', 'букмекер', 'ставки', '1xbet', 'пирамида', 'криптоскам', 'инвестиции 100%',
  // Russian Profanity (Mata)
  'хуй', 'хуя', 'хуе', 'хуи', 'пизда', 'пизде', 'пизду', 'ебать', 'ебан', 'ебал', 'ебут', 'бляд', 'бля',
  'сука', 'мудак', 'гондон', 'шмара', 'залупа', 'чмо',
  // Uzbek Profanity & Prohibited (So'kish va taqiqlangan)
  'onangni', 'otangni', 'sikay', 'sikey', 'sikish', 'dalbayob', 'itvachcha', 'jalap', 'foxisha',
  'quroq', 'narkotik', 'qimor', 'bukmeker',
  // English Profanity & Prohibited
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'nigger', 'porn', 'cocaine',
  'heroin', 'weed', 'casino', 'betting', 'scam', 'fraud'
];

// 2. Homoglyphs & Leetspeak Replacement Map (transforms obfuscations to canonical latin)
const HOMOGLYPHS: Record<string, string> = {
  // Cyrillic to Latin visually identical characters
  'а': 'a', 'б': 'b', 'в': 'b', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z',
  'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'h', 'о': 'o', 'п': 'n', 'р': 'p',
  'с': 'c', 'т': 't', 'у': 'y', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh',
  'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  // Symbols & Digits (Leetspeak)
  '0': 'o', '1': 'i', '!': 'i', '|': 'i', '3': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's',
  '7': 't', '8': 'b', '9': 'g'
};

/**
 * Normalizes text to defeat bypass techniques:
 * - Lowercase
 * - Transliterates homoglyphs
 * - Strips punctuation, whitespace, dots, underscores, dashes
 * - Collapses consecutive identical characters (e.g. "shiiiit" -> "shit", "блллля" -> "бля")
 */
export function normalizeForModeration(input: string): string {
  if (!input) return '';
  const lower = input.toLowerCase();

  // Replace homoglyphs and leetspeak
  let replaced = '';
  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    replaced += HOMOGLYPHS[ch] || ch;
  }

  // Remove non-alphanumeric separators (spaces, dots, underscores, dashes, zero-width chars)
  const stripped = replaced.replace(/[\s\-_.,/*+~`'"!@#$%^&()=[\]{}|\\:;<>?]/g, '');

  // Collapse 3+ repeats to max 2 repeats
  const collapsed = stripped.replace(/(.)\1{2,}/g, '$1$1');

  return collapsed;
}

export interface ModerationResult {
  isValid: boolean;
  flaggedWord?: string;
  reason?: string;
}

/**
 * Checks a single text string against the multi-lingual stop-list with anti-bypass detection
 */
export function checkTextModeration(rawText: string): ModerationResult {
  if (!rawText || typeof rawText !== 'string') {
    return { isValid: true };
  }

  const normalized = normalizeForModeration(rawText);
  const normalizedWords = rawText.toLowerCase().split(/\s+/);

  for (const stopRoot of STOP_WORDS) {
    const normRoot = normalizeForModeration(stopRoot);

    // 1. Direct whole-word check
    if (normalizedWords.some((w) => w === stopRoot || w.startsWith(stopRoot))) {
      return {
        isValid: false,
        flaggedWord: stopRoot,
        reason: `Текст содержит недопустимое слово или запрещенную лексику: "${stopRoot}"`
      };
    }

    // 2. Anti-bypass substring check on stripped text (e.g. "s p a m" or "s.k.a.m")
    if (normRoot.length >= 3 && normalized.includes(normRoot)) {
      return {
        isValid: false,
        flaggedWord: stopRoot,
        reason: `Текст содержит скрытое запрещенное слово: "${stopRoot}"`
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates full store details: name, slug, description and product titles
 */
export function validateStoreContent(payload: {
  store_name?: string;
  slug?: string;
  description?: string;
  productTitles?: string[];
}): { isValid: boolean; error?: string } {
  // Check store name
  if (payload.store_name) {
    const res = checkTextModeration(payload.store_name);
    if (!res.isValid) {
      return { isValid: false, error: `В названии магазина: ${res.reason}` };
    }
  }

  // Check slug
  if (payload.slug) {
    const res = checkTextModeration(payload.slug);
    if (!res.isValid) {
      return { isValid: false, error: `В адресе ссылки (slug): ${res.reason}` };
    }
  }

  // Check description
  if (payload.description) {
    const res = checkTextModeration(payload.description);
    if (!res.isValid) {
      return { isValid: false, error: `В описании витрины: ${res.reason}` };
    }
  }

  // Check product titles
  if (payload.productTitles && Array.isArray(payload.productTitles)) {
    for (const title of payload.productTitles) {
      const res = checkTextModeration(title);
      if (!res.isValid) {
        return { isValid: false, error: `В названии товара "${title}": ${res.reason}` };
      }
    }
  }

  return { isValid: true };
}

// 3. Persistent In-Memory / Local Storage Store for Bans & Complaints
export interface BannedEntity {
  id: string;
  type: 'phone' | 'slug';
  value: string;
  reason: string;
  bannedAt: string;
}

export interface Complaint {
  id: string;
  storeSlug: string;
  storeName?: string;
  productId?: string;
  productTitle?: string;
  reason: 'profanity' | 'fraud' | 'prohibited_goods' | 'spam' | 'other';
  comment?: string;
  reporterContact?: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
}

// Default banned entities for platform protection
export const INITIAL_BANS: BannedEntity[] = [
  { id: 'b-1', type: 'phone', value: '+998909999999', reason: 'Многократный спам и фишинг', bannedAt: '2026-11-01' },
  { id: 'b-2', type: 'slug', value: 'scam_shop', reason: 'Мошеннический адрес', bannedAt: '2026-11-02' },
];

export function isPhoneBanned(phone: string, banList: BannedEntity[] = INITIAL_BANS): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[^0-9]/g, '');
  return banList.some((b) => b.type === 'phone' && b.value.replace(/[^0-9]/g, '') === clean);
}

export function isSlugBanned(slug: string, banList: BannedEntity[] = INITIAL_BANS): boolean {
  if (!slug) return false;
  const clean = slug.toLowerCase().trim();
  return banList.some((b) => b.type === 'slug' && b.value.toLowerCase().trim() === clean);
}
