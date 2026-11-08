import { NextRequest, NextResponse } from 'next/server';

function escapeTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, shop_slug, contact, category, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Пожалуйста, опишите вашу проблему' }, { status: 400 });
    }

    if (!contact || !contact.trim()) {
      return NextResponse.json({ error: 'Укажите ваш контакт (Telegram или телефон) для связи' }, { status: 400 });
    }

    // Owner Telegram ID specified by founder
    const FOUNDER_TELEGRAM_ID = '5504101440';
    const botToken =
      process.env.TELEGRAM_BOT_TOKEN?.trim() ||
      '9023083705:AAHRnvV1ihvAENYcZiKW8UDn7cbD4iEMdm0';

    // Map category
    const categoryLabels: Record<string, string> = {
      billing: '💳 Оплата / Тариф / Подписка не работает',
      bug: '🪲 Баг / Ошибка на сайте',
      orders: '📦 Заказы / Проблема с доставкой',
      feature: '💡 Идея / Предложение по улучшению',
      other: '❓ Общий вопрос / Другое',
    };

    const categoryTitle = categoryLabels[category] || category || '❓ Вопрос в поддержку';
    const cleanContact = contact.trim();
    const cleanName = name?.trim() || 'Продавец BioMart';
    const cleanSlug = shop_slug?.trim() || '';

    // Format current Tashkent time
    const tashkentTime = new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'Asia/Tashkent',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    let tgText = `🚨 <b>НОВОЕ ОБРАЩЕНИЕ В ПОДДЕРЖКУ BIOMART</b>\n\n`;
    tgText += `🏷 <b>Тема:</b> ${escapeTelegramHtml(categoryTitle)}\n`;
    tgText += `👤 <b>Имя:</b> ${escapeTelegramHtml(cleanName)}\n`;
    tgText += `📞 <b>Контакт:</b> <code>${escapeTelegramHtml(cleanContact)}</code>\n`;

    if (cleanSlug) {
      tgText += `🏪 <b>Магазин:</b> <a href="https://biomart.vercel.app/${escapeTelegramHtml(cleanSlug)}">biomart.vercel.app/${escapeTelegramHtml(cleanSlug)}</a>\n`;
    }

    tgText += `⏰ <b>Время (Ташкент):</b> ${tashkentTime}\n\n`;
    tgText += `📝 <b>Суть проблемы:</b>\n<i>${escapeTelegramHtml(message.trim())}</i>\n`;

    // Inline buttons for founder to immediately reply
    const inlineKeyboard: Array<Array<{ text: string; url: string }>> = [];

    // Telegram chat button if contact starts with @ or is a username
    if (cleanContact.startsWith('@')) {
      const username = cleanContact.replace('@', '');
      inlineKeyboard.push([
        { text: `💬 Написать @${username}`, url: `https://t.me/${username}` },
      ]);
    } else if (cleanContact.startsWith('+') || /^\d+$/.test(cleanContact.replace(/\s+/g, ''))) {
      const digits = cleanContact.replace(/[^\d+]/g, '');
      inlineKeyboard.push([
        { text: `📞 Позвонить ${cleanContact}`, url: `tel:${digits}` },
        { text: `💬 Чат в TG по номеру`, url: `https://t.me/${digits.replace('+', '')}` },
      ]);
    }

    if (cleanSlug) {
      inlineKeyboard.push([
        { text: `🏪 Открыть витрину`, url: `https://biomart.vercel.app/${cleanSlug}` },
      ]);
    }

    let telegramSent = false;
    let telegramError = null;

    if (botToken) {
      try {
        const payload: any = {
          chat_id: FOUNDER_TELEGRAM_ID,
          text: tgText,
          parse_mode: 'HTML',
        };

        if (inlineKeyboard.length > 0) {
          payload.reply_markup = {
            inline_keyboard: inlineKeyboard,
          };
        }

        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const tgData = await tgRes.json();
        if (tgData.ok) {
          telegramSent = true;
        } else {
          telegramError = tgData.description;
          console.warn('Telegram support dispatch error:', tgData.description);
        }
      } catch (e: any) {
        telegramError = e.message;
        console.warn('Telegram support dispatch exception:', e);
      }
    }

    return NextResponse.json({
      success: true,
      telegramSent,
      telegramError,
    });
  } catch (err: any) {
    console.error('Support route exception:', err);
    return NextResponse.json({ error: err.message || 'Ошибка отправки обращения' }, { status: 500 });
  }
}
