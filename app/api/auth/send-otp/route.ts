import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // 1. IP Rate Limiting: Max 5 OTP sends per 10 minutes per IP
    const ipLimit = checkRateLimit(`otp_ip_${clientIp}`, 5, 10 * 60 * 1000);
    if (!ipLimit.success) {
      return NextResponse.json(
        { ok: false, error: 'Слишком много запросов кода. Пожалуйста, подождите 10 минут.' },
        { status: 429 }
      );
    }

    const { email, code, shopName } = await req.json();

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { ok: false, error: 'Укажите корректный адрес электронной почты' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Email-specific Rate Limiting: Max 3 OTP sends per 15 minutes per email address
    const emailLimit = checkRateLimit(`otp_email_${cleanEmail}`, 3, 15 * 60 * 1000);
    if (!emailLimit.success) {
      return NextResponse.json(
        { ok: false, error: 'Код на этот email уже отправлялся. Проверьте входящие или подождите 15 минут.' },
        { status: 429 }
      );
    }

    // 4. Validate code format
    const safeCode = String(code || '').replace(/\D/g, '').slice(0, 6);
    if (safeCode.length < 4) {
      return NextResponse.json(
        { ok: false, error: 'Некорректный проверочный код' },
        { status: 400 }
      );
    }

    console.log(`[BioMart OTP] Code for ${cleanEmail} (${shopName || 'Store'}): ${safeCode}`);

    const resendKey = process.env.RESEND_API_KEY?.trim();
    let emailSent = false;
    let emailError: string | null = null;

    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'BioMart <onboarding@resend.dev>',
            to: cleanEmail,
            subject: `Код подтверждения BioMart: ${safeCode}`,
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background: #FFFFFF;">
                <h2 style="color: #1F7A5A; margin-top: 0;">BioMart</h2>
                <p style="font-size: 14px; color: #374151;">Здравствуйте! Вы регистрируете магазин <strong>${shopName || 'в BioMart'}</strong>.</p>
                <p style="font-size: 14px; color: #374151;">Ваш проверочный код для входа:</p>
                <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #111827; background: #F3F4F6; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
                  ${safeCode}
                </div>
                <p style="font-size: 12px; color: #9CA3AF; margin-bottom: 0;">Никому не сообщайте этот код. Код действителен 15 минут.</p>
              </div>
            `,
          }),
        });
        const resData = await res.json();
        if (res.ok) {
          emailSent = true;
        } else {
          emailError = resData.message || 'Ошибка отправки почты через Resend';
          console.warn('[BioMart OTP] Resend API error:', resData);
        }
      } catch (err: any) {
        emailError = err?.message || 'Network error sending email';
        console.warn('[BioMart OTP] Email fetch error:', err);
      }
    }

    return NextResponse.json({
      ok: true,
      success: true,
      emailSent,
      emailError,
      demoMode: !emailSent,
      message: emailSent
        ? `Код подтверждения отправлен на ${cleanEmail}`
        : `Код сформирован: ${safeCode} (Тестовый режим)`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Ошибка отправки' }, { status: 400 });
  }
}
