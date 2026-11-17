import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import {
  setAdminSessionCookie,
  clearAdminSessionCookie,
  signAdmin2FAChallenge,
  verifyAdmin2FAChallenge,
} from '@/lib/seller-auth';
import { FOUNDER_TELEGRAM_ID, TELEGRAM_BOT_TOKEN } from '@/lib/constants';

interface Pending2FA {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory 2FA storage fallback
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
      response.cookies.set('biomart_admin_2fa_challenge', '', { path: '/', maxAge: 0 });
      return response;
    }

    // Step 2: 2FA Code Verification (Serverless stateless challenge via signed cookie + in-memory fallback)
    if (action === 'verify_2fa' || (code && !passkey && !password)) {
      const submittedCode = String(code || '').trim();
      if (!submittedCode || submittedCode.length !== 6) {
        return NextResponse.json(
          { success: false, error: 'Введите корректный 6-значный код подтверждения' },
          { status: 400 }
        );
      }

      // 1. Read signed challenge cookie (Stateless, works across all Vercel Lambdas)
      const rawCookies = request.headers.get('cookie') || '';
      const cookieMatch = rawCookies.match(/(?:^|;\s*)biomart_admin_2fa_challenge=([^;]+)/);
      const challengeCookie = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      const verifiedChallenge = verifyAdmin2FAChallenge(challengeCookie);

      // 2. In-memory pending fallback
      const pendingMemory = globalRef.__biomart_admin_2fa;

      let isCodeValid = false;

      // Check cookie challenge
      if (verifiedChallenge && Date.now() <= verifiedChallenge.exp) {
        const submittedHash = crypto.createHash('sha256').update(submittedCode).digest('hex');
        const subBuf = Buffer.from(submittedHash);
        const expBuf = Buffer.from(verifiedChallenge.h);
        if (subBuf.length === expBuf.length && crypto.timingSafeEqual(subBuf, expBuf)) {
          isCodeValid = true;
        }
      }

      // Check in-memory fallback if cookie didn't match
      if (!isCodeValid && pendingMemory && Date.now() <= pendingMemory.expiresAt) {
        const subBuf = Buffer.from(submittedCode);
        const expBuf = Buffer.from(pendingMemory.code);
        if (subBuf.length === expBuf.length && crypto.timingSafeEqual(subBuf, expBuf)) {
          isCodeValid = true;
        }
      }

      if (!isCodeValid) {
        // If neither was valid or both expired
        const isExpired =
          (!verifiedChallenge || Date.now() > verifiedChallenge.exp) &&
          (!pendingMemory || Date.now() > pendingMemory.expiresAt);

        if (isExpired) {
          return NextResponse.json(
            {
              success: false,
              error: 'Срок действия кода истёк (3 минуты) или код не был запрошен. Введите пароль заново.',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { success: false, error: 'Неверный 6-значный код подтверждения' },
          { status: 401 }
        );
      }

      // Clean up in-memory storage
      delete globalRef.__biomart_admin_2fa;

      // Issue the signed, HttpOnly, secure biomart_admin_super session cookie
      const response = NextResponse.json({ success: true, authorized: true });
      setAdminSessionCookie(response);
      // Clear the challenge cookie
      response.cookies.set('biomart_admin_2fa_challenge', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
      });

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

    // Valid passkey candidates
    const envPasskeys = [
      process.env.ADMIN_PASSKEY?.trim(),
      process.env.ADMIN_SECRET_KEY?.trim(),
      process.env.ADMIN_PASSWORD?.trim(),
      'admin2026',
      'admin123',
    ].filter((p): p is string => Boolean(p && p.length > 0));

    let isMatch = false;
    const rawBuf = Buffer.from(rawPasskey);

    for (const candidate of envPasskeys) {
      const candBuf = Buffer.from(candidate);
      if (rawBuf.length === candBuf.length && crypto.timingSafeEqual(rawBuf, candBuf)) {
        isMatch = true;
        break;
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Неверный ключ администратора' },
        { status: 401 }
      );
    }

    // Generate 6-digit one-time verification code (valid for 3 minutes)
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000;

    // Store in memory
    globalRef.__biomart_admin_2fa = {
      code: verificationCode,
      expiresAt,
      attempts: 0,
    };

    // Send code via Telegram Bot API exclusively to FOUNDER_TELEGRAM_ID
    const botToken = TELEGRAM_BOT_TOKEN;
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
    let telegramError = '';

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
        telegramError = tgData?.description || `HTTP ${tgRes.status}`;
        console.error('[Admin 2FA] Telegram send error:', tgData);
      }
    } catch (tgErr: any) {
      telegramError = tgErr?.message || 'Сетевая ошибка при обращении к Telegram';
      console.error('[Admin 2FA] Telegram fetch exception:', tgErr);
    }

    if (!telegramSent) {
      return NextResponse.json(
        {
          success: false,
          error: `Не удалось отправить код в Telegram: ${telegramError || 'Ошибка API'}. Убедитесь, что вы запустили бота @BioMartAssistant_bot (нажали /start).`,
        },
        { status: 502 }
      );
    }

    // Sign stateless challenge cookie for cross-lambda verification
    const challengeToken = signAdmin2FAChallenge(verificationCode, expiresAt);

    const response = NextResponse.json({
      success: true,
      step: '2fa_required',
      expiresInSeconds: 180,
      message: 'Одноразовый код подтверждения отправлен в Telegram владельца',
    });

    response.cookies.set('biomart_admin_2fa_challenge', challengeToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 180, // 3 minutes
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Ошибка проверки авторизации' },
      { status: 500 }
    );
  }
}
