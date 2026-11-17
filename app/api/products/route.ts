import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { verifySellerOwnership } from '@/lib/seller-auth';

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: 'База данных не подключена (работает в демо-режиме)' }, { status: 503 });
  }

  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`prod_write_${clientIp}`, 60, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Слишком много запросов. Подождите минуту.' }, { status: 429 });
    }

    const body = await req.json();
    const { id, store_slug, title, category_id, price, old_price, images, variant_type, sizes, description, in_stock } = body;

    if (!title || typeof price !== 'number' || !store_slug) {
      return NextResponse.json({ error: 'Название, цена и идентификатор магазина обязательны' }, { status: 400 });
    }

    // Verify authenticated seller ownership before allowing product mutation
    const authCheck = await verifySellerOwnership(req, store_slug);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.reason || 'Доступ запрещён: требуется авторизация владельца магазина' },
        { status: 403 }
      );
    }

    // Find store
    const { data: store, error: storeErr } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('slug', store_slug.toLowerCase().trim())
      .maybeSingle();

    if (storeErr || !store) {
      return NextResponse.json({ error: 'Магазин не найден' }, { status: 404 });
    }

    if (id && !id.startsWith('prod-')) {
      // Update existing UUID product
      const { data: updated, error } = await supabaseAdmin
        .from('products')
        .update({
          title: title.trim(),
          category_id: category_id || null,
          price,
          old_price: old_price || null,
          images: images || [],
          variant_type: variant_type || '',
          sizes: sizes || [],
          description: description?.trim() || null,
          in_stock: in_stock !== false,
        })
        .eq('id', id)
        .eq('store_id', store.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, product: updated });
    } else {
      // Check catalog size limit to prevent database ballooning (max 50 products per store on trial)
      const { count } = await supabaseAdmin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', store.id);

      if (count && count >= 50) {
        return NextResponse.json(
          { error: 'Лимит каталога достигнут (максимум 50 товаров в тарифе). Удалите неактуальные товары для добавления новых.' },
          { status: 403 }
        );
      }

      // Insert new product
      const { data: created, error } = await supabaseAdmin
        .from('products')
        .insert({
          store_id: store.id,
          category_id: (category_id && !category_id.startsWith('cat-')) ? category_id : null,
          title: title.trim(),
          price,
          old_price: old_price || null,
          images: images || [],
          variant_type: variant_type || '',
          sizes: sizes || [],
          description: description?.trim() || null,
          in_stock: in_stock !== false,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, product: created });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: 'База данных не подключена' }, { status: 503 });
  }

  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`prod_del_${clientIp}`, 60, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Слишком много запросов. Подождите минуту.' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const store_slug = searchParams.get('store_slug') || searchParams.get('slug');

    if (!id || !store_slug) {
      return NextResponse.json({ error: 'Параметры id и store_slug обязательны' }, { status: 400 });
    }

    // Verify authenticated seller ownership before allowing product deletion
    const authCheck = await verifySellerOwnership(req, store_slug);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.reason || 'Доступ запрещён: требуется авторизация владельца магазина' },
        { status: 403 }
      );
    }

    // Verify ownership before deletion to prevent unauthorized product removal
    const { data: store, error: storeErr } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('slug', store_slug.toLowerCase().trim())
      .maybeSingle();

    if (storeErr || !store) {
      return NextResponse.json({ error: 'Магазин не найден' }, { status: 404 });
    }

    const { data: product, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, store_id')
      .eq('id', id)
      .maybeSingle();

    if (prodErr || !product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    if (product.store_id !== store.id) {
      return NextResponse.json({ error: 'Доступ запрещён: товар принадлежит другому магазину' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .eq('store_id', store.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
