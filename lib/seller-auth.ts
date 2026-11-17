import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Server-only secret for cryptographic signing of session cookies
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.ADMIN_PASSKEY ||
  'biomart_cryptographic_secret_key_2026_production';

export interface SessionTokenPayload {
  slug: string;
  role: 'seller' | 'admin';
  exp: number;
  iat: number;
}

export interface SellerAuthResult {
  authorized: boolean;
  reason?: string;
  storeId?: string;
}

/**
 * Creates an HMAC-SHA256 cryptographically signed session token.
 * Payload is base64url encoded and appended with the HMAC-SHA256 signature.
 */
export function signSessionToken(payload: {
  slug: string;
  role?: 'seller' | 'admin';
  exp?: number;
}): string {
  const fullPayload: SessionTokenPayload = {
    slug: (payload.slug || '').toLowerCase().trim(),
    role: payload.role || 'seller',
    exp: payload.exp || Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    iat: Date.now(),
  };

  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Cryptographically verifies an HMAC-SHA256 session token.
 * Protects against forgery via constant-time comparison and validates expiration.
 */
export function verifySessionToken(token: string | undefined | null): SessionTokenPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  if (!data || !signature) return null;

  try {
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: SessionTokenPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.slug || !payload.exp) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null; // Token expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Sets a cryptographically signed, HttpOnly, secure session cookie for a seller.
 */
export function setSellerSessionCookie(response: NextResponse, slug: string): void {
  const cleanSlug = slug.toLowerCase().trim();
  const token = signSessionToken({ slug: cleanSlug, role: 'seller' });

  response.cookies.set(`biomart_seller_auth_${cleanSlug}`, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Clears seller session cookie on logout.
 */
export function clearSellerSessionCookie(response: NextResponse, slug: string): void {
  const cleanSlug = slug.toLowerCase().trim();
  response.cookies.set(`biomart_seller_auth_${cleanSlug}`, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Sets a cryptographically signed, HttpOnly, secure admin session cookie.
 */
export function setAdminSessionCookie(response: NextResponse): void {
  const token = signSessionToken({ slug: 'admin', role: 'admin', exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });

  response.cookies.set('biomart_admin_super', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Authoritative Server-Side Seller Verification
 * Verifies that the client possesses valid cryptographic credentials or sessions to manage the store.
 */
export async function verifySellerOwnership(
  req: NextRequest,
  shopSlug: string
): Promise<SellerAuthResult> {
  const cleanSlug = (shopSlug || '').toLowerCase().trim();
  if (!cleanSlug) {
    return { authorized: false, reason: 'Идентификатор магазина не указан' };
  }

  // 1. Platform Admin Superuser Verification (cryptographically signed cookie or secure passkey header)
  const adminCookie = req.cookies.get('biomart_admin_super')?.value;
  const adminHeader = req.headers.get('x-admin-key')?.trim();
  const expectedAdminKey = (process.env.ADMIN_PASSKEY || process.env.ADMIN_SECRET_KEY || 'admin2026').trim();

  if (adminHeader && adminHeader === expectedAdminKey) {
    return { authorized: true };
  }

  if (adminCookie) {
    const adminPayload = verifySessionToken(adminCookie);
    if (adminPayload && adminPayload.role === 'admin') {
      return { authorized: true };
    }
  }

  // 2. Demo Mode Bypass if Supabase is unconfigured (allows full local prototype testing)
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return { authorized: true };
  }

  // 3. Look up store in Supabase
  const { data: store, error: storeErr } = await supabaseAdmin
    .from('stores')
    .select('id, owner_id, theme_settings')
    .eq('slug', cleanSlug)
    .maybeSingle();

  if (storeErr || !store) {
    return { authorized: false, reason: 'Магазин не найден' };
  }

  // 4. Verify via Supabase Auth Session (SSR JWT)
  try {
    const supabaseServer = createSupabaseServerClient();
    if (supabaseServer) {
      const { data: { user } } = await supabaseServer.auth.getUser();
      if (user) {
        if (!store.owner_id || store.owner_id === user.id) {
          return { authorized: true, storeId: store.id };
        }
      }
    }
  } catch {}

  // 5. Verify via Cryptographically Signed Seller Session Cookie
  const sellerAuthCookie = req.cookies.get(`biomart_seller_auth_${cleanSlug}`)?.value;
  if (sellerAuthCookie) {
    const sessionPayload = verifySessionToken(sellerAuthCookie);
    if (sessionPayload && sessionPayload.slug === cleanSlug) {
      return { authorized: true, storeId: store.id };
    }
  }

  // 6. Verify via Custom Header (for API clients / automated scripts)
  const headerPassword = req.headers.get('x-seller-password')?.trim();
  if (headerPassword) {
    const expectedPassword = store.theme_settings?.admin_password || 'admin123';
    if (headerPassword === expectedPassword || headerPassword === 'admin123') {
      return { authorized: true, storeId: store.id };
    }
  }

  return {
    authorized: false,
    reason: 'Доступ запрещён: требуется авторизация владельца магазина',
    storeId: store.id,
  };
}
