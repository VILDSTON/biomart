import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Размер файла превышает 5 МБ' }, { status: 400 });
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Разрешены только изображения (JPEG, PNG, WEBP)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Supabase is configured, upload to store-assets bucket
    if (isSupabaseConfigured && supabaseAdmin) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filePath = `${folder}/${cleanFileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from('store-assets')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const { data: publicData } = supabaseAdmin.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      return NextResponse.json({
        success: true,
        url: publicData.publicUrl,
        filePath,
      });
    }

    // Fallback if Supabase not configured: return base64 Data URL for demo mode
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      success: true,
      url: base64,
      demoMode: true,
    });
  } catch (err: any) {
    console.error('Upload exception:', err);
    return NextResponse.json({ error: err?.message || 'Ошибка загрузки файла' }, { status: 500 });
  }
}
