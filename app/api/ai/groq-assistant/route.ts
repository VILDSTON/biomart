import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim() || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Clean all markdown symbols, asterisks, horizontal rules, and table pipes
function cleanMarkdownText(text: string): string {
  if (!text) return '';
  return text
    // Remove bold and italic asterisks: **text** or *text* -> text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove markdown headers: ### Header -> Header
    .replace(/^#{1,6}\s+/gm, '')
    // Remove horizontal rules: ---, ===, ___
    .replace(/^[-=_]{2,}\s*$/gm, '')
    // Remove table pipes: | col | col | -> col col
    .replace(/\|/g, '')
    // Remove strikethrough: ~~text~~ -> text
    .replace(/~~(.*?)~~/g, '$1')
    // Remove inline code ticks: `code` -> code
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquote arrows: > text -> text
    .replace(/^>\s*/gm, '')
    // Collapse multiple consecutive newlines into at most two
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Smart contextual fallback generator for Uzbek e-commerce
function generateSmartFallback(lastUserMessage: string, storeName: string): string {
  const q = lastUserMessage.toLowerCase();

  if (q.includes('акци') || q.includes('скидк') || q.includes('промо') || q.includes('chegirma')) {
    return `Вот 3 проверенные механики акций для магазина «${storeName}»:

1. Акция «1+1 = бесплатная доставка»: при заказе от 2 позиций доставка курьером по Ташкенту бесплатная. Это поднимает средний чек на 30-40%.
2. Промокод первого заказа: дайте покупателям промокод START10 на скидку 10%. Опубликуйте его в закрепленных Stories с прямой ссылкой на витрину.
3. Спецпредложение дня: выберите 1 товар, поставьте старую и новую цену на витрине и выложите в Stories на 24 часа.

Все заказы покупатели оформят в 2 клика на витрине, и они сразу упадут вам в Telegram.`;
  }

  if (q.includes('доставк') || q.includes('курьер') || q.includes('yetkaz') || q.includes('yandex')) {
    return `Рекомендации по организации доставки для магазина «${storeName}»:

1. Доставка по Ташкенту: быстрее всего отправлять через Яндекс Доставку (тариф Доставка или Курьер). Время ожидания для клиента всего 1-2 часа.
2. Доставка по регионам Узбекистана: используйте службы BTS Express, Fargo или EMU. Срок доставки 1-2 дня, средняя стоимость 25 000 - 35 000 сум.
3. Укажите тарифы доставки в настройках витрины BioMart, чтобы клиенты сразу видели условия перед заказом.`;
  }

  if (q.includes('описан') || q.includes('текст') || q.includes('товар') || q.includes('tavsif')) {
    return `Формула идеального описания товара для витрины:

1. Название и главная особенность (материал, посадка, бренд).
2. Параметры: доступные размеры, объем или цвета.
3. Уход или рекомендации по использованию.
4. Доставка: «В наличии в Ташкенте, отправка сегодня».

Пишите кратко, емко и разбивайте на пункты с помощью маркеров •. Клиенты с мобильных читают описания за 5-7 секунд.`;
  }

  return `Привет! Я персональный бизнес-ассистент магазина «${storeName}».

Чем я могу помочь:
• Составить продающий текст или описание для нового товара.
• Придумать механику скидки или акцию для ваших Instagram Stories.
• Написать скрипт вежливого ответа клиенту в личные сообщения.
• Помочь с настройкой условий доставки по Ташкенту и регионам.

Напишите мне любой вопрос по продажам или ассортименту!`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, prompt, plan, storeName, category } = body;

    // Pro plan enforcement
    if (plan !== 'pro') {
      return NextResponse.json(
        {
          success: false,
          error: 'AI-Ассистент доступен только на тарифе Pro. Перейдите на Pro для доступа к персональному бизнес-ассистенту.',
        },
        { status: 403 }
      );
    }

    const conversationMessages = Array.isArray(messages) && messages.length > 0
      ? messages
      : [{ role: 'user', content: prompt || 'Привет! Чем ты можешь помочь моему магазину?' }];

    const lastUserMsg = conversationMessages[conversationMessages.length - 1]?.content || '';

    const systemPrompt = `Вы — персональный бизнес-ассистент платформы BioMart для владельцев магазинов в Instagram и Telegram (Узбекистан и СНГ).
Магазин пользователя: «${storeName || 'Магазин'}»${category ? ` (Категория: ${category})` : ''}.

СТРОЖАЙШЕЕ ТРЕБОВАНИЕ К ФОРМАТИРОВАНИЮ:
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать любые символы Markdown разметки!
- НЕ ИСПОЛЬЗУЙТЕ двойные звездочки (**слово**), одинарные звездочки (*слово*), нижние подчеркивания (_текст_).
- НЕ ИСПОЛЬЗУЙТЕ решетки заголовков (###), вертикальные черты таблиц (|), дефисы подряд (--- или ===).
- Пишите чистым текстом, как в обычном сообщении Telegram.
- Разделяйте абзацы пустой строкой.
- Для списков используйте простой символ • или цифры 1., 2., 3.
- Отвечайте лаконично, точно и без шаблонных лозунгов.
- Отвечайте на том языке, на котором написал продавец (русский или узбекский).`;

    // Try primary Groq model: llama-3.3-70b-versatile
    if (GROQ_API_KEY) {
      try {
        const groqPayload = {
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationMessages,
          ],
          temperature: 0.6,
          max_tokens: 1024,
        };

        const res = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(groqPayload),
        });

        if (res.ok) {
          const data = await res.json();
          const rawReply = data.choices?.[0]?.message?.content || '';
          const cleanedReply = cleanMarkdownText(rawReply);
          return NextResponse.json({ success: true, reply: cleanedReply });
        }

        // If primary model failed, try fast fallback: llama-3.1-8b-instant
        const fallbackRes = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...groqPayload,
            model: 'llama-3.1-8b-instant',
          }),
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const rawReply = fallbackData.choices?.[0]?.message?.content || '';
          const cleanedReply = cleanMarkdownText(rawReply);
          return NextResponse.json({ success: true, reply: cleanedReply });
        }
      } catch (groqErr) {
        console.warn('Groq fetch exception, using smart assistant generator:', groqErr);
      }
    }

    // Smart contextual fallback (always clean, always helpful)
    const fallbackReply = generateSmartFallback(lastUserMsg, storeName || 'Ваш магазин');
    return NextResponse.json({ success: true, reply: cleanMarkdownText(fallbackReply) });
  } catch (err: any) {
    console.error('AI assistant route error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
