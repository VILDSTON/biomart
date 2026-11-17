import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/seller-auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getAllRegisteredStores } from '@/lib/telegram';
import { SITE_DOMAIN } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let storesList: any[] = [];
    const productCounts: Record<string, number> = {};

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data: stores } = await supabaseAdmin
        .from('stores')
        .select('id, slug, store_name, phone, telegram_username, plan, is_verified, is_featured, created_at')
        .order('created_at', { ascending: false });

      if (stores) storesList = stores;

      const { data: products } = await supabaseAdmin
        .from('products')
        .select('store_id');

      if (products) {
        products.forEach((p) => {
          const sid = String(p.store_id || '');
          productCounts[sid] = (productCounts[sid] || 0) + 1;
        });
      }
    }

    // Fallback if Supabase empty
    if (storesList.length === 0) {
      const fileStores = getAllRegisteredStores();
      storesList = Object.values(fileStores).map((s: any) => ({
        id: s.slug,
        slug: s.slug,
        store_name: s.store_name || s.slug,
        phone: s.phone || '',
        telegram_username: s.telegram_username || '',
        plan: s.plan || 'start',
        is_verified: false,
        is_featured: false,
        created_at: s.registered_at || new Date().toISOString(),
      }));
    }

    // Generate CSV Rows with UTF-8 BOM for Microsoft Excel compatibility
    const headers = [
      'ID',
      'Название',
      'Slug',
      'Ссылка на витрину',
      'Телефон',
      'Telegram',
      'Тариф',
      'Товаров',
      'Верифицирован',
      'В кейсах',
      'Дата регистрации',
    ];

    const escapeCsv = (str: string | number | boolean | null | undefined): string => {
      const val = str === null || str === undefined ? '' : String(str);
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvRows = [headers.join(',')];

    storesList.forEach((store) => {
      const pCount = productCounts[store.id] || productCounts[store.slug] || 0;
      const storeUrl = `https://${SITE_DOMAIN}/${store.slug}`;
      const tgUsername = store.telegram_username ? `@${store.telegram_username.replace(/^@/, '')}` : '';

      const row = [
        escapeCsv(store.id),
        escapeCsv(store.store_name),
        escapeCsv(store.slug),
        escapeCsv(storeUrl),
        escapeCsv(store.phone),
        escapeCsv(tgUsername),
        escapeCsv(store.plan),
        escapeCsv(pCount),
        escapeCsv(store.is_verified ? 'Да' : 'Нет'),
        escapeCsv(store.is_featured ? 'Да' : 'Нет'),
        escapeCsv(store.created_at ? store.created_at.slice(0, 10) : ''),
      ];

      csvRows.push(row.join(','));
    });

    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const today = new Date().toISOString().split('T')[0];

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="biomart_stores_${today}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error exporting CSV' }, { status: 500 });
  }
}
