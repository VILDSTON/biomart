import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/seller-auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { logAdminAction } from '@/lib/admin-audit';
import { setStoreVerifiedInFile } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data: stores, error } = await supabaseAdmin
        .from('stores')
        .select(`
          *,
          products:products(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback simple query without join count
        const { data: fallbackStores, error: fallbackErr } = await supabaseAdmin
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackErr) {
          return NextResponse.json({ error: fallbackErr.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, stores: fallbackStores || [] });
      }

      const formatted = (stores || []).map((s: any) => ({
        ...s,
        products_count: s.products?.[0]?.count ?? 0,
      }));

      return NextResponse.json({ success: true, stores: formatted });
    }

    return NextResponse.json({ success: true, stores: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error fetching stores' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, is_featured, is_verified, plan, status, moderation_comment } = body;

    const cleanSlug = String(slug || '').toLowerCase().trim();
    if (!cleanSlug) {
      return NextResponse.json({ error: 'Параметр slug обязателен' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (typeof is_featured === 'boolean') updatePayload.is_featured = is_featured;
    if (typeof is_verified === 'boolean') updatePayload.is_verified = is_verified;
    if (plan && ['start', 'plus', 'pro'].includes(plan)) updatePayload.plan = plan;
    if (status && ['published', 'pending', 'needs_changes', 'rejected'].includes(status)) updatePayload.status = status;
    if (moderation_comment !== undefined) updatePayload.moderation_comment = moderation_comment;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    let updatedStore: any = null;

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('stores')
        .update(updatePayload)
        .eq('slug', cleanSlug)
        .select()
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      updatedStore = data;
    }

    if (typeof is_verified === 'boolean') {
      setStoreVerifiedInFile(cleanSlug, is_verified);
    }

    // Audit log
    await logAdminAction({
      action: 'update_store_admin',
      target_type: 'store',
      target_id: cleanSlug,
      details: updatePayload,
    });

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      store: updatedStore || { slug: cleanSlug, ...updatePayload },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error updating store' }, { status: 500 });
  }
}
