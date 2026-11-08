import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { isSlugValid } from '@/lib/security';
import { validateStoreContent, isSlugBanned } from '@/lib/moderation';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug')?.toLowerCase();

  if (!slug) {
    return NextResponse.json({ error: 'Параметр slug обязателен' }, { status: 400 });
  }

  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: 'База данных не подключена (Demo Mode)' }, { status: 503 });
  }

  try {
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Магазин не найден' }, { status: 404 });
    }

    const [categoriesRes, productsRes, ordersRes] = await Promise.all([
      supabaseAdmin.from('categories').select('*').eq('store_id', store.id).order('sort_order', { ascending: true }),
      supabaseAdmin.from('products').select('*').eq('store_id', store.id).eq('is_active', true).order('created_at', { ascending: false }),
      supabaseAdmin.from('orders').select('*').eq('store_id', store.id).order('created_at', { ascending: false }).limit(50),
    ]);

    return NextResponse.json({
      store,
      categories: categoriesRes.data || [],
      products: productsRes.data || [],
      orders: ordersRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: 'База данных не подключена' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { slug, store_name, instagram_url, telegram_username, telegram_chat_id, phone, description } = body;

    const cleanSlug = slug?.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanSlug || !isSlugValid(cleanSlug)) {
      return NextResponse.json({ error: 'Недопустимый адрес витрины' }, { status: 400 });
    }

    if (isSlugBanned(cleanSlug)) {
      return NextResponse.json({ error: 'Этот адрес заблокирован администрацией платформы' }, { status: 403 });
    }

    const modCheck = validateStoreContent({ store_name, slug: cleanSlug, description });
    if (!modCheck.isValid) {
      return NextResponse.json({ error: modCheck.error || 'Обнаружены недопустимые слова' }, { status: 400 });
    }

    // Check if exists
    const { data: existing } = await supabaseAdmin
      .from('stores')
      .select('id, slug')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existing) {
      // Build dynamic update payload without overwriting unset fields
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (store_name !== undefined) updatePayload.store_name = store_name.trim();
      if (description !== undefined) updatePayload.description = description.trim();
      if (instagram_url !== undefined) updatePayload.instagram_url = instagram_url?.trim() || null;
      if (telegram_username !== undefined) updatePayload.telegram_username = telegram_username?.trim() || null;
      if (telegram_chat_id !== undefined) updatePayload.telegram_chat_id = telegram_chat_id?.trim() || null;
      if (phone !== undefined) updatePayload.phone = phone?.trim() || null;
      if (body.theme_settings !== undefined) updatePayload.theme_settings = body.theme_settings;

      const { data: updated, error } = await supabaseAdmin
        .from('stores')
        .update(updatePayload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, store: updated });
    } else {
      // Insert new store
      const { data: created, error } = await supabaseAdmin
        .from('stores')
        .insert({
          slug: cleanSlug,
          store_name: store_name?.trim() || 'Мой магазин',
          description: description?.trim() || 'Онлайн-витрина в Instagram и Telegram',
          instagram_url: instagram_url?.trim() || null,
          telegram_username: telegram_username?.trim() || null,
          telegram_chat_id: telegram_chat_id?.trim() || '',
          phone: phone?.trim() || '+998 90 000 00 00',
          currency: 'сум',
          theme: 'light',
          catalog_layout: 'grid',
          plan: 'start',
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, store: created });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
