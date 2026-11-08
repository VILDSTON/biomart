import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

    const systemPrompt = `Вы — персональный бизнес-ассистент платформы BioMart для продавцов в Instagram и Telegram (Узбекистан и СНГ).
Магазин пользователя: «${storeName || 'Магазин'}»${category ? ` (Категория: ${category})` : ''}.

Ваши задачи:
1. Писать короткие, продающие и точные описания товаров без рекламной воды.
2. Придумывать акции, скидочные механики и промокоды для Instagram Stories и Telegram-каналов.
3. Давать практические советы по быстрой доставке (Yandex Delivery, курьеры по Ташкенту, BTS по регионам Узбекистана).
4. Составлять вежливые скрипты ответов покупателям для закрытия сделок в личных сообщениях.

Правила:
- Отвечайте структурированно, лаконично и по делу (буллеты, чёткие цифры, списки).
- Никаких шаблонных клише, пустых восхвалений или навязчивых лозунгов.
- Отвечайте на том языке, на котором обратился продавец (русский или узбекский).`;

    const groqPayload = {
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationMessages,
      ],
      temperature: 0.7,
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

    if (!res.ok) {
      const errText = await res.text();
      console.error('Groq API error:', res.status, errText);
      // Fallback model if 120b is temporarily busy
      const fallbackRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...groqPayload,
          model: 'qwen/qwen3.8-27b',
        }),
      });

      if (!fallbackRes.ok) {
        return NextResponse.json(
          { success: false, error: 'Ошибка вызова Groq AI API. Попробуйте позже.' },
          { status: 502 }
        );
      }

      const fallbackData = await fallbackRes.json();
      const reply = fallbackData.choices?.[0]?.message?.content || '';
      return NextResponse.json({ success: true, reply });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ success: true, reply });
  } catch (err: any) {
    console.error('AI assistant route error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
