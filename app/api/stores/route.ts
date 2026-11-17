import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { isSlugValid } from '@/lib/security';
import { validateStoreContent, isSlugBanned } from '@/lib/moderation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { notifyFounderNewStore, recordRegisteredStore } from '@/lib/telegram';
import { verifySellerOwnership, setSellerSessionCookie } from '@/lib/seller-auth';

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
  // Anti-spam rate limiting by IP
  const clientIp = getClientIp(req);
  const storeLimit = checkRateLimit(`store_create_${clientIp}`, 5, 60 * 60 * 1000);
  if (!storeLimit.success) {
    return NextResponse.json(
      { error: 'Слишком много попыток создания витрины. Пожалуйста, попробуйте позже.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      slug,
      store_name,
      email,
      instagram_url,
      telegram_username,
      telegram_chat_id,
      phone,
      description,
    } = body;

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

    const notificationPayload = {
      slug: cleanSlug,
      store_name: store_name?.trim() || cleanSlug,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      instagram_url: instagram_url?.trim() || null,
      telegram_username: telegram_username?.trim() || null,
      telegram_chat_id: telegram_chat_id?.trim() || null,
      description: description?.trim() || null,
    };

    // If Supabase is not configured, support local storage + notify founder
    if (!isSupabaseConfigured || !supabaseAdmin) {
      recordRegisteredStore(notificationPayload);
      // Fire notification in background (doesn't block response)
      notifyFounderNewStore(notificationPayload).catch((e) =>
        console.warn('[Stores API] Telegram notify error:', e)
      );

      const localResponse = NextResponse.json({
        success: true,
        store: {
          slug: cleanSlug,
          store_name: store_name?.trim() || cleanSlug,
          description: description?.trim() || '',
        },
        notice: 'Store registered in local mode',
      });
      setSellerSessionCookie(localResponse, cleanSlug);
      return localResponse;
    }

    // Check if exists in Supabase
    const { data: existing } = await supabaseAdmin
      .from('stores')
      .select('id, slug, theme_settings')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existing) {
      // Verify authenticated seller ownership before updating existing store settings
      const authCheck = await verifySellerOwnership(req, cleanSlug);
      if (!authCheck.authorized) {
        return NextResponse.json(
          { error: authCheck.reason || 'Доступ запрещён: требуется авторизация владельца магазина' },
          { status: 401 }
        );
      }

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
      if (body.card_number !== undefined || body.card_holder !== undefined) {
        const currentThemeSettings = body.theme_settings || existing.theme_settings || {};
        updatePayload.theme_settings = {
          ...currentThemeSettings,
          ...(body.card_number !== undefined ? { card_number: body.card_number?.trim() || '' } : {}),
          ...(body.card_holder !== undefined ? { card_holder: body.card_holder?.trim() || '' } : {}),
        };
      } else if (body.theme_settings !== undefined) {
        updatePayload.theme_settings = body.theme_settings;
      }

      const { data: updated, error } = await supabaseAdmin
        .from('stores')
        .update(updatePayload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      const updateResponse = NextResponse.json({ success: true, store: updated });
      setSellerSessionCookie(updateResponse, cleanSlug);
      return updateResponse;
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
          status: 'pending',
          is_verified: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Notify Founder Telegram ID on every new store created!
      notifyFounderNewStore(notificationPayload).catch((e) =>
        console.warn('[Stores API] Telegram notify error:', e)
      );

      const createResponse = NextResponse.json({ success: true, store: created });
      setSellerSessionCookie(createResponse, cleanSlug);
      return createResponse;
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
