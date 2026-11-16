import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Whitelisted folders for assets to prevent directory traversal
const ALLOWED_FOLDERS = ['products', 'stores', 'avatars', 'banners', 'catalog'] as const;

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting: Max 20 image uploads per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`upload_${clientIp}`, 20, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Слишком много загрузок. Пожалуйста, подождите минуту перед следующей загрузкой.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string) || 'products';

    // Sanitize folder to prevent path traversal
    const folder = ALLOWED_FOLDERS.includes(rawFolder as any) ? rawFolder : 'products';

    if (!file) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    // Validate size (max 1.2MB for Supabase 1GB storage quota preservation)
    const MAX_SIZE = 1.2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: 'Размер файла превышает 1.2 МБ. Пожалуйста, выберите сжатое изображение для экономии хранилища' 
      }, { status: 400 });
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Разрешены только изображения (JPEG, PNG, WEBP, AVIF)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Supabase is configured, upload to store-assets bucket with immutable cache header
    if (isSupabaseConfigured && supabaseAdmin) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(ext) ? ext : 'webp';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${safeExt}`;
      const filePath = `${folder}/${cleanFileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from('store-assets')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
          // Cache-Control 1 year immutable: instructs CDNs & browsers to cache permanently,
          // saving Supabase network egress and keeping user bills zero-waste.
          cacheControl: '31536000, public, immutable',
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
