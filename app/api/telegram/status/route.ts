import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopSlug = searchParams.get('shop_slug')?.trim().toLowerCase();
    const queryTarget = searchParams.get('target')?.trim();

    const mappingPath = path.join(process.cwd(), 'data', 'telegram_users.json');
    let mapping: Record<string, any> = {};
    if (fs.existsSync(mappingPath)) {
      try {
        mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
      } catch {
        mapping = {};
      }
    }

    let resolvedChatId: string | null = null;
    let resolvedUsername: string | null = null;
    let isConnected = false;

    // 1. Check if numeric target is provided
    if (queryTarget && /^-?\d+$/.test(queryTarget)) {
      resolvedChatId = queryTarget;
      isConnected = true;
      if (mapping[queryTarget] && typeof mapping[queryTarget] === 'object') {
        resolvedUsername = mapping[queryTarget].username || null;
      }
    }

    // 2. Check candidate usernames
    if (!resolvedChatId && queryTarget) {
      const cleanUser = queryTarget.replace(/^@/, '').toLowerCase();
      const val = mapping[cleanUser] || mapping[`@${cleanUser}`];
      if (val) {
        resolvedChatId = typeof val === 'object' ? String(val.chat_id) : String(val);
        resolvedUsername = cleanUser;
        isConnected = true;
      }
    }

    // 3. Check shop_slug mapping
    if (!resolvedChatId && shopSlug) {
      const storeVal = mapping[`store_${shopSlug}`] || mapping[shopSlug];
      if (storeVal) {
        resolvedChatId = typeof storeVal === 'object' ? String(storeVal.chat_id) : String(storeVal);
        isConnected = true;
        if (mapping[resolvedChatId] && typeof mapping[resolvedChatId] === 'object') {
          resolvedUsername = mapping[resolvedChatId].username || null;
        }
      }
    }

    // 4. Check Supabase stores table if configured
    if (!resolvedChatId && shopSlug && isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from('stores')
          .select('telegram_chat_id, telegram_username')
          .eq('slug', shopSlug)
          .maybeSingle();

        if (data?.telegram_chat_id) {
          resolvedChatId = String(data.telegram_chat_id);
          resolvedUsername = data.telegram_username ? data.telegram_username.replace(/^@/, '') : null;
          isConnected = true;
        } else if (data?.telegram_username) {
          const clean = data.telegram_username.replace(/^@/, '').toLowerCase();
          const val = mapping[clean] || mapping[`@${clean}`];
          if (val) {
            resolvedChatId = typeof val === 'object' ? String(val.chat_id) : String(val);
            resolvedUsername = clean;
            isConnected = true;
          }
        }
      } catch {}
    }

    return NextResponse.json({
      is_connected: isConnected,
      chat_id: resolvedChatId,
      username: resolvedUsername,
      bot_username: 'BioMartAssistant_bot',
      shop_slug: shopSlug || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
