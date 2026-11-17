import { NextRequest, NextResponse } from 'next/server';
import { verifySellerOwnership } from '@/lib/seller-auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeSlug = (searchParams.get('store_slug') || searchParams.get('slug') || '').toLowerCase().trim();

    if (!storeSlug) {
      return NextResponse.json({ error: 'Store slug is required' }, { status: 400 });
    }

    // 1. Strict Server-Side Authentication & Store Ownership Verification
    const auth = await verifySellerOwnership(req, storeSlug);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || 'Доступ запрещён: требуется авторизация владельца магазина' },
        { status: 401 }
      );
    }

    // Days parameter: 7 or 30 (default 7)
    const rawDays = parseInt(searchParams.get('days') || '7', 10);
    const days = rawDays === 30 ? 30 : 7;

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().split('T')[0];

    let storeId = auth.storeId;
    let statsRows: any[] = [];
    let topProducts: any[] = [];

    if (isSupabaseConfigured && supabaseAdmin) {
      if (!storeId) {
        const { data: store } = await supabaseAdmin
          .from('stores')
          .select('id')
          .eq('slug', storeSlug)
          .maybeSingle();
        if (store?.id) storeId = store.id;
      }

      if (storeId) {
        // Query daily stats within date range
        const { data: rows } = await supabaseAdmin
          .from('store_daily_stats')
          .select('*')
          .eq('store_id', storeId)
          .gte('stat_date', startDateStr)
          .order('stat_date', { ascending: true });

        statsRows = rows || [];

        // Query top 5 most viewed products
        const { data: products } = await supabaseAdmin
          .from('products')
          .select('id, title, price, images, views_count, in_stock')
          .eq('store_id', storeId)
          .order('views_count', { ascending: false })
          .limit(5);

        topProducts = products || [];
      }
    }

    // In-memory fallback if mock stats exist for this store
    const globalRef = globalThis as unknown as { __biomart_mock_stats?: Record<string, any> };
    if (statsRows.length === 0 && globalRef.__biomart_mock_stats) {
      const mockEntries = Object.entries(globalRef.__biomart_mock_stats)
        .filter(([key]) => key.startsWith(`${storeSlug}_`))
        .map(([key, val]) => {
          const date = key.replace(`${storeSlug}_`, '');
          return { stat_date: date, ...val };
        })
        .filter((entry) => entry.stat_date >= startDateStr);
      if (mockEntries.length > 0) {
        statsRows = mockEntries;
      }
    }

    // Index rows by date for fast lookup
    const trendMap = new Map<string, any>();
    statsRows.forEach((r) => trendMap.set(r.stat_date, r));

    let totalViews = 0;
    let totalUnique = 0;
    let totalClicks = 0;
    let totalOrders = 0;
    let totalRevenue = 0;
    let srcIg = 0;
    let srcTg = 0;
    let srcDirect = 0;
    let srcOther = 0;

    statsRows.forEach((r) => {
      totalViews += Number(r.views || 0);
      totalUnique += Number(r.unique_visitors || 0);
      totalClicks += Number(r.product_clicks || 0);
      totalOrders += Number(r.orders_count || 0);
      totalRevenue += Number(r.orders_revenue || 0);
      srcIg += Number(r.source_instagram || 0);
      srcTg += Number(r.source_telegram || 0);
      srcDirect += Number(r.source_direct || 0);
      srcOther += Number(r.source_other || 0);
    });

    // Build continuous chronological daily trend array
    const dailyTrend = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const r = trendMap.get(dateStr);

      dailyTrend.push({
        date: dateStr,
        views: r ? Number(r.views || 0) : 0,
        unique_visitors: r ? Number(r.unique_visitors || 0) : 0,
        product_clicks: r ? Number(r.product_clicks || 0) : 0,
        orders_count: r ? Number(r.orders_count || 0) : 0,
        orders_revenue: r ? Number(r.orders_revenue || 0) : 0,
      });
    }

    // If zero traffic registered yet, set fallback direct to avoid empty source breakdown
    if (srcIg === 0 && srcTg === 0 && srcDirect === 0 && srcOther === 0 && totalViews > 0) {
      srcDirect = totalViews;
    }

    const conversionRate = totalUnique > 0 ? (totalOrders / totalUnique) * 100 : 0;

    return NextResponse.json({
      success: true,
      store_slug: storeSlug,
      days,
      summary: {
        views: totalViews,
        unique_visitors: totalUnique,
        product_clicks: totalClicks,
        orders_count: totalOrders,
        orders_revenue: totalRevenue,
        conversion_rate: Number(conversionRate.toFixed(1)),
      },
      sources: {
        instagram: srcIg,
        telegram: srcTg,
        direct: srcDirect,
        other: srcOther,
      },
      daily_trend: dailyTrend,
      top_products: topProducts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch seller analytics' },
      { status: 500 }
    );
  }
}
