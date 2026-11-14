import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { AlertCircle } from 'lucide-react';
import { MOCK_STORE_SETTINGS, DEMO_PRESET_SHOPS } from '@/lib/mock-data';
import { computeStoreTokens, getEffectiveThemeSettings, ThemeSettings } from '@/lib/theme';
import { StoreSettings } from '@/types';
import { StorefrontClient, StorefrontSkeleton } from '@/components/StorefrontClient';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isSlugBanned } from '@/lib/moderation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const rawSlug = params?.slug || 'tashkent_drip';
  const cleanSlug = rawSlug.toLowerCase();

  if (cleanSlug === '404') {
    return {
      title: '404 — Страница не найдена | BioMart',
      description: 'Запрашиваемая страница не существует или магазин изменил адрес.',
      robots: { index: false, follow: true },
    };
  }

  const demoPreset = DEMO_PRESET_SHOPS[cleanSlug];
  const isDemoSlug = cleanSlug === 'tashkent_drip' || Boolean(demoPreset);

  // If not a demo store, check if store exists in DB or cookies
  if (!isDemoSlug) {
    let dbStoreName: string | null = null;
    let dbDesc: string | null = null;
    try {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        const { data } = await supabase
          .from('stores')
          .select('id, store_name, description')
          .eq('slug', cleanSlug)
          .maybeSingle();
        if (data) {
          dbStoreName = data.store_name;
          dbDesc = data.description;
        }
      }
    } catch {}

    let cookieStoreName: string | null = null;
    try {
      const cookieStore = cookies();
      const rawContacts = cookieStore.get(`biomart_contacts_${cleanSlug}`)?.value;
      if (rawContacts) {
        const parsed = JSON.parse(decodeURIComponent(rawContacts));
        cookieStoreName = parsed.store_name || null;
      }
    } catch {}

    const resolvedName = dbStoreName || cookieStoreName;
    if (!resolvedName) {
      return {
        title: '404 — Магазин не найден | BioMart',
        description: 'Запрашиваемый магазин не существует или изменил свой адрес.',
        robots: { index: false, follow: true },
      };
    }

    return {
      title: `${resolvedName} — Витрина товаров в Instagram и Telegram`,
      description: dbDesc || `Онлайн-витрина ${resolvedName} на платформе BioMart`,
      openGraph: {
        title: `${resolvedName} | BioMart`,
        description: dbDesc || `Онлайн-витрина ${resolvedName} на платформе BioMart`,
        url: `https://biomart.vercel.app/${cleanSlug}`,
        siteName: 'BioMart',
        type: 'website',
      },
    };
  }

  const storeName = demoPreset
    ? demoPreset.settings.store_name
    : (cleanSlug === 'tashkent_drip' ? MOCK_STORE_SETTINGS.store_name : cleanSlug.replace(/_/g, ' ').toUpperCase());
  const description = demoPreset
    ? demoPreset.settings.description
    : `Онлайн-витрина ${storeName} на платформе BioMart`;

  return {
    title: `${storeName} — Витрина товаров в Instagram и Telegram`,
    description,
    openGraph: {
      title: `${storeName} | BioMart`,
      description,
      url: `https://biomart.vercel.app/${cleanSlug}`,
      siteName: 'BioMart',
      type: 'website',
    },
  };
}

export default async function StorefrontSlugPage({ params, searchParams }: PageProps) {
  const rawSlug = params?.slug || 'tashkent_drip';
  const cleanSlug = rawSlug.toLowerCase();

  // 1. Check for cookie persistence across dashboard save & SSR
  let cookieTheme: Partial<ThemeSettings> | null = null;
  let cookieContacts: Partial<StoreSettings> | null = null;
  try {
    const cookieStore = cookies();
    const rawCookie = cookieStore.get(`biomart_theme_${cleanSlug}`)?.value;
    if (rawCookie) {
      cookieTheme = JSON.parse(decodeURIComponent(rawCookie));
    }
    const rawContacts = cookieStore.get(`biomart_contacts_${cleanSlug}`)?.value;
    if (rawContacts) {
      cookieContacts = JSON.parse(decodeURIComponent(rawContacts));
    }
  } catch {}

  // 2. Check for database persistence (Supabase) if configured
  let dbStore: any = null;
  let dbCategories: any[] | null = null;
  let dbProducts: any[] | null = null;
  try {
    const supabase = createSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();
      dbStore = data;

      if (dbStore?.id) {
        const [catsRes, prodsRes] = await Promise.all([
          supabase
            .from('categories')
            .select('*')
            .eq('store_id', dbStore.id)
            .order('sort_order', { ascending: true }),
          supabase
            .from('products')
            .select('*')
            .eq('store_id', dbStore.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
        ]);

        if (catsRes.data && catsRes.data.length > 0) {
          dbCategories = catsRes.data;
        }
        if (prodsRes.data && prodsRes.data.length > 0) {
          dbProducts = prodsRes.data;
        }
      }
    }
  } catch (err) {
    console.warn('Supabase fetch exception for slug:', cleanSlug, err);
  }

  const demoPreset = DEMO_PRESET_SHOPS[cleanSlug];
  const isDemoSlug = cleanSlug === 'tashkent_drip' || Boolean(demoPreset);
  const hasStore = Boolean(dbStore?.id || isDemoSlug || cookieContacts?.store_name || cookieTheme);

  // If this slug is not a known demo store, not in database, and not in merchant cookies: return 404
  if (cleanSlug === '404' || !hasStore) {
    notFound();
  }

  const fallbackSettings = demoPreset?.settings || MOCK_STORE_SETTINGS;

  // 3. Fallback to mock settings for demo store or new stores
  const storeSettings = {
    ...(dbStore || fallbackSettings),
    slug: cleanSlug,
    store_name:
      dbStore?.store_name ||
      cookieContacts?.store_name ||
      (demoPreset ? demoPreset.settings.store_name : cleanSlug.replace(/_/g, ' ').toUpperCase()),
    instagram_url: cookieContacts?.instagram_url ?? dbStore?.instagram_url ?? (isDemoSlug && demoPreset ? demoPreset.settings.instagram_url : (cleanSlug === 'tashkent_drip' ? fallbackSettings.instagram_url : '')),
    telegram_username: cookieContacts?.telegram_username ?? dbStore?.telegram_username ?? (isDemoSlug && demoPreset ? demoPreset.settings.telegram_username : (cleanSlug === 'tashkent_drip' ? fallbackSettings.telegram_username : '')),
    phone: cookieContacts?.phone ?? dbStore?.phone ?? (isDemoSlug && demoPreset ? demoPreset.settings.phone : (cleanSlug === 'tashkent_drip' ? fallbackSettings.phone : '')),
    custom_links: cookieContacts?.custom_links !== undefined ? cookieContacts.custom_links : (dbStore?.custom_links ?? (isDemoSlug ? fallbackSettings.custom_links ?? [] : [])),
  };

  // 4. Check moderation status: if banned or rejected, show polite unavailable screen
  if (storeSettings.status === 'rejected' || isSlugBanned(cleanSlug)) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F7F6F2] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1E1E1E] border border-[#E7E4DC] dark:border-[#2C2C2C] rounded-[20px] p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#E4F1EB] dark:bg-[#163629] text-[#1F7A5A] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Витрина временно недоступна
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B66] dark:text-[#A0A09A] leading-relaxed">
            Магазин находится на проверке безопасности модерацией платформы или временно приостановил приём заказов.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-[#1F7A5A] hover:bg-[#17634A] text-white text-xs font-semibold transition-colors"
            >
              На главную BioMart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Merge theme settings: Database -> Cookie -> Query Overrides
  const baseTheme = getEffectiveThemeSettings(
    {
      ...(storeSettings.theme_settings || {}),
      ...(cookieTheme || {}),
    },
    storeSettings
  );

  // URL query overrides for live testing and previewing
  const queryAccent = typeof searchParams?.accent === 'string'
    ? (searchParams.accent.startsWith('#') ? searchParams.accent : `#${searchParams.accent}`)
    : undefined;
  const queryTheme = (searchParams?.theme === 'dark' || searchParams?.theme === 'light') ? searchParams.theme : undefined;
  const queryPreset = typeof searchParams?.preset === 'string' ? (searchParams.preset as any) : undefined;

  const themeSettings: ThemeSettings = {
    ...baseTheme,
    accent_color: queryAccent || baseTheme.accent_color,
    theme: queryTheme || baseTheme.theme,
    preset: queryPreset || baseTheme.preset,
  };

  const isDarkInitial = themeSettings.theme === 'dark';
  const tokens = computeStoreTokens(themeSettings.accent_color, isDarkInitial);

  // Create unified effective store settings for client
  const effectiveStoreSettings = {
    ...storeSettings,
    accent_color: themeSettings.accent_color,
    theme: themeSettings.theme,
    catalog_layout: themeSettings.catalog_layout,
    avatar_url: themeSettings.avatar_url || storeSettings.avatar_url,
    banner_url: themeSettings.banner_url || storeSettings.banner_url,
    radii_preset: themeSettings.radii_preset,
    button_text: themeSettings.button_text,
    show_old_price: themeSettings.show_old_price,
    announcement_active: themeSettings.announcement_active,
    announcement_text: themeSettings.announcement_text,
    hide_branding: themeSettings.hide_branding,
    niche: themeSettings.niche || storeSettings.niche || 'clothing',
    show_trust_badges: themeSettings.show_trust_badges !== undefined ? themeSettings.show_trust_badges : (storeSettings.show_trust_badges ?? true),
    custom_badges: themeSettings.custom_badges || storeSettings.custom_badges,
    show_reviews: themeSettings.show_reviews !== undefined ? themeSettings.show_reviews : (storeSettings.show_reviews ?? true),
    reviews: storeSettings.reviews,
    custom_links: storeSettings.custom_links || [],
    theme_settings: themeSettings,
  };

  return (
    <>
      {/* 
        CRITICAL SERVER-SIDE STYLE INJECTION (BUG 10 FIX):
        Injected directly into server HTML stream BEFORE hydration,
        guaranteeing zero flash of emerald or incorrect colors on first render!
        Rendered cleanly WITHOUT !important so client hydration and dynamic updates can cascade.
      */}
      <style
        id="server-store-theme"
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --store-accent: ${tokens.accent};
              --store-accent-hover: ${tokens.accentHover};
              --store-accent-soft: ${tokens.accentSoft};
              --store-on-accent: ${tokens.onAccent};
              --accent: ${tokens.accent};
              --accent-hover: ${tokens.accentHover};
              --accent-soft: ${tokens.accentSoft};
              --accent-text: ${tokens.onAccent};
            }
            #storefront-root {
              --store-accent: ${tokens.accent};
              --store-accent-hover: ${tokens.accentHover};
              --store-accent-soft: ${tokens.accentSoft};
              --store-on-accent: ${tokens.onAccent};
              --accent: ${tokens.accent};
              --accent-hover: ${tokens.accentHover};
              --accent-soft: ${tokens.accentSoft};
              --accent-text: ${tokens.onAccent};
            }
            #storefront-root ::selection {
              background-color: ${tokens.accent};
              color: ${tokens.onAccent};
            }
            #storefront-root h1,
            #storefront-root h2,
            #storefront-root h3,
            #storefront-root .store-heading {
              font-family: var(--font-heading, inherit);
            }
          `,
        }}
      />

      {/* Script executing synchronously before first paint to prevent dark/light theme flash */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var saved = localStorage.getItem('biomart_buyer_theme');
                var theme = saved || '${themeSettings.theme}';
                if (theme === 'system') {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch(e) {}
            })();
          `,
        }}
      />

      <React.Suspense fallback={<StorefrontSkeleton />}>
        <StorefrontClient
          initialSlug={cleanSlug}
          initialSettings={effectiveStoreSettings}
          initialCategories={dbCategories || demoPreset?.categories || undefined}
          initialProducts={dbProducts || demoPreset?.products || undefined}
          isDemo={Boolean(demoPreset)}
        />
      </React.Suspense>
    </>
  );
}
