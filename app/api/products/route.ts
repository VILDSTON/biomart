import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: 'База данных не подключена (работает в демо-режиме)' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { id, store_slug, title, category_id, price, old_price, images, variant_type, sizes, description, in_stock } = body;

    if (!title || typeof price !== 'number') {
      return NextResponse.json({ error: 'Название и цена обязательны' }, { status: 400 });
    }

    // Find store
    const { data: store, error: storeErr } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('slug', store_slug?.toLowerCase())
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Параметр id обязателен' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
