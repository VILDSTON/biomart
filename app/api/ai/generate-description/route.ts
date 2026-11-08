import { NextResponse } from 'next/server';
import { aiDescriptionSchema } from '@/lib/security';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    // Rate limit: 15 requests per 1 hour (3,600,000 ms)
    const rateLimit = checkRateLimit(`ai_${clientIp}`, 15, 3600000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Превышен лимит запросов к AI (максимум 15 в час). Попробуйте позже.',
          resetMs: rateLimit.resetMs,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parseResult = aiDescriptionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { title, category, notes, language } = parseResult.data;
    const apiKey = process.env.GROQ_API_KEY?.trim();

    if (apiKey) {
      try {
        const systemPrompt =
          language === 'uz'
            ? `Siz Instagram va Telegram do'konlari uchun professional marketolog va kopiraytersiz (O'zbekiston bozori). Berilgan mahsulot nomi va xususiyatlari asosida jozibali, sotuvchi tavsif, mos kategoriya va 5 ta xeshteg yarating. Qisqa, lo'nda, xaridorni qiziqtiradigan qilib yozing. Format: faqat JSON { "description": "...", "category_suggestion": "...", "tags": ["..."] }`
            : `Ты профессиональный e-commerce копирайтер для Instagram и Telegram магазинов в Узбекистане и СНГ. По названию товара и кратким заметкам создай продающее описание (посадка, ткань/материалы, уход, почему стоит купить), предложи категорию и 5 релевантных тегов. Пиши емко, структурированно, без шаблонной воды. Формат ответа: ТОЛЬКО валидный JSON { "description": "...", "category_suggestion": "...", "tags": ["..."] }`;

        const userPrompt = `Товар: "${title}". Категория: "${category || 'не указана'}". Заметки продавца: "${notes || 'нет'}". Сгенерируй продающее описание.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6,
            max_tokens: 600,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const content = groqData.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json({
              success: true,
              description: parsed.description,
              category_suggestion: parsed.category_suggestion,
              tags: parsed.tags || [],
            });
          }
        }
      } catch (groqErr) {
        console.warn('Groq API call failed, falling back to smart template:', groqErr);
      }
    }

    // Smart Offline / Demo Fallback Generator
    const isUz = language === 'uz';
    const cleanTitle = title.trim();

    const fallbackDescription = isUz
      ? `Premium sifatli ${cleanTitle}.

• Material: Nafas oluvchi, yuqori sifatli mato
• Qulaylik: Kun bo'yi qulay harakatlanish uchun mukammal bichim
• Xizmat ko'rsatish: Toshkent bo'ylab 2-4 soatda, viloyatlarga 1-2 kunda yetkazib berish

Parvarish qilish: 30°C da teskari o'girib yuvish tavsiya etiladi.`
      : `Премиальное качество: ${cleanTitle}.

• Материал: Плотный дышащий хлопок и износостойкая фурнитура
• Посадка: Продуманный анатомический крой, держит форму после многочисленных стирок
• Доставка: Экспресс по Ташкенту (2–4 часа), безопасная доставка BTS по всему Узбекистану

Рекомендации по уходу: бережная стирка при температуре до 30°C.`;

    const fallbackCategory = category || (cleanTitle.toLowerCase().includes('худи') ? 'Худи & Свитшоты' : 'Одежда');
    const fallbackTags = ['tashkent', 'uzbekistan', 'streetwear', 'shopping', 'newcollection'];

    return NextResponse.json({
      success: true,
      description: fallbackDescription,
      category_suggestion: fallbackCategory,
      tags: fallbackTags,
      demoMode: !apiKey,
    });
  } catch (err: any) {
    console.error('AI generate route error:', err);
    return NextResponse.json(
      { error: 'Внутренняя ошибка при генерации описания' },
      { status: 500 }
    );
  }
}
