import { NextRequest, NextResponse } from 'next/server';
import { clearSellerSessionCookie } from '@/lib/seller-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { slug } = body;
    const cleanSlug = (slug || '').toLowerCase().trim();

    const response = NextResponse.json({ success: true });
    if (cleanSlug) {
      clearSellerSessionCookie(response, cleanSlug);
    }
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
