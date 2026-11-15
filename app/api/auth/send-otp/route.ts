import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, code, shopName } = await req.json();
    console.log(`[BioMart OTP] Code for ${email} (${shopName}): ${code}`);

    const resendKey = process.env.RESEND_API_KEY?.trim();
    let emailSent = false;
    let emailError: string | null = null;

    if (resendKey && email) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'BioMart <onboarding@resend.dev>',
            to: email,
            subject: `Код подтверждения BioMart: ${code}`,
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background: #FFFFFF;">
                <h2 style="color: #1F7A5A; margin-top: 0;">BioMart</h2>
                <p style="font-size: 14px; color: #374151;">Здравствуйте! Вы регистрируете магазин <strong>${shopName || 'в BioMart'}</strong>.</p>
                <p style="font-size: 14px; color: #374151;">Ваш проверочный код для входа:</p>
                <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #111827; background: #F3F4F6; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
                  ${code}
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
        ? `Код подтверждения отправлен на ${email}`
        : `Код сформирован: ${code} (Тестовый режим)`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
