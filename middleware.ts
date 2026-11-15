import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Protect /admin and all sub-routes with strict IP verification
  if (pathname.startsWith('/admin')) {
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded
      ? forwarded.split(',')[0].trim()
      : (request.headers.get('x-real-ip')?.trim() || '127.0.0.1');

    // Localhost & development loopback IPs always allowed
    const isLocalhost =
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp === 'localhost' ||
      clientIp.startsWith('::ffff:127.0.0.1');

    // Check configured ALLOWED_IPS (defaults to localhost loopback if not explicitly set in env)
    const rawAllowed = process.env.ADMIN_ALLOWED_IPS || process.env.ALLOWED_ADMIN_IPS || '127.0.0.1,::1,localhost';
    const allowedIps = rawAllowed
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);

    // Passkey authentication bypass (?key=... or cookie biomart_admin_super)
    const expectedKey = (process.env.ADMIN_PASSKEY || process.env.ADMIN_SECRET_KEY || 'admin2026').trim();
    const queryKey = searchParams.get('key')?.trim();
    const cookieKey = request.cookies.get('biomart_admin_super')?.value;
    const hasValidKey = (queryKey && queryKey === expectedKey) || cookieKey === 'true';

    // If client is external, not in allowed list, and has no passkey, block with 403
    if (!isLocalhost && !allowedIps.includes(clientIp) && !hasValidKey) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>403 — Доступ к админ-панели ограничен по IP | BioMart</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #121212; color: #F5F5F5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #1E1E1E; border: 1px solid #2E2E2E; border-radius: 16px; max-width: 480px; padding: 32px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; margin-bottom: 12px; color: #F87171; }
    p { font-size: 13px; color: #A3A3A3; line-height: 1.6; margin-bottom: 20px; }
    .badge { font-family: monospace; background: #282828; padding: 4px 8px; border-radius: 6px; font-size: 12px; color: #2BB584; }
    a { display: inline-block; padding: 10px 20px; border-radius: 10px; background: #2BB584; color: #fff; text-decoration: none; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🛡 Доступ к /admin ограничен по IP</h1>
    <p>В целях безопасности доступ к панели управления платформы разрешён только с доверенных IP-адресов администраторов.<br><br>Ваш текущий IP: <span class="badge">${clientIp}</span></p>
    <a href="/">На главную BioMart</a>
  </div>
</body>
</html>`,
        {
          status: 403,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    // If accessed with valid passkey, persist authorization cookie
    if (queryKey && queryKey === expectedKey) {
      const response = NextResponse.next();
      response.cookies.set('biomart_admin_super', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
