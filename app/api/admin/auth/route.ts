import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === correctPassword) {
      return NextResponse.json({ success: true, authorized: true });
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
