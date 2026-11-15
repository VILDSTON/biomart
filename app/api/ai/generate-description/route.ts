import { NextResponse } from 'next/server';
import { aiDescriptionSchema } from '@/lib/security';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    // Rate limit: 25 requests per 1 hour (3,600,000 ms)
    const rateLimit = checkRateLimit(`ai_${clientIp}`, 25, 3600000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Превышен лимит запросов к AI (максимум 25 в час). Попробуйте позже.',
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
    const apiKey =
      process.env.GOOGLE_STUDIO_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      '';

    if (apiKey) {
      const isUz = language === 'uz';
      const systemPrompt = isUz
        ? `Siz Instagram va Telegram do'konlari uchun professional marketolog va kopiraytersiz (O'zbekiston bozori). Berilgan mahsulot nomi va xususiyatlari asosida jozibali, sotuvchi tavsif, mos kategoriya va 5 ta xeshteg yarating. Qisqa, lo'nda, xaridorni qiziqtiradigan qilib yozing. Format: faqat JSON { "description": "...", "category_suggestion": "...", "tags": ["..."] }`
        : `Ты профессиональный e-commerce копирайтер для Instagram и Telegram магазинов в Узбекистане и СНГ. По названию товара и кратким заметкам создай продающее описание (посадка, ткань/материалы, уход, почему стоит купить), предложи категорию и 5 релевантных тегов. Пиши емко, структурированно, без шаблонной воды. Формат ответа: ТОЛЬКО валидный JSON { "description": "...", "category_suggestion": "...", "tags": ["..."] }`;

      const userPrompt = `Товар: "${title}". Категория: "${category || 'не указана'}". Заметки: "${notes || 'нет'}". Сгенерируй продающее описание в формате JSON.`;

      const candidateModels = [
        'gemini-flash-lite-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
      ];

      for (const model of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 450, // Compact output saves Google Studio free quota
                responseMimeType: 'application/json',
              },
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              const parsed = JSON.parse(textContent);
              return NextResponse.json({
                success: true,
                description: parsed.description,
                category_suggestion: parsed.category_suggestion,
                tags: parsed.tags || [],
              });
            }
          }
        } catch (err: any) {
          console.warn(`[Generate Description] Model ${model} error:`, err?.message);
        }
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
    });
  } catch (error: any) {
    console.error('AI Description Generator API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Внутренняя ошибка генерации описания' },
      { status: 500 }
    );
  }
}
