import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TELEGRAM_BOT_TOKEN } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const botToken = TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
    }

    const body = await req.json();
    let targetChatId = body.chat_id ? String(body.chat_id).trim() : null;
    const shopSlug = body.shop_slug ? String(body.shop_slug).trim().toLowerCase() : 'market';

    // Resolve if targetChatId is a username or if missing
    if (!targetChatId || !/^-?\d+$/.test(targetChatId)) {
      const mappingPath = path.join(process.cwd(), 'data', 'telegram_users.json');
      if (fs.existsSync(mappingPath)) {
        try {
          const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
          if (targetChatId) {
            const clean = targetChatId.replace(/^@/, '').toLowerCase();
            const val = mapping[clean] || mapping[`@${clean}`];
            if (val) targetChatId = typeof val === 'object' ? String(val.chat_id) : String(val);
          }
          if (!targetChatId && shopSlug) {
            const storeVal = mapping[`store_${shopSlug}`] || mapping[shopSlug];
            if (storeVal) targetChatId = typeof storeVal === 'object' ? String(storeVal.chat_id) : String(storeVal);
          }
        } catch {}
      }
    }

    if (!targetChatId) {
      return NextResponse.json(
        { error: 'Не удалось определить Chat ID. Сначала подтвердите привязку в боте @BioMartAssistant_bot.' },
        { status: 400 }
      );
    }

    const testText = 
      `🧪 <b>ТЕСТОВЫЙ ЧЕК ЗАКАЗА #7777</b>\n` +
      `<b>Магазин:</b> biomart.vercel.app/${shopSlug}\n\n` +
      `<b>Клиент:</b> Тестовый Покупатель\n` +
      `<b>Телефон:</b> <a href="tel:+998901234567">+998 90 123 45 67</a>\n` +
      `<b>Способ получения:</b> Доставка курьером\n` +
      `<b>Адрес:</b> г. Ташкент, ул. Навои 1, кв. 14\n` +
      `<b>Комментарий:</b> <i>«Проверка интеграции Telegram из кабинета BioMart»</i>\n\n` +
      `<b>Состав заказа:</b>\n` +
      `• <b>Худи Оверсайз BioMart Special Edition</b> (L)\n  — 1 шт. × 350 000 сум\n\n` +
      `<b>ИТОГО К ОПЛАТЕ: 350 000 сум</b>\n\n` +
      `✅ <i>Поздравляем! Ваш Telegram успешно подключён. Теперь все заказы с вашей витрины будут приходить сюда в реальном времени.</i>`;

    const inlineKb = [
      [
        {
          text: '💬 Чат в Telegram с клиентом',
          url: 'https://t.me/BioMartAssistant_bot',
        },
      ],
      [
        {
          text: '📍 Открыть адрес в Яндекс Картах',
          url: 'https://yandex.uz/maps/?text=Tashkent+Navoi+1',
        },
      ],
    ];

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: testText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: inlineKb,
        },
      }),
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      return NextResponse.json({ error: tgData.description || 'Telegram API error' }, { status: 400 });
    }

    return NextResponse.json({ success: true, chat_id: targetChatId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
