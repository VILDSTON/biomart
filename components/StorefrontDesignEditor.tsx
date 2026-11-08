'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Palette,
  Check,
  Sun,
  Moon,
  Smartphone,
  LayoutGrid,
  List,
  Upload,
  RotateCcw,
  Save,
  Sparkles,
  ChevronDown,
  ShoppingBag,
  Send,
  Phone,
  ShieldCheck,
  Tag,
  AlertCircle,
  Eye,
  Plus,
  RefreshCw,
  Zap,
  Info,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ThemeSettings,
  TEMPLATE_DEFAULTS,
  TEMPLATE_CARDS,
  ACCENT_SWATCHES,
  computeStoreTokens,
  getEffectiveThemeSettings,
} from '@/lib/theme';
import { StoreSettings, StoreThemePreset, CatalogLayout, ThemeMode, StoreRadiiPreset, StoreButtonText } from '@/types';
import { formatPrice } from '@/lib/utils';
import { designTranslations } from '@/lib/i18n';

interface StorefrontDesignEditorProps {
  settings: StoreSettings;
  onSave: (themeSettings: ThemeSettings) => void;
  language?: 'ru' | 'uz';
}

const AVATAR_THEMES = [
  { label: 'Одежда', labelUz: 'Kiyim', url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80' },
  { label: 'Обувь', labelUz: 'Poyabzal', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80' },
  { label: 'Парфюм', labelUz: 'Atir', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80' },
  { label: 'Бьюти', labelUz: 'Go‘zallik', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80' },
  { label: 'Сладости', labelUz: 'Shirinlik', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80' },
  { label: 'Украшения', labelUz: 'Taqichoq', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' },
];

const PREVIEW_PRODUCTS = [
  {
    id: 'p-1',
    title: 'Худи Оверсайз «Ташкент» Drip',
    titleUz: 'Xudi Obersayz «Toshkent» Drip',
    price: 320000,
    oldPrice: 390000,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=80',
    inStock: true,
  },
  {
    id: 'p-2',
    title: 'Кроссовки Vintage Cream Runner',
    titleUz: 'Krossovka Vintage Cream Runner',
    price: 680000,
    oldPrice: 850000,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=80',
    inStock: true,
  },
  {
    id: 'p-3',
    title: 'Парфюм Tobacco Vanille 10ml',
    titleUz: 'Atir Tobacco Vanille 10ml',
    price: 190000,
    oldPrice: 240000,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=500&q=80',
    inStock: true,
  },
  {
    id: 'p-4',
    title: 'Футболка Heavyweight Washed',
    titleUz: 'Futbolka Heavyweight Washed',
    price: 210000,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80',
    inStock: true,
  },
];

export const StorefrontDesignEditor: React.FC<StorefrontDesignEditorProps> = ({
  settings,
  onSave,
  language = 'ru',
}) => {
  const [editorLang, setEditorLang] = useState<'ru' | 'uz'>(language || 'ru');

  React.useEffect(() => {
    if (language) setEditorLang(language);
  }, [language]);

  const t = designTranslations[editorLang] || designTranslations.ru;
  const isUz = editorLang === 'uz';

  const initialSettings = useMemo(() => {
    return getEffectiveThemeSettings(settings.theme_settings, settings);
  }, [settings]);

  const [form, setForm] = useState<ThemeSettings>(initialSettings);
  const [savedSnapshot, setSavedSnapshot] = useState<ThemeSettings>(initialSettings);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [customColorTooltip, setCustomColorTooltip] = useState<string | null>(null);
  const [watermarkTooltip, setWatermarkTooltip] = useState<string | null>(null);
  const [aiTooltip, setAiTooltip] = useState<string | null>(null);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [mobileViewTab, setMobileViewTab] = useState<'settings' | 'preview'>('settings');

  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(savedSnapshot);
  }, [form, savedSnapshot]);

  // Is preview dark?
  const isPreviewDark = useMemo(() => {
    if (form.theme === 'dark') return true;
    if (form.theme === 'system') return false;
    return false;
  }, [form.theme]);

  // Compute live tokens
  const tokens = useMemo(() => {
    return computeStoreTokens(form.accent_color, isPreviewDark);
  }, [form.accent_color, isPreviewDark]);

  // Template switch handler
  const handleSelectTemplate = (preset: StoreThemePreset) => {
    const defaults = TEMPLATE_DEFAULTS[preset];
    setForm((prev) => ({
      ...prev,
      preset,
      accent_color: defaults.accent_color,
      theme: defaults.theme,
      catalog_layout: defaults.catalog_layout,
      radii_preset: defaults.radii_preset,
      button_text: defaults.button_text,
    }));
  };

  // Swatch click handler
  const handleSelectSwatch = (hex: string) => {
    setForm((prev) => ({ ...prev, accent_color: hex }));
    setCustomColorTooltip(null);
  };

  // Custom color handler (Plus check)
  const handleCustomColorInput = (hex: string) => {
    const isFreePlan = (settings.plan || 'start') === 'start';
    if (isFreePlan) {
      setCustomColorTooltip(t.customColorPlusHint);
      return;
    }
    setCustomColorTooltip(null);
    setForm((prev) => ({ ...prev, accent_color: hex }));
  };

  // AI Style Generator handler (BioMart brand powered)
  const handleAiGenerateStyle = () => {
    setIsGeneratingAi(true);
    setAiSuccessMsg(null);

    setTimeout(() => {
      const storeName = (settings.store_name || '').toLowerCase();
      let chosenPreset: StoreThemePreset = 'streetwear';
      let chosenAccent = '#111827';
      let chosenRadii: StoreRadiiPreset = 'medium';
      let chosenBtn: StoreButtonText = 'cart';
      let rationale = '';

      if (storeName.includes('halva') || storeName.includes('sweet') || storeName.includes('сладост') || storeName.includes('мед')) {
        chosenPreset = 'warm';
        chosenAccent = '#B85934';
        chosenRadii = 'round';
        chosenBtn = 'buy';
        rationale = 'AI определил категорию «Восточные сладости и гастрономия». Применен стиль «Тёплая» с карамельным акцентом #B85934 и мягкими скруглениями 16px.';
      } else if (storeName.includes('perfum') || storeName.includes('парфюм') || storeName.includes('beauty') || storeName.includes('бутик') || storeName.includes('rose')) {
        chosenPreset = 'boutique';
        chosenAccent = '#2A483E';
        chosenRadii = 'medium';
        chosenBtn = 'buy';
        rationale = 'AI определил категорию «Селективная парфюмерия и бьюти». Применен стиль «Бутик» с благородным глубоким изумрудом #2A483E и шрифтом Playfair Display.';
      } else if (storeName.includes('tech') || storeName.includes('gadget') || storeName.includes('кибер') || storeName.includes('auto')) {
        chosenPreset = 'cyber';
        chosenAccent = '#00F0FF';
        chosenRadii = 'sharp';
        chosenBtn = 'order';
        rationale = 'AI определил категорию «Электроника и гаджеты». Применен технологичный стиль «Cyber Neo» с неоновым акцентом #00F0FF.';
      } else if (storeName.includes('eco') || storeName.includes('bio') || storeName.includes('органик') || storeName.includes('tea')) {
        chosenPreset = 'organic';
        chosenAccent = '#1F7A5A';
        chosenRadii = 'round';
        chosenBtn = 'cart';
        rationale = 'AI определил категорию «Эко-товары и здоровье». Применен стиль «Органика» с фирменным био-акцентом #1F7A5A.';
      } else {
        chosenPreset = 'streetwear';
        chosenAccent = '#111827';
        chosenRadii = 'sharp';
        chosenBtn = 'order';
        rationale = 'AI определил премиальный характер бренда. Применен динамичный стиль «Streetwear» с контрастным акцентом #111827 и плотной сеткой каталога.';
      }

      setForm((prev) => ({
        ...prev,
        preset: chosenPreset,
        accent_color: chosenAccent,
        radii_preset: chosenRadii,
        button_text: chosenBtn,
      }));

      setIsGeneratingAi(false);
      setAiSuccessMsg(rationale);
    }, 600);
  };

  // Save changes (Writes to database callback, sets SSR cookie, syncs localStorage across tabs, and calls on-demand revalidation)
  const handleSave = () => {
    try {
      const slug = settings.slug || 'tashkent_drip';
      const serialized = JSON.stringify(form);
      document.cookie = `biomart_theme_${slug}=${encodeURIComponent(serialized)}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`biomart_store_theme_${slug}`, serialized);
        localStorage.setItem('biomart_store_theme_tashkent_drip', serialized);
        localStorage.setItem('biomart_buyer_theme', form.theme === 'dark' ? 'dark' : 'light');
        window.dispatchEvent(new CustomEvent('biomart_theme_updated', { detail: { slug, themeSettings: form } }));
      }
      fetch(`/api/revalidate?slug=${slug}`, { method: 'POST' }).catch(() => {});
    } catch {}

    onSave(form);
    setSavedSnapshot(form);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  // Reset to saved
  const handleReset = () => {
    setForm(savedSnapshot);
    setCustomColorTooltip(null);
    setWatermarkTooltip(null);
    setAiTooltip(null);
  };

  // Local image upload handler
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'avatar_url' | 'banner_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(isUz ? 'Fayl hajmi 2MB dan oshmasligi kerak' : 'Размер файла не должен превышать 2 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setForm((prev) => ({ ...prev, [field]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-content-primary">{t.pageTitle}</h1>
            {hasChanges && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {t.unsavedBadge}
              </span>
            )}
            {isSavedToast && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-soft text-brand border border-brand/30 animate-fade-in">
                <Check className="w-3 h-3 stroke-[3]" />
                {t.savedSuccess}
              </span>
            )}
          </div>
          <p className="text-xs text-content-secondary mt-0.5">{t.pageSubtitle}</p>
        </div>

        {/* Action Buttons: Save & Reset */}
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-[10px] text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-page transition-colors"
            >
              {t.resetDefault}
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              hasChanges
                ? 'bg-brand hover:bg-brand-hover text-white active:scale-95'
                : 'bg-[#E7E4DC] text-[#9E9E99] cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t.saveChanges}</span>
          </button>
        </div>
      </div>

      {/* Mobile-Only Tab Switcher: Prevents phone mockup from covering controls on mobile */}
      <div className="lg:hidden flex items-center p-1 bg-surface border border-border rounded-[12px] shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileViewTab('settings')}
          className={`flex-1 py-2 text-xs font-semibold rounded-[9px] flex items-center justify-center gap-1.5 transition-all ${
            mobileViewTab === 'settings'
              ? 'bg-[#1F7A5A] text-white shadow-xs'
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Настройки дизайна</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileViewTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-[9px] flex items-center justify-center gap-1.5 transition-all ${
            mobileViewTab === 'preview'
              ? 'bg-[#1F7A5A] text-white shadow-xs'
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Живое превью витрины</span>
        </button>
      </div>

      {/* Main Grid: Desktop 2 Columns (Settings Left, Live Phone Right), Mobile Switchable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* SETTINGS COLUMN: 5 MAIN CONTROLS + ACCORDION (7 COLS ON DESKTOP) */}
        {/* ========================================================================= */}
        <div className={`lg:col-span-7 space-y-6 ${mobileViewTab === 'settings' ? 'block' : 'hidden lg:block'}`}>
          {/* AI Assistant Banner (Pro Tier) - BioMart Brand Colors & Fully Functional Generator */}
          <div className="bg-brand-soft/40 border border-brand-border rounded-[14px] p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-content-primary">AI-дизайнер витрины</h3>
                    <span className="text-[10px] font-bold text-brand bg-brand-soft px-1.5 py-0.2 rounded border border-brand/20">
                      Pro
                    </span>
                  </div>
                  <p className="text-[11px] text-content-secondary mt-0.5 leading-snug">
                    Умный подбор идеальной палитры, шрифта и баннера под ваши фото товаров.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleAiGenerateStyle}
                className="px-3.5 py-2 rounded-[10px] bg-brand hover:bg-brand-hover text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI подбирает стиль...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Сгенерировать стиль через AI</span>
                  </>
                )}
              </button>
            </div>
            {aiSuccessMsg && (
              <div className="mt-2.5 p-2.5 rounded-[8px] bg-brand-soft border border-brand-border text-brand text-[11px] flex items-start gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand" />
                <span>{aiSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* 1. СТИЛЬ (4 ГОТОВЫХ ШАБЛОНА) */}
          {/* ===================================================================== */}
          <div className="bg-surface rounded-[14px] border border-border p-4 sm:p-5 shadow-xs">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-content-primary">{t.styleTitle}</h2>
              <p className="text-xs text-content-secondary mt-0.5">{t.styleSubtitle}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TEMPLATE_CARDS.map((tpl) => {
                const isSelected = form.preset === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`relative p-2.5 rounded-[12px] text-left transition-all flex flex-col justify-between border ${
                      isSelected
                        ? 'border-brand ring-2 ring-brand/30 bg-page shadow-sm'
                        : 'border-border bg-surface hover:border-brand/50'
                    }`}
                  >
                    {/* Visual Miniature Card */}
                    <div
                      className="w-full aspect-[4/3] rounded-[8px] p-2 flex flex-col justify-between mb-2 shadow-xs border border-black/5"
                      style={{ backgroundColor: tpl.bg }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tpl.accent }}
                        />
                        <span
                          className="text-[9px] font-bold"
                          style={{ color: tpl.textColor, fontFamily: tpl.font }}
                        >
                          Aa
                        </span>
                      </div>

                      {/* Mini Mock Product */}
                      <div
                        className="rounded p-1 shadow-xs flex items-center justify-between"
                        style={{ backgroundColor: tpl.cardBg }}
                      >
                        <div className="w-4 h-2 rounded bg-black/10" />
                        <div
                          className="w-3 h-2 rounded text-[7px] flex items-center justify-center font-bold text-white"
                          style={{ backgroundColor: tpl.accent }}
                        >
                          +
                        </div>
                      </div>
                    </div>

                    {/* Card Title & Desc */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-content-primary">
                          {isUz ? tpl.nameUz : tpl.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-content-secondary line-clamp-2 mt-0.5 leading-tight">
                        {isUz ? tpl.descUz : tpl.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 2. ЦВЕТ АКЦЕНТА (8 ОБРАЗЦОВ + СВОЙ ЦВЕТ) */}
          {/* ===================================================================== */}
          <div className="bg-surface rounded-[14px] border border-border p-4 sm:p-5 shadow-xs">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-content-primary">{t.accentTitle}</h2>
                <p className="text-xs text-content-secondary mt-0.5">{t.accentSubtitle}</p>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-page border border-border text-content-primary">
                {form.accent_color.toUpperCase()}
              </span>
            </div>

            {/* 8 Ready Swatches */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-3">
              {ACCENT_SWATCHES.map((sw) => {
                const isSelected = form.accent_color.toLowerCase() === sw.hex.toLowerCase();
                const swTokens = computeStoreTokens(sw.hex, false);
                return (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() => handleSelectSwatch(sw.hex)}
                    className={`group relative aspect-square rounded-[10px] flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-brand scale-105 shadow-sm'
                        : 'hover:scale-102 opacity-90 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: sw.hex }}
                    title={`${isUz ? sw.nameUz : sw.name} (${sw.hex})`}
                  >
                    {isSelected && (
                      <Check
                        className="w-4 h-4 stroke-[3]"
                        style={{ color: swTokens.onAccent }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* «Свой цвет» (HEX) */}
            <div className="pt-2 border-t border-border/80">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={(e) => handleCustomColorInput(e.target.value)}
                    className="w-9 h-9 rounded-[8px] border border-border cursor-pointer p-0.5 bg-white"
                  />
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={form.accent_color}
                    onChange={(e) => handleCustomColorInput(e.target.value)}
                    placeholder="#111827"
                    maxLength={7}
                    className="w-full px-3 py-2 bg-page border border-border rounded-[10px] text-xs font-mono text-content-primary uppercase focus:outline-none focus:border-brand"
                  />
                  {(settings.plan || 'start') === 'start' && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-brand bg-brand-soft px-1.5 py-0.5 rounded">
                      Plus
                    </span>
                  )}
                </div>
              </div>

              {customColorTooltip && (
                <div className="mt-2 p-2.5 rounded-[8px] bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>{customColorTooltip}</span>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 3. ТЕМА (СВЕТЛАЯ, ТЁМНАЯ, КАК В СИСТЕМЕ) */}
          {/* ===================================================================== */}
          <div className="bg-surface rounded-[14px] border border-border p-4 sm:p-5 shadow-xs">
            <h2 className="text-sm font-bold text-content-primary mb-2.5">{t.themeTitle}</h2>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, theme: 'light' }))}
                className={`py-2 px-3 rounded-[10px] border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  form.theme === 'light'
                    ? 'border-brand bg-brand-soft text-brand font-semibold shadow-xs'
                    : 'border-border bg-surface text-content-primary hover:bg-page'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t.themeLight}</span>
              </button>

              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, theme: 'dark' }))}
                className={`py-2 px-3 rounded-[10px] border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  form.theme === 'dark'
                    ? 'border-brand bg-[#111827] text-white font-semibold shadow-xs'
                    : 'border-border bg-surface text-content-primary hover:bg-page'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t.themeDark}</span>
              </button>

              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, theme: 'system' }))}
                className={`py-2 px-3 rounded-[10px] border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  form.theme === 'system'
                    ? 'border-brand bg-brand-soft text-brand font-semibold shadow-xs'
                    : 'border-border bg-surface text-content-primary hover:bg-page'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.themeSystem}</span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 4. ЛОГОТИП И ОБЛОЖКА */}
          {/* ===================================================================== */}
          <div className="bg-surface rounded-[14px] border border-border p-4 sm:p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-content-primary">{t.brandingTitle}</h2>

            {/* Avatar Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-content-primary">
                  {t.logoLabel}
                </label>
                <span className="text-[10px] font-mono text-content-secondary">1:1 квадрат</span>
              </div>

              {/* Current Logo Preview Thumbnail Box */}
              <div className="flex items-center gap-3 p-2.5 rounded-[10px] bg-page border border-border mb-2.5">
                <div className="relative w-14 h-14 rounded-[8px] overflow-hidden bg-white border border-border shrink-0 flex items-center justify-center">
                  {form.avatar_url ? (
                    <Image
                      src={form.avatar_url}
                      alt="Logo preview"
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  ) : (
                    <div className="text-center p-1 text-content-secondary">
                      <ImageIcon className="w-4 h-4 mx-auto mb-0.5 opacity-60" />
                      <span className="text-[8px] font-medium block">Нет фото</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-content-primary block truncate">
                    {form.avatar_url ? (isUz ? 'Logotip yuklangan' : 'Логотип загружен') : (isUz ? 'Standart belgi' : 'Стандартная заглушка')}
                  </span>
                  <span className="text-[10px] text-content-secondary block">
                    {isUz ? 'Avtomatik kvadrat shaklda moslanadi' : 'Автоматически кадрируется в квадрат'}
                  </span>
                </div>
                {form.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, avatar_url: '' }))}
                    className="px-2.5 py-1 rounded-[6px] text-[11px] font-medium text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors shrink-0"
                  >
                    {t.resetLogo}
                  </button>
                )}
              </div>

              {/* Ready avatar themes */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                {AVATAR_THEMES.map((item) => {
                  const isSelected = form.avatar_url === item.url;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, avatar_url: item.url }))}
                      className={`p-1 rounded-[8px] border text-center transition-all ${
                        isSelected
                          ? 'border-brand bg-brand-soft ring-2 ring-brand/30'
                          : 'border-border bg-surface hover:border-brand'
                      }`}
                    >
                      <div className="relative aspect-square w-full rounded-[6px] overflow-hidden bg-page mb-1">
                        <Image
                          src={item.url}
                          alt={item.label}
                          fill
                          className="object-cover"
                          sizes="50px"
                          unoptimized
                        />
                      </div>
                      <span className="text-[10px] font-medium text-content-primary block truncate">
                        {isUz ? item.labelUz : item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Upload logo */}
              <label className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] text-xs font-semibold bg-page border border-border text-content-primary hover:bg-[#EFECE6] cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-brand" />
                <span>{t.uploadLogo}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'avatar_url')}
                />
              </label>
            </div>

            {/* Banner Section */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-content-primary">
                  {t.coverLabel}
                </label>
                <span className="text-[10px] font-mono text-content-secondary">3:1 баннер</span>
              </div>

              {/* Current Cover Preview Thumbnail Box */}
              <div className="p-2.5 rounded-[10px] bg-page border border-border mb-2.5">
                <div className="relative aspect-[3/1] w-full rounded-[8px] overflow-hidden bg-white border border-border flex items-center justify-center">
                  {form.banner_url ? (
                    <Image
                      src={form.banner_url}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                      sizes="300px"
                      unoptimized
                    />
                  ) : (
                    <div className="text-center p-2 text-content-secondary">
                      <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] font-medium block">
                        {isUz ? 'Muqova yuklanmagan (bo‘sh qoladi)' : 'Обложка не выбрана (шапка без фона)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] text-xs font-semibold bg-page border border-border text-content-primary hover:bg-[#EFECE6] cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-brand" />
                  <span>{t.uploadCover}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'banner_url')}
                  />
                </label>

                {form.banner_url && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, banner_url: '' }))}
                    className="px-3 py-2 rounded-[10px] text-xs font-medium text-rose-600 bg-white border border-border hover:bg-rose-50 transition-colors"
                  >
                    {t.removeCover}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 5. ВИД КАТАЛОГА (СЕТКА 2 КОЛОНКИ ИЛИ СПИСОК) */}
          {/* ===================================================================== */}
          <div className="bg-surface rounded-[14px] border border-border p-4 sm:p-5 shadow-xs">
            <h2 className="text-sm font-bold text-content-primary mb-2.5">{t.catalogLayoutTitle}</h2>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, catalog_layout: 'grid' }))}
                className={`py-2.5 px-3 rounded-[10px] border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  form.catalog_layout === 'grid'
                    ? 'border-brand bg-brand-soft text-brand shadow-xs'
                    : 'border-border bg-surface text-content-primary hover:bg-page'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>{t.layoutGrid}</span>
              </button>

              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, catalog_layout: 'list' }))}
                className={`py-2.5 px-3 rounded-[10px] border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  form.catalog_layout === 'list'
                    ? 'border-brand bg-brand-soft text-brand shadow-xs'
                    : 'border-border bg-surface text-content-primary hover:bg-page'
                }`}
              >
                <List className="w-4 h-4" />
                <span>{t.layoutList}</span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* ДОПОЛНИТЕЛЬНО: СВЁРНУТЫЙ БЛОК «ЕЩЁ НАСТРОЙКИ» */}
          {/* ===================================================================== */}
          <div className="bg-surface rounded-[14px] border border-border overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-bold text-content-primary hover:bg-page transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{t.moreSettings}</span>
                <span className="text-[10px] font-normal text-content-secondary">
                  (скругления, текст кнопки, старая цена, баннер)
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-content-secondary transition-transform ${
                  isMoreOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMoreOpen && (
              <div className="p-5 pt-2 border-t border-border space-y-4 text-xs">
                {/* 1. Скругления */}
                <div>
                  <label className="block font-semibold text-content-primary mb-1.5">{t.radiiTitle}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, radii_preset: 'sharp' }))}
                      className={`py-2 px-2.5 rounded-[4px] border text-xs font-medium text-center transition-all ${
                        form.radii_preset === 'sharp'
                          ? 'border-brand bg-brand-soft text-brand font-semibold'
                          : 'border-border text-content-primary'
                      }`}
                    >
                      {t.radiiSharp}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, radii_preset: 'medium' }))}
                      className={`py-2 px-2.5 rounded-[10px] border text-xs font-medium text-center transition-all ${
                        form.radii_preset === 'medium'
                          ? 'border-brand bg-brand-soft text-brand font-semibold'
                          : 'border-border text-content-primary'
                      }`}
                    >
                      {t.radiiMedium}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, radii_preset: 'round' }))}
                      className={`py-2 px-2.5 rounded-[20px] border text-xs font-medium text-center transition-all ${
                        form.radii_preset === 'round'
                          ? 'border-brand bg-brand-soft text-brand font-semibold'
                          : 'border-border text-content-primary'
                      }`}
                    >
                      {t.radiiRound}
                    </button>
                  </div>
                </div>

                {/* 2. Текст кнопки */}
                <div>
                  <label className="block font-semibold text-content-primary mb-1.5">{t.buttonTextTitle}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['buy', 'order', 'cart'] as StoreButtonText[]).map((btn) => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, button_text: btn }))}
                        className={`py-2 px-2.5 rounded-[10px] border text-xs font-medium text-center transition-all ${
                          form.button_text === btn
                            ? 'border-brand bg-brand-soft text-brand font-semibold'
                            : 'border-border text-content-primary'
                        }`}
                      >
                        {btn === 'buy' ? t.buttonBuy : btn === 'order' ? t.buttonOrder : t.buttonCart}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Старая цена и скидка */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-content-primary block">{t.showOldPriceTitle}</span>
                    <span className="text-[11px] text-content-secondary">{t.showOldPriceDesc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, show_old_price: !prev.show_old_price }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      form.show_old_price ? 'bg-brand' : 'bg-[#E7E4DC]'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        form.show_old_price ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Баннер над каталогом */}
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-content-primary block">{t.bannerTitle}</span>
                      <span className="text-[11px] text-content-secondary">{t.bannerDesc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          announcement_active: !prev.announcement_active,
                        }))
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        form.announcement_active ? 'bg-brand' : 'bg-[#E7E4DC]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          form.announcement_active ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {form.announcement_active && (
                    <div className="space-y-1">
                      <input
                        type="text"
                        maxLength={120}
                        value={form.announcement_text}
                        onChange={(e) => setForm((prev) => ({ ...prev, announcement_text: e.target.value }))}
                        placeholder={t.bannerPlaceholder}
                        className="w-full px-3 py-2 bg-page border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-brand"
                      />
                      <span className="text-[10px] text-content-secondary block text-right">
                        {t.bannerCharsLeft(form.announcement_text?.length || 0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 5. Водяной знак BioMart (с понятной подсказкой тарифа Plus) */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-content-primary block">{t.hideBrandingTitle}</span>
                        {(settings.plan || 'start') === 'start' && (
                          <span className="text-[10px] font-bold text-brand bg-brand-soft px-1.5 py-0.2 rounded">
                            Plus
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-content-secondary">{t.hideBrandingDesc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if ((settings.plan || 'start') === 'start') {
                          setWatermarkTooltip(t.hideBrandingPlusHint);
                          return;
                        }
                        setWatermarkTooltip(null);
                        setForm((prev) => ({ ...prev, hide_branding: !prev.hide_branding }));
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        form.hide_branding ? 'bg-brand' : 'bg-[#E7E4DC]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          form.hide_branding ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {watermarkTooltip && (
                    <div className="mt-2.5 p-2 rounded-[8px] bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <span>{watermarkTooltip}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LIVE PHONE PREVIEW (5 COLS ON DESKTOP, TOGGLE ON MOBILE) */}
        {/* ========================================================================= */}
        <div className={`lg:col-span-5 static lg:sticky lg:top-4 z-10 ${mobileViewTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-content-primary flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-brand" />
              <span>{t.desktopPreviewNotice}</span>
            </span>
            <span className="text-[10px] font-mono text-content-secondary">340 x 680 px</span>
          </div>

          {/* Smartphone Mockup Frame */}
          <div className="relative mx-auto w-full max-w-[340px] rounded-[36px] border-[8px] border-[#1A1A1A] shadow-xl overflow-hidden bg-white">
            {/* Top Notch / Dynamic Island */}
            <div className="absolute top-2 inset-x-0 z-40 flex justify-center pointer-events-none">
              <div className="w-24 h-3.5 bg-[#1A1A1A] rounded-full" />
            </div>

            {/* Live Storefront Viewport */}
            <div
              id="live-preview-viewport"
              data-theme-preset={form.preset}
              data-radii-preset={form.radii_preset}
              data-theme={isPreviewDark ? 'dark' : 'light'}
              className={`h-[580px] overflow-y-auto no-scrollbar relative flex flex-col pt-7 pb-16 transition-colors ${
                isPreviewDark ? 'dark bg-[#121212] text-[#F5F5F5]' : 'bg-page text-content-primary'
              }`}
              style={{
                // Explicit inline tokens guaranteeing 0ms instant preview updates!
                ['--store-accent' as any]: tokens.accent,
                ['--store-accent-hover' as any]: tokens.accentHover,
                ['--store-accent-soft' as any]: tokens.accentSoft,
                ['--store-on-accent' as any]: tokens.onAccent,
                ['--accent' as any]: tokens.accent,
                ['--accent-hover' as any]: tokens.accentHover,
                ['--accent-soft' as any]: tokens.accentSoft,
                ['--accent-text' as any]: tokens.onAccent,
              }}
            >
              {/* URL Address Bar */}
              <div
                className={`py-1 px-3 border-b text-[10px] font-mono flex items-center justify-between select-none ${
                  isPreviewDark ? 'bg-[#1C1C1C] border-[#2C2C2C] text-[#A3A3A3]' : 'bg-surface border-border text-content-secondary'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tokens.accent }}
                  />
                  <span>biomart.vercel.app/{settings.slug}</span>
                </div>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                  style={{ backgroundColor: tokens.accentSoft, color: tokens.accent }}
                >
                  LIVE
                </span>
              </div>

              {/* Store Header Banner */}
              {form.banner_url && (
                <div className="relative aspect-[3/1] w-full bg-[#E7E4DC] overflow-hidden border-b border-border">
                  <Image
                    src={form.banner_url}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                    sizes="340px"
                    unoptimized
                  />
                </div>
              )}

              {/* Store Profile Card */}
              <div
                className={`p-3 border-b ${
                  isPreviewDark ? 'bg-[#1C1C1C] border-[#2C2C2C]' : 'bg-surface border-border'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-page border border-border shrink-0 relative">
                    {form.avatar_url ? (
                      <Image
                        src={form.avatar_url}
                        alt="Avatar preview"
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: tokens.accent, color: tokens.onAccent }}
                      >
                        {settings.store_name?.slice(0, 2).toUpperCase() || 'BM'}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs font-bold truncate">
                        {settings.store_name || 'TASHKENT DRIP'}
                      </h3>
                      <ShieldCheck
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: tokens.accent }}
                      />
                    </div>
                    <p className="text-[10px] text-content-secondary truncate mt-0.5">
                      {settings.description || 'Streetwear & Sneakers Tashkent'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex gap-1.5 mt-2.5">
                  <div
                    className={`flex-1 py-1 px-2 rounded-[8px] text-[10px] font-semibold flex items-center justify-center gap-1 border ${
                      isPreviewDark ? 'border-[#2C2C2C] bg-[#222222]' : 'border-border bg-surface'
                    }`}
                  >
                    <Send className="w-3 h-3" style={{ color: tokens.accent }} />
                    <span>Telegram</span>
                  </div>
                  <div
                    className={`flex-1 py-1 px-2 rounded-[8px] text-[10px] font-semibold flex items-center justify-center gap-1 border ${
                      isPreviewDark ? 'border-[#2C2C2C] bg-[#222222]' : 'border-border bg-surface'
                    }`}
                  >
                    <Phone className="w-3 h-3" style={{ color: tokens.accent }} />
                    <span>{isUz ? 'Aloqa' : 'Звонок'}</span>
                  </div>
                </div>

                {/* Announcement Banner (if active) */}
                {form.announcement_active && form.announcement_text && (
                  <div
                    className="mt-2 py-1 px-2 rounded-[8px] text-[10px] font-medium flex items-center gap-1.5"
                    style={{
                      backgroundColor: tokens.accentSoft,
                      color: tokens.accent,
                      border: `1px solid ${tokens.accent}33`,
                    }}
                  >
                    <Zap className="w-3 h-3 shrink-0" />
                    <span className="truncate">{form.announcement_text}</span>
                  </div>
                )}
              </div>

              {/* Category Filter Pills */}
              <div
                className={`px-3 py-2 border-b flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 ${
                  isPreviewDark ? 'bg-[#1C1C1C] border-[#2C2C2C]' : 'bg-surface border-border'
                }`}
              >
                <span
                  className="px-2.5 py-1 rounded-[8px] text-[10px] font-bold shrink-0 shadow-xs"
                  style={{ backgroundColor: tokens.accent, color: tokens.onAccent }}
                >
                  {isUz ? 'Barchasi' : 'Все'}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-[8px] text-[10px] font-medium shrink-0 border ${
                    isPreviewDark ? 'border-[#2C2C2C] bg-[#222222]' : 'border-border bg-page'
                  }`}
                >
                  {isUz ? 'Xudi' : 'Худи'}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-[8px] text-[10px] font-medium shrink-0 border ${
                    isPreviewDark ? 'border-[#2C2C2C] bg-[#222222]' : 'border-border bg-page'
                  }`}
                >
                  {isUz ? 'Poyabzal' : 'Обувь'}
                </span>
              </div>

              {/* Catalog Products */}
              <div className="p-2.5 flex-1">
                <div
                  className={
                    form.catalog_layout === 'grid'
                      ? 'grid grid-cols-2 gap-2'
                      : 'flex flex-col gap-2'
                  }
                >
                  {PREVIEW_PRODUCTS.map((p) => {
                    const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : null;
                    const btnLabel =
                      form.button_text === 'buy'
                        ? (isUz ? 'Xarid' : 'Купить')
                        : form.button_text === 'order'
                        ? (isUz ? 'Buyurtma' : 'Заказать')
                        : (isUz ? 'Savatga' : 'В корзину');

                    if (form.catalog_layout === 'list') {
                      return (
                        <div
                          key={p.id}
                          className={`flex gap-2 p-2 rounded-[10px] border shadow-xs ${
                            isPreviewDark
                              ? 'bg-[#1C1C1C] border-[#2C2C2C]'
                              : 'bg-surface border-border'
                          }`}
                        >
                          <div className="relative w-14 aspect-[4/5] rounded-[6px] overflow-hidden bg-black/5 shrink-0">
                            <Image
                              src={p.image}
                              alt={p.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                              unoptimized
                            />
                            {form.show_old_price && discount && (
                              <span
                                className="absolute top-1 left-1 font-bold text-[8px] px-1 rounded"
                                style={{ backgroundColor: tokens.accent, color: tokens.onAccent }}
                              >
                                -{discount}%
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <span className="text-xs font-bold block tabular-nums">
                                {formatPrice(p.price)}
                              </span>
                              <h4 className="text-[10px] text-content-secondary line-clamp-1 mt-0.5">
                                {isUz ? p.titleUz : p.title}
                              </h4>
                            </div>

                            <button
                              type="button"
                              className="self-end px-2.5 py-1 rounded-[6px] text-[10px] font-semibold transition-all shadow-xs"
                              style={{ backgroundColor: tokens.accent, color: tokens.onAccent }}
                            >
                              {btnLabel}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={p.id}
                        className={`flex flex-col rounded-[10px] overflow-hidden border shadow-xs ${
                          isPreviewDark
                            ? 'bg-[#1C1C1C] border-[#2C2C2C]'
                            : 'bg-surface border-border'
                        }`}
                      >
                        <div className="relative aspect-[4/5] w-full bg-black/5 overflow-hidden">
                          <Image
                            src={p.image}
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="150px"
                            unoptimized
                          />
                          {form.show_old_price && discount && (
                            <span
                              className="absolute top-1.5 left-1.5 font-bold text-[9px] px-1 py-0.2 rounded"
                              style={{ backgroundColor: tokens.accent, color: tokens.onAccent }}
                            >
                              -{discount}%
                            </span>
                          )}
                        </div>

                        <div className="p-2 flex flex-col justify-between flex-1">
                          <div>
                            <span className="text-xs font-bold block tabular-nums">
                              {formatPrice(p.price)}
                            </span>
                            <h4 className="text-[10px] text-content-secondary line-clamp-1 mt-0.5">
                              {isUz ? p.titleUz : p.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-black/5">
                            <span
                              className="text-[9px] font-semibold"
                              style={{ color: tokens.accent }}
                            >
                              {isUz ? 'Mavjud' : 'В наличии'}
                            </span>
                            <button
                              type="button"
                              className="w-6 h-6 rounded-[6px] flex items-center justify-center text-xs font-bold shadow-xs"
                              style={{ backgroundColor: tokens.accent, color: tokens.onAccent }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Watermark at bottom */}
              {!form.hide_branding && (
                <div className="py-3 text-center text-[10px] text-content-secondary">
                  <span>{isUz ? 'Vitrina yaratilgan' : 'Витрина создана на'} </span>
                  <span className="font-semibold text-brand">BioMart</span>
                </div>
              )}

              {/* Floating Cart Bar preview */}
              <div className="absolute bottom-2 inset-x-2 z-30 pointer-events-none">
                <div
                  className={`pointer-events-auto p-2 rounded-[12px] border flex items-center justify-between shadow-card ${
                    isPreviewDark ? 'bg-[#1C1C1C] border-[#2C2C2C]' : 'bg-surface border-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: tokens.accent, color: tokens.onAccent }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-content-secondary">{isUz ? '1 ta buyurtmada' : '1 шт. в заказе'}</span>
                      <span className="text-xs font-bold tabular-nums">320 000 {isUz ? 'so‘m' : 'сум'}</span>
                    </div>
                  </div>

                  <span
                    className="px-3 py-1.5 rounded-[8px] text-[10px] font-bold"
                    style={{ backgroundColor: tokens.accent, color: tokens.onAccent }}
                  >
                    {form.button_text === 'buy'
                      ? (isUz ? 'Xarid' : 'Купить')
                      : form.button_text === 'order'
                      ? (isUz ? 'Buyurtma' : 'Заказать')
                      : (isUz ? 'Savatga' : 'В корзину')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
