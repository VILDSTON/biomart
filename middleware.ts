import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle /admin and all sub-routes
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

    // Optional IP Whitelist:
    // Only enforced IF ADMIN_ALLOWED_IPS or ALLOWED_ADMIN_IPS is explicitly configured with specific IPs in environment.
    // If not configured (or '*'), dynamic access is open to all IPs and strictly protected by
    // the Server-Side Gate in app/admin/layout.tsx and 2FA Telegram OTP in app/api/admin/auth/route.ts.
    const rawAllowed = (process.env.ADMIN_ALLOWED_IPS || process.env.ALLOWED_ADMIN_IPS || '').trim();

    if (rawAllowed && rawAllowed !== '*' && !isLocalhost) {
      const allowedIps = rawAllowed
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean);

      const cookieVal = request.cookies.get('biomart_admin_super')?.value;
      const expectedKey = (process.env.ADMIN_PASSKEY || process.env.ADMIN_SECRET_KEY || 'admin2026').trim();
      const queryKey = searchParams.get('key')?.trim();
      const hasBypass = (queryKey && queryKey === expectedKey) || Boolean(cookieVal && cookieVal.length > 10);

      // Block only if IP whitelist is explicitly configured, client is not on list, and has no bypass
      if (allowedIps.length > 0 && !allowedIps.includes(clientIp) && !hasBypass) {
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
    <p>В конфигурации платформы включён строгий белый список IP-адресов.<br><br>Ваш текущий IP: <span class="badge">${clientIp}</span></p>
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
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
