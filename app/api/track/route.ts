import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// Common bots, web crawlers, search engines, and social link preview scrapers
const BOT_REGEX = /bot|crawler|spider|telegrambot|facebookexternalhit|instagram|whatsapp|preview|headless|curl|python|wget|postman|slurp|duckduckbot/i;

// Cache slug -> storeId for 10 minutes to minimize DB queries
const storeIdCache = new Map<string, { id: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

    // 1. Bot & Link-Preview Filtering: drop crawlers without wasting database writes
    if (BOT_REGEX.test(userAgent)) {
      return NextResponse.json({ success: true, filtered: 'bot' });
    }

    const clientIp = getClientIp(request);

    // 2. Rate-limiting by IP: 120 tracking events per minute per IP
    const rateLimit = checkRateLimit(`track_${clientIp}`, 120, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      store_slug,
      store_id,
      event_type,
      source,
      is_unique,
      product_id,
      referrer,
    } = body;

    const validEvents = ['page_view', 'product_view', 'click'];
    if (!event_type || !validEvents.includes(event_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event_type' },
        { status: 400 }
      );
    }

    // 3. Traffic Source Detection
    let detectedSource: 'instagram' | 'telegram' | 'direct' | 'other' = 'direct';
    const rawSource = String(source || '').toLowerCase().trim();
    const rawRef = String(referrer || request.headers.get('referer') || '').toLowerCase().trim();

    if (rawSource === 'instagram' || rawSource === 'ig' || rawRef.includes('instagram.com')) {
      detectedSource = 'instagram';
    } else if (
      rawSource === 'telegram' ||
      rawSource === 'tg' ||
      rawRef.includes('t.me') ||
      rawRef.includes('telegram.org')
    ) {
      detectedSource = 'telegram';
    } else if (rawSource === 'direct') {
      detectedSource = 'direct';
    } else if (rawRef && !rawRef.includes(request.headers.get('host') || 'biomart')) {
      detectedSource = 'other';
    }

    // 4. Resolve Store ID
    let resolvedStoreId = store_id;
    const cleanSlug = String(store_slug || '').toLowerCase().trim();

    if (!resolvedStoreId && cleanSlug) {
      const cached = storeIdCache.get(cleanSlug);
      if (cached && Date.now() < cached.expiresAt) {
        resolvedStoreId = cached.id;
      } else if (isSupabaseConfigured && supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('stores')
          .select('id')
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (data?.id) {
          resolvedStoreId = data.id;
          storeIdCache.set(cleanSlug, { id: data.id, expiresAt: Date.now() + 10 * 60 * 1000 });
        }
      }
    }

    if (!resolvedStoreId) {
      return NextResponse.json({ success: true, warning: 'Store not found or demo mode' });
    }

    // 5. Atomic RPC Execution via Supabase
    if (isSupabaseConfigured && supabaseAdmin) {
      const { error: rpcErr } = await supabaseAdmin.rpc('record_store_event', {
        p_store_id: resolvedStoreId,
        p_event_type: event_type,
        p_source: detectedSource,
        p_is_unique: Boolean(is_unique),
        p_product_id: product_id || null,
        p_order_amount: 0,
      });

      if (rpcErr) {
        console.warn('[Analytics Track] RPC error:', rpcErr.message);
      }
    }

    // 6. In-memory local fallback for demo / test stores
    const globalRef = globalThis as unknown as {
      __biomart_mock_stats?: Record<string, any>;
    };
    if (!globalRef.__biomart_mock_stats) {
      globalRef.__biomart_mock_stats = {};
    }
    const today = new Date().toISOString().split('T')[0];
    const key = `${cleanSlug || resolvedStoreId}_${today}`;
    if (!globalRef.__biomart_mock_stats[key]) {
      globalRef.__biomart_mock_stats[key] = {
        views: 0,
        unique_visitors: 0,
        product_clicks: 0,
        orders_count: 0,
        orders_revenue: 0,
        source_instagram: 0,
        source_telegram: 0,
        source_direct: 0,
        source_other: 0,
      };
    }
    const cur = globalRef.__biomart_mock_stats[key];
    if (event_type === 'page_view') {
      cur.views += 1;
      if (is_unique) cur.unique_visitors += 1;
    } else if (event_type === 'product_view') {
      cur.views += 1;
      cur.product_clicks += 1;
    }
    if (detectedSource === 'instagram') cur.source_instagram += 1;
    else if (detectedSource === 'telegram') cur.source_telegram += 1;
    else if (detectedSource === 'direct') cur.source_direct += 1;
    else cur.source_other += 1;

    return NextResponse.json({ success: true, source: detectedSource });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Track error' },
      { status: 500 }
    );
  }
}
