import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const slug = searchParams.get('slug') || body.slug || 'tashkent_drip';

    revalidatePath(`/${slug}`, 'page');
    revalidatePath('/[slug]', 'page');

    return NextResponse.json({
      revalidated: true,
      slug,
      now: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { revalidated: false, error: err?.message || 'Revalidation failed' },
      { status: 500 }
    );
  }
}
