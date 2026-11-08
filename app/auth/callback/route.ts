import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        // Check if user already owns a store
        const { data: store } = await supabase
          .from('stores')
          .select('slug')
          .eq('owner_id', data.user.id)
          .maybeSingle();

        if (store?.slug) {
          // Returning seller with existing store
          return NextResponse.redirect(`${origin}/dashboard?shop=${store.slug}`);
        } else {
          // First-time seller: redirect to onboarding to pick store name and slug
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
    }
  }

  // Fallback if auth failed or code missing
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
