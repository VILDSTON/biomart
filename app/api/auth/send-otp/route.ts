import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, code, shopName } = await req.json();
    console.log(`[BioMart OTP] Code for ${email} (${shopName}): ${code}`);
    return NextResponse.json({
      ok: true,
      success: true,
      message: `Код подтверждения отправлен на ${email}`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
