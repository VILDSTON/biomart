import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/seller-auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { logAdminAction } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

const STORAGE_FOLDERS = ['products', 'stores', 'avatars', 'banners', 'catalog'];

export async function GET(req: NextRequest) {
  try {
    if (!verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await scanOrphanedFiles();
    return NextResponse.json({ success: true, ...report });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error scanning storage' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'cleanup';

    if (action === 'scan') {
      const report = await scanOrphanedFiles();
      return NextResponse.json({ success: true, ...report });
    }

    if (action === 'cleanup') {
      const report = await scanOrphanedFiles();
      if (!isSupabaseConfigured || !supabaseAdmin) {
        return NextResponse.json({
          success: true,
          deleted_count: 0,
          bytes_reclaimed: 0,
          message: 'Supabase Storage не подключен (локальный режим)',
        });
      }

      const filesToDelete = report.orphaned_paths;
      let deletedCount = 0;

      // Delete in chunks of 50
      for (let i = 0; i < filesToDelete.length; i += 50) {
        const chunk = filesToDelete.slice(i, i + 50);
        const { error } = await supabaseAdmin.storage.from('store-assets').remove(chunk);
        if (!error) {
          deletedCount += chunk.length;
        } else {
          console.warn('[Storage Cleanup] Remove chunk error:', error);
        }
      }

      await logAdminAction({
        action: 'cleanup_orphaned_storage',
        target_type: 'storage',
        target_id: 'store-assets',
        details: {
          scanned: report.total_files,
          deleted: deletedCount,
          bytes_reclaimed: report.orphaned_bytes,
        },
      });

      return NextResponse.json({
        success: true,
        deleted_count: deletedCount,
        bytes_reclaimed: report.orphaned_bytes,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error in storage cleanup' }, { status: 500 });
  }
}

async function scanOrphanedFiles() {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return {
      is_configured: false,
      total_files: 0,
      active_files: 0,
      orphaned_count: 0,
      orphaned_bytes: 0,
      orphaned_paths: [],
      storage_usage_bytes: 0,
    };
  }

  // 1. Gather all active referenced image paths from products and stores
  const activeReferencedPaths = new Set<string>();

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('images');

  if (products) {
    products.forEach((p) => {
      if (Array.isArray(p.images)) {
        p.images.forEach((imgUrl: string) => {
          extractStoragePath(imgUrl, activeReferencedPaths);
        });
      }
    });
  }

  const { data: stores } = await supabaseAdmin
    .from('stores')
    .select('avatar_url, banner_url');

  if (stores) {
    stores.forEach((s) => {
      if (s.avatar_url) extractStoragePath(s.avatar_url, activeReferencedPaths);
      if (s.banner_url) extractStoragePath(s.banner_url, activeReferencedPaths);
    });
  }

  // 2. List all files currently in store-assets bucket
  let allStoredFiles: Array<{ name: string; folder: string; size: number }> = [];

  for (const folder of STORAGE_FOLDERS) {
    try {
      const { data: files } = await supabaseAdmin.storage
        .from('store-assets')
        .list(folder, { limit: 1000, offset: 0 });

      if (files) {
        files.forEach((f) => {
          if (f.name && !f.name.startsWith('.')) {
            allStoredFiles.push({
              name: f.name,
              folder,
              size: (f.metadata as any)?.size || 50000, // estimated if metadata empty
            });
          }
        });
      }
    } catch {}
  }

  // 3. Compare and determine orphaned files
  const orphanedPaths: string[] = [];
  let orphanedBytes = 0;
  let totalBytes = 0;

  allStoredFiles.forEach((file) => {
    const fullPath = `${file.folder}/${file.name}`;
    totalBytes += file.size;

    if (!activeReferencedPaths.has(fullPath) && !activeReferencedPaths.has(file.name)) {
      orphanedPaths.push(fullPath);
      orphanedBytes += file.size;
    }
  });

  return {
    is_configured: true,
    total_files: allStoredFiles.length,
    active_files: allStoredFiles.length - orphanedPaths.length,
    orphaned_count: orphanedPaths.length,
    orphaned_bytes: orphanedBytes,
    orphaned_paths: orphanedPaths,
    storage_usage_bytes: totalBytes,
  };
}

function extractStoragePath(url: string, pathSet: Set<string>): void {
  if (!url || typeof url !== 'string') return;
  // Supabase public URL format: .../storage/v1/object/public/store-assets/products/filename.webp
  const match = url.match(/store-assets\/(.+)$/);
  if (match && match[1]) {
    pathSet.add(decodeURIComponent(match[1]));
    const justFileName = match[1].split('/').pop();
    if (justFileName) pathSet.add(justFileName);
  }
}
