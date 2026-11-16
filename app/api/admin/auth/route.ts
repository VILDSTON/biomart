import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    // Anti-brute force: max 5 password attempts per 10 minutes per IP
    const rateLimit = checkRateLimit(`admin_auth_${clientIp}`, 5, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Слишком много попыток ввода пароля. Попробуйте через 10 минут.' },
        { status: 429 }
      );
    }

    const { password } = await request.json();
    const correctPassword =
      process.env.ADMIN_PASSKEY?.trim() ||
      process.env.ADMIN_SECRET_KEY?.trim() ||
      process.env.ADMIN_PASSWORD?.trim() ||
      'admin2026';

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true, authorized: true });
      response.cookies.set('biomart_admin_super', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Неверный пароль администратора' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Ошибка проверки пароля' },
      { status: 500 }
    );
  }
}
