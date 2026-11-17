import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ success: true, featured: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('id, slug, store_name, description, avatar_url, is_verified, is_featured')
      .eq('is_featured', true)
      .eq('status', 'published')
      .limit(6);

    if (error) {
      return NextResponse.json({ success: true, featured: [] });
    }

    return NextResponse.json({ success: true, featured: data || [] });
  } catch (err) {
    return NextResponse.json({ success: true, featured: [] });
  }
}
