import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/seller-auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getAllRegisteredStores } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Strict Server-Side Superadmin Authentication
    if (!verifyAdminRequest(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется авторизация супер-администратора платформы' },
        { status: 401 }
      );
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().split('T')[0];

    const d30 = new Date();
    d30.setDate(d30.getDate() - 30);
    const d30Str = d30.toISOString().split('T')[0];

    let allStores: any[] = [];
    let allProducts: any[] = [];
    let allOrders: any[] = [];
    let allStats: any[] = [];

    if (isSupabaseConfigured && supabaseAdmin) {
      // Fetch all stores
      const { data: stores } = await supabaseAdmin
        .from('stores')
        .select('id, slug, store_name, phone, telegram_username, plan, created_at');
      if (stores) allStores = stores;

      // Fetch products count grouping
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, store_id, views_count');
      if (products) allProducts = products;

      // Fetch orders
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('id, store_id, total_price, created_at');
      if (orders) allOrders = orders;

      // Fetch daily stats
      const { data: stats } = await supabaseAdmin
        .from('store_daily_stats')
        .select('store_id, stat_date, views, orders_count, orders_revenue');
      if (stats) allStats = stats;
    }

    // Merge registered stores from file if Supabase is offline or empty
    if (allStores.length === 0) {
      const fileStores = getAllRegisteredStores();
      allStores = Object.values(fileStores).map((s: any) => ({
        id: s.slug,
        slug: s.slug,
        store_name: s.store_name || s.slug,
        phone: s.phone,
        telegram_username: s.telegram_username,
        plan: s.plan || 'start',
        created_at: s.registered_at || new Date().toISOString(),
      }));

      // Fallback demo stores if file is also empty
      if (allStores.length === 0) {
        allStores = [
          { id: '1', slug: 'tashkent_drip', store_name: 'TASHKENT DRIP', phone: '+998901234567', telegram_username: 'tashkent_drip', plan: 'pro', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
          { id: '2', slug: 'samarkand_sweets', store_name: 'Samarkand Sweets', phone: '+998911112233', telegram_username: 'samarkand_sweets', plan: 'plus', created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
          { id: '3', slug: 'volt_gadgets', store_name: 'Volt Gadgets', phone: '+998935557788', telegram_username: 'volt_admin', plan: 'start', created_at: new Date(Date.now() - 13 * 86400000).toISOString() },
          { id: '4', slug: 'aura_perfume', store_name: 'Aura Perfume', phone: '+998974443322', telegram_username: 'aura_uz', plan: 'start', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
        ];
      }
    }

    // Map products count per store
    const storeProductCounts: Record<string, number> = {};
    const storeProductViews: Record<string, number> = {};
    allProducts.forEach((p) => {
      const sid = String(p.store_id || '');
      storeProductCounts[sid] = (storeProductCounts[sid] || 0) + 1;
      storeProductViews[sid] = (storeProductViews[sid] || 0) + Number(p.views_count || 0);
    });

    // 2. Compute Store Metrics
    let activeStoresCount = 0;
    let stuckStoresCount = 0;
    let newStoresToday = 0;
    let newStores7d = 0;
    let newStores30d = 0;

    let subFreeOrTrial = 0;
    let subPlus = 0;
    let subPro = 0;

    const trialsExpiringSoon: any[] = [];

    allStores.forEach((st) => {
      const pCount = storeProductCounts[st.id] || storeProductCounts[st.slug] || 0;
      if (pCount > 0) {
        activeStoresCount += 1;
      } else {
        stuckStoresCount += 1;
      }

      const createdAtStr = st.created_at ? st.created_at.split('T')[0] : '';
      if (createdAtStr === todayStr) newStoresToday += 1;
      if (createdAtStr >= d7Str) newStores7d += 1;
      if (createdAtStr >= d30Str) newStores30d += 1;

      // Subscriptions
      const plan = (st.plan || 'start').toLowerCase();
      if (plan === 'pro') subPro += 1;
      else if (plan === 'plus') subPlus += 1;
      else subFreeOrTrial += 1;

      // Trial expiration calculation (standard 14 days trial for 'start' tier)
      if (plan === 'start' && st.created_at) {
        const createdTime = new Date(st.created_at).getTime();
        const daysPassed = Math.floor((now.getTime() - createdTime) / (24 * 3600 * 1000));
        // Flag trials with 1, 2, or 3 days left (day 11 to 14)
        if (daysPassed >= 11 && daysPassed <= 14) {
          const daysLeft = Math.max(1, 14 - daysPassed);
          const rawPhone = String(st.phone || '').replace(/\D/g, '');
          const rawTg = String(st.telegram_username || '').replace(/^@/, '');

          trialsExpiringSoon.push({
            slug: st.slug,
            store_name: st.store_name || st.slug,
            days_left: daysLeft,
            phone: st.phone || null,
            phone_link: rawPhone ? `tel:+${rawPhone}` : null,
            telegram_username: rawTg || null,
            telegram_link: rawTg ? `https://t.me/${rawTg}` : null,
            created_at: st.created_at,
          });
        }
      }
    });

    // 3. Compute Traffic & GMV Metrics
    let gmvTotal = 0;
    let gmvToday = 0;
    let gmv7d = 0;
    let gmv30d = 0;

    let ordersTotal = 0;
    let ordersToday = 0;
    let orders7d = 0;
    let orders30d = 0;

    allOrders.forEach((ord) => {
      const amount = Number(ord.total_price || 0);
      const createdStr = ord.created_at ? ord.created_at.split('T')[0] : '';

      gmvTotal += amount;
      ordersTotal += 1;

      if (createdStr === todayStr) {
        gmvToday += amount;
        ordersToday += 1;
      }
      if (createdStr >= d7Str) {
        gmv7d += amount;
        orders7d += 1;
      }
      if (createdStr >= d30Str) {
        gmv30d += amount;
        orders30d += 1;
      }
    });

    let viewsTotal = 0;
    let viewsToday = 0;
    let views7d = 0;
    let views30d = 0;

    const storeStatsSum: Record<string, { views: number; orders: number; revenue: number }> = {};

    allStats.forEach((s) => {
      const v = Number(s.views || 0);
      const o = Number(s.orders_count || 0);
      const rev = Number(s.orders_revenue || 0);
      const sDate = s.stat_date || '';

      viewsTotal += v;
      if (sDate === todayStr) viewsToday += v;
      if (sDate >= d7Str) views7d += v;
      if (sDate >= d30Str) views30d += v;

      const sid = String(s.store_id);
      if (!storeStatsSum[sid]) {
        storeStatsSum[sid] = { views: 0, orders: 0, revenue: 0 };
      }
      storeStatsSum[sid].views += v;
      storeStatsSum[sid].orders += o;
      storeStatsSum[sid].revenue += rev;
    });

    // 4. Leaderboard (Top 10 stores)
    const leaderboard = allStores.map((st) => {
      const stat = storeStatsSum[st.id] || storeStatsSum[st.slug] || { views: 0, orders: 0, revenue: 0 };
      const productViews = storeProductViews[st.id] || storeProductViews[st.slug] || 0;
      const totalStoreViews = Math.max(stat.views, productViews);
      const pCount = storeProductCounts[st.id] || storeProductCounts[st.slug] || 0;

      return {
        id: st.id,
        slug: st.slug,
        store_name: st.store_name || st.slug,
        views: totalStoreViews,
        orders_count: stat.orders,
        revenue: stat.revenue,
        products_count: pCount,
        plan: st.plan || 'start',
      };
    });

    leaderboard.sort((a, b) => b.views - a.views || b.orders_count - a.orders_count);
    const top10Leaderboard = leaderboard.slice(0, 10);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      stores: {
        total: allStores.length,
        active: activeStoresCount,
        stuck: stuckStoresCount,
        new_today: newStoresToday,
        new_7d: newStores7d,
        new_30d: newStores30d,
      },
      subscriptions: {
        free_or_trial: subFreeOrTrial,
        plus: subPlus,
        pro: subPro,
        trials_expiring_soon: trialsExpiringSoon,
      },
      traffic_and_gmv: {
        gmv_total: gmvTotal,
        gmv_today: gmvToday,
        gmv_7d: gmv7d,
        gmv_30d: gmv30d,
        orders_total: ordersTotal,
        orders_today: ordersToday,
        orders_7d: orders7d,
        orders_30d: orders30d,
        views_total: viewsTotal,
        views_today: viewsToday,
        views_7d: views7d,
        views_30d: views30d,
      },
      leaderboard: top10Leaderboard,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch platform analytics' },
      { status: 500 }
    );
  }
}
