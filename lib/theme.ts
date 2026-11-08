import { StoreFontPreset, StoreRadiiPreset, StoreThemePreset, ThemeMode, CatalogLayout, StoreButtonText } from '@/types';

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
}

export interface StoreAccentTokens {
  accent: string;
  accentHover: string;
  accentSoft: string;
  onAccent: string;
}

export const TEMPLATE_DEFAULTS: Record<StoreThemePreset, ThemeSettings> = {
  minimal: {
    preset: 'minimal',
    accent_color: '#111827',
    theme: 'light',
    catalog_layout: 'grid',
    radii_preset: 'medium',
    button_text: 'cart',
    show_old_price: true,
    announcement_active: false,
    announcement_text: '',
    hide_branding: false,
  },
  warm: {
    preset: 'warm',
    accent_color: '#B85934',
    theme: 'light',
    catalog_layout: 'grid',
    radii_preset: 'round',
    button_text: 'buy',
    show_old_price: true,
    announcement_active: false,
    announcement_text: '',
    hide_branding: false,
  },
  streetwear: {
    preset: 'streetwear',
    accent_color: '#E5FF00',
    theme: 'dark',
    catalog_layout: 'grid',
    radii_preset: 'sharp',
    button_text: 'order',
    show_old_price: true,
    announcement_active: false,
    announcement_text: '',
    hide_branding: false,
  },
  boutique: {
    preset: 'boutique',
    accent_color: '#2A483E',
    theme: 'light',
    catalog_layout: 'list',
    radii_preset: 'medium',
    button_text: 'buy',
    show_old_price: true,
    announcement_active: false,
    announcement_text: '',
    hide_branding: false,
  },
  cyber: {
    preset: 'cyber',
    accent_color: '#00F0FF',
    theme: 'dark',
    catalog_layout: 'grid',
    radii_preset: 'sharp',
    button_text: 'buy',
    show_old_price: true,
    announcement_active: false,
    announcement_text: '',
    hide_branding: false,
  },
  vintage: {
    preset: 'vintage',
    accent_color: '#8C6D4F',
    theme: 'light',
    catalog_layout: 'grid',
    radii_preset: 'medium',
    button_text: 'order',
    show_old_price: true,
    announcement_active: false,
    announcement_text: '',
    hide_branding: false,
  },
  organic: {
    preset: 'organic',
    accent_color: '#1F7A5A',
    theme: 'light',
    catalog_layout: 'grid',
    radii_preset: 'round',
    button_text: 'cart',
    show_old_price: true,
    announcement_active: false,
    announcement_text: '',
    hide_branding: false,
  },
  editorial: {
    preset: 'editorial',
    accent_color: '#111827',
    theme: 'light',
    catalog_layout: 'list',
    radii_preset: 'sharp',
    button_text: 'buy',
    show_old_price: true,
    announcement_active: false,
    announcement_text: '',
    hide_branding: false,
  },
};

export const ACCENT_SWATCHES = [
  { name: 'Графит', nameUz: 'Grafit', hex: '#111827' },
  { name: 'Изумруд', nameUz: 'Zumrad', hex: '#1F7A5A' },
  { name: 'Королевский синий', nameUz: 'Qirollik ko‘k', hex: '#2563EB' },
  { name: 'Фиолетовый', nameUz: 'Binafsha', hex: '#7C3AED' },
  { name: 'Терракота', nameUz: 'Terrakota', hex: '#B85934' },
  { name: 'Рубин', nameUz: 'Yoqut', hex: '#E11D48' },
  { name: 'Неон', nameUz: 'Neon sariq', hex: '#E5FF00' },
  { name: 'Янтарь', nameUz: 'Qahrabo', hex: '#F59E0B' },
] as const;

export const TEMPLATE_CARDS = [
  {
    id: 'minimal' as const,
    name: 'Минимал',
    nameUz: 'Minimal',
    desc: 'Чистый, строгий, черно-белый контраст',
    descUz: 'Oq-qora, toza va zamonaviy',
    bg: '#F7F6F2',
    cardBg: '#FFFFFF',
    accent: '#111827',
    textColor: '#1A1A1A',
    radii: '8px',
    font: 'Onest',
  },
  {
    id: 'warm' as const,
    name: 'Тёплая',
    nameUz: 'Iliq',
    desc: 'Уютные кремовые тона и мягкие скругления',
    descUz: 'Qulay sarg‘ish tuslar va yumaloq shakllar',
    bg: '#F5EFEB',
    cardBg: '#FAF7F2',
    accent: '#B85934',
    textColor: '#2C2219',
    radii: '16px',
    font: 'Onest',
  },
  {
    id: 'streetwear' as const,
    name: 'Streetwear',
    nameUz: 'Streetwear',
    desc: 'Тёмный фон, сочный неон и острые углы',
    descUz: 'Qorong‘i fon, yorqin neon va o‘tkir burchaklar',
    bg: '#0C0C0C',
    cardBg: '#171717',
    accent: '#E5FF00',
    textColor: '#FFFFFF',
    radii: '2px',
    font: 'Montserrat',
  },
  {
    id: 'boutique' as const,
    name: 'Бутик',
    nameUz: 'Butik',
    desc: 'Антиква Serif, благородный изумруд и воздух',
    descUz: 'Elegant serif shrift, chuqur zumrad va nafosat',
    bg: '#FAF8F5',
    cardBg: '#FFFFFF',
    accent: '#2A483E',
    textColor: '#1C1917',
    radii: '10px',
    font: 'Playfair Display',
  },
  {
    id: 'cyber' as const,
    name: 'Cyber Neo',
    nameUz: 'Kiber Neo',
    desc: 'Футуристичный неоновый вайб и техно-акценты',
    descUz: 'Futuristik neon va zamonaviy texno aksentlar',
    bg: '#0A0F14',
    cardBg: '#131B24',
    accent: '#00F0FF',
    textColor: '#E0F7FA',
    radii: '4px',
    font: 'Montserrat',
  },
  {
    id: 'vintage' as const,
    name: 'Винтаж',
    nameUz: 'Vintaj',
    desc: 'Ностальгия, теплый крафт и книжная эстетика',
    descUz: 'Nostalgiya, iliq qog‘oz va kitobiy estetika',
    bg: '#F5EBE1',
    cardBg: '#FCF8F2',
    accent: '#8C6D4F',
    textColor: '#3A2E22',
    radii: '12px',
    font: 'Playfair Display',
  },
  {
    id: 'organic' as const,
    name: 'Органика',
    nameUz: 'Organika',
    desc: 'Натуральный эко-зеленый и плавные био-формы',
    descUz: 'Tabiiy eko-yashil va yumshoq shakllar',
    bg: '#F2F8F5',
    cardBg: '#FFFFFF',
    accent: '#1F7A5A',
    textColor: '#163629',
    radii: '18px',
    font: 'Onest',
  },
  {
    id: 'editorial' as const,
    name: 'Editorial',
    nameUz: 'Jurnal',
    desc: 'Высокая мода, строгие пропорции и глянец',
    descUz: 'Yuqori moda, qat’iy proporsiyalar va joziba',
    bg: '#FFFFFF',
    cardBg: '#F9F9F9',
    accent: '#111827',
    textColor: '#111827',
    radii: '2px',
    font: 'Montserrat',
  },
] as const;

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = (hex || '').replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(clean)) {
    return { r: 17, g: 24, b: 39 }; // #111827 default
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

export function getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes --store-accent, --store-accent-hover, --store-accent-soft, and --store-on-accent
 * with strict WCAG AA contrast (>= 4.5:1 for button text).
 */
export function computeStoreTokens(accentHex?: string, isDark: boolean = false): StoreAccentTokens {
  const rgb = hexToRgb(accentHex || '#111827');
  const L = getRelativeLuminance(rgb);

  // 1. Text color on accent: WCAG contrast check against White and Black
  const contrastWithWhite = 1.05 / (L + 0.05);
  const contrastWithBlack = (L + 0.05) / 0.05;

  let onAccent = '#FFFFFF';
  if (contrastWithWhite < 4.5 && contrastWithBlack >= 4.5) {
    onAccent = '#111827';
  } else if (contrastWithWhite < 4.5 && contrastWithBlack < 4.5) {
    onAccent = contrastWithBlack > contrastWithWhite ? '#111827' : '#FFFFFF';
  }

  // 2. Hover state:
  let hoverRgb: { r: number; g: number; b: number };
  if (L > 0.5) {
    // Very light accent (like #E5FF00 neon or pastel) -> darken by 15%
    hoverRgb = { r: rgb.r * 0.85, g: rgb.g * 0.85, b: rgb.b * 0.85 };
  } else if (L < 0.05) {
    // Very dark accent (like #000000 or #111827) -> lighten for visibility
    hoverRgb = {
      r: Math.min(255, rgb.r + 35),
      g: Math.min(255, rgb.g + 35),
      b: Math.min(255, rgb.b + 35),
    };
  } else {
    // Mid/dark tone:
    if (isDark) {
      hoverRgb = {
        r: Math.min(255, rgb.r + 28),
        g: Math.min(255, rgb.g + 28),
        b: Math.min(255, rgb.b + 28),
      };
    } else {
      hoverRgb = { r: rgb.r * 0.88, g: rgb.g * 0.88, b: rgb.b * 0.88 };
    }
  }

  // 3. Soft background state:
  let softRgb: { r: number; g: number; b: number };
  if (isDark) {
    // 25% blend over #1E1E1E dark background
    softRgb = {
      r: rgb.r * 0.25 + 30 * 0.75,
      g: rgb.g * 0.25 + 30 * 0.75,
      b: rgb.b * 0.25 + 30 * 0.75,
    };
  } else {
    // 12% blend over #FFFFFF light background
    softRgb = {
      r: rgb.r * 0.12 + 255 * 0.88,
      g: rgb.g * 0.12 + 255 * 0.88,
      b: rgb.b * 0.12 + 255 * 0.88,
    };
  }

  return {
    accent: rgbToHex(rgb.r, rgb.g, rgb.b),
    accentHover: rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b),
    accentSoft: rgbToHex(softRgb.r, softRgb.g, softRgb.b),
    onAccent,
  };
}

/**
 * Resolves full effective ThemeSettings with defaults applied for the selected template.
 * Stores all values in a single theme_settings object.
 */
export function getEffectiveThemeSettings(raw?: Partial<ThemeSettings> | null, legacySettings?: Record<string, any>): ThemeSettings {
  const preset: StoreThemePreset = raw?.preset || (legacySettings?.theme_preset as StoreThemePreset) || 'minimal';
  const defaults = TEMPLATE_DEFAULTS[preset] || TEMPLATE_DEFAULTS.minimal;

  return {
    preset,
    accent_color: raw?.accent_color || legacySettings?.accent_color || defaults.accent_color,
    theme: raw?.theme || (legacySettings?.theme as ThemeMode) || defaults.theme,
    avatar_url: raw?.avatar_url ?? legacySettings?.avatar_url ?? '',
    banner_url: raw?.banner_url ?? legacySettings?.banner_url ?? '',
    catalog_layout: raw?.catalog_layout || (legacySettings?.catalog_layout as CatalogLayout) || defaults.catalog_layout,
    radii_preset: raw?.radii_preset || (legacySettings?.radii_preset as StoreRadiiPreset) || defaults.radii_preset,
    button_text: raw?.button_text || (legacySettings?.button_text as StoreButtonText) || defaults.button_text,
    show_old_price: raw?.show_old_price !== undefined ? raw.show_old_price : (legacySettings?.show_old_price ?? defaults.show_old_price),
    announcement_active: raw?.announcement_active !== undefined ? raw.announcement_active : (legacySettings?.announcement_active ?? defaults.announcement_active),
    announcement_text: raw?.announcement_text ?? legacySettings?.announcement_text ?? defaults.announcement_text,
    hide_branding: raw?.hide_branding !== undefined ? raw.hide_branding : (legacySettings?.hide_branding ?? defaults.hide_branding),
  };
}
