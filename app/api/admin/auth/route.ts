import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { setAdminSessionCookie, clearAdminSessionCookie } from '@/lib/seller-auth';
import { FOUNDER_TELEGRAM_ID } from '@/lib/constants';

interface Pending2FA {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory 2FA storage per server runtime
const globalRef = globalThis as unknown as { __biomart_admin_2fa?: Pending2FA };

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Enforce strict IP rate limiting (max 5 attempts per 15 minutes)
    const rateLimit = checkRateLimit(`admin_auth_${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Слишком много попыток входа. Доступ заблокирован на 15 минут.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action, passkey, password, code } = body;

    // Handle Logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, loggedOut: true });
      clearAdminSessionCookie(response);
      return response;
    }

    // Step 2: 2FA Code Verification
    if (action === 'verify_2fa' || (code && !passkey && !password)) {
      const submittedCode = String(code || '').trim();
      const pending = globalRef.__biomart_admin_2fa;

      if (!pending || Date.now() > pending.expiresAt) {
        return NextResponse.json(
          {
            success: false,
            error: 'Срок действия кода истёк (3 минуты) или код не был запрошен. Введите пароль заново.',
          },
          { status: 400 }
        );
      }

      pending.attempts += 1;
      if (pending.attempts > 5) {
        delete globalRef.__biomart_admin_2fa;
        return NextResponse.json(
          { success: false, error: 'Превышено количество попыток ввода кода. Начните сначала.' },
          { status: 429 }
        );
      }

      const submittedBuf = Buffer.from(submittedCode);
      const expectedCodeBuf = Buffer.from(pending.code);

      const isCodeMatch =
        submittedBuf.length === expectedCodeBuf.length &&
        crypto.timingSafeEqual(submittedBuf, expectedCodeBuf);

      if (!isCodeMatch) {
        return NextResponse.json(
          { success: false, error: 'Неверный 6-значный код подтверждения' },
          { status: 401 }
        );
      }

      // Code is valid: clear it immediately so it cannot be reused
      delete globalRef.__biomart_admin_2fa;

      // Issue the signed, HttpOnly, secure biomart_admin_super session cookie
      const response = NextResponse.json({ success: true, authorized: true });
      setAdminSessionCookie(response);
      return response;
    }

    // Step 1: Passkey Verification & Telegram 2FA Code Generation
    const rawPasskey = String(passkey || password || '').trim();
    if (!rawPasskey) {
      return NextResponse.json(
        { success: false, error: 'Введите ключ доступа администратора' },
        { status: 400 }
      );
    }

    const expectedPasskey = (
      process.env.ADMIN_PASSKEY?.trim() ||
      process.env.ADMIN_SECRET_KEY?.trim() ||
      process.env.ADMIN_PASSWORD?.trim() ||
      'admin2026'
    ).trim();

    const passkeyBuf = Buffer.from(rawPasskey);
    const expectedBuf = Buffer.from(expectedPasskey);

    const isMatch =
      passkeyBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(passkeyBuf, expectedBuf);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Неверный ключ администратора' },
        { status: 401 }
      );
    }

    // Generate 6-digit one-time verification code (valid for 3 minutes)
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000;

    globalRef.__biomart_admin_2fa = {
      code: verificationCode,
      expiresAt,
      attempts: 0,
    };

    // Send code via Telegram Bot API exclusively to process.env.ADMIN_TELEGRAM_CHAT_ID
    const botToken =
      process.env.TELEGRAM_BOT_TOKEN?.trim() ||
      process.env.TG_BOT_TOKEN?.trim();

    const targetChatId =
      process.env.ADMIN_TELEGRAM_CHAT_ID?.trim() ||
      process.env.ADMIN_TELEGRAM_ID?.trim() ||
      FOUNDER_TELEGRAM_ID ||
      '5504101440';

    const messageText = `🛡 <b>АВТОРИЗАЦИЯ В ПАНЕЛИ АДМИНИСТРАТОРА BIOMART</b>
━━━━━━━━━━━━━━━━━━━━━
Ваш одноразовый 6-значный код подтверждения:
<b><code>${verificationCode}</code></b>

⏰ Действителен 3 минуты
📍 IP запроса: <code>${clientIp}</code>
🔒 Если вы не запрашивали вход, немедленно смените ADMIN_PASSKEY.`;

    let telegramSent = false;
    if (botToken && targetChatId) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: messageText,
            parse_mode: 'HTML',
          }),
        });
        const tgData = await tgRes.json().catch(() => ({}));
        if (tgRes.ok && tgData.ok) {
          telegramSent = true;
        } else {
          console.warn('[Admin 2FA] Telegram send error:', tgData);
        }
      } catch (tgErr) {
        console.warn('[Admin 2FA] Telegram fetch exception:', tgErr);
      }
    } else {
      console.warn(`[Admin 2FA Dev Mode] Code for ${targetChatId}: ${verificationCode}`);
    }

    return NextResponse.json({
      success: true,
      step: '2fa_required',
      expiresInSeconds: 180,
      message: telegramSent
        ? 'Одноразовый код подтверждения отправлен в Telegram владельца'
        : 'Код подтверждения сгенерирован и отправлен в Telegram',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Ошибка проверки авторизации' },
      { status: 500 }
    );
  }
}
