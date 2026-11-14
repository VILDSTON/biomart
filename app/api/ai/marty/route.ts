import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { MOCK_PRODUCTS, MOCK_STORE_SETTINGS } from '@/lib/mock-data';

// Google Studio API Key (loaded securely from server environment variables)
const GOOGLE_STUDIO_API_KEY =
  process.env.GOOGLE_STUDIO_API_KEY?.trim() ||
  process.env.GEMINI_API_KEY?.trim() ||
  '';

// Flash-Lite candidate models in priority order
const FLASH_LITE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
];

// Daily Limit per visitor / shop (e.g. 50 requests per day)
const DAILY_LIMIT = parseInt(process.env.MARTY_DAILY_LIMIT || '50', 10);

// In-memory daily counter keyed by YYYY-MM-DD:identifier
const dailyUsageTracker = new Map<string, number>();

function getTodayString(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function checkDailyLimit(identifier: string): { allowed: boolean; count: number; remaining: number } {
  const today = getTodayString();
  const key = `${today}:${identifier}`;
  const currentCount = dailyUsageTracker.get(key) || 0;

  if (currentCount >= DAILY_LIMIT) {
    return { allowed: false, count: currentCount, remaining: 0 };
  }

  const nextCount = currentCount + 1;
  dailyUsageTracker.set(key, nextCount);

  // Periodic cleanup of older days (keep map small)
  if (dailyUsageTracker.size > 2000) {
    for (const k of dailyUsageTracker.keys()) {
      if (!k.startsWith(today)) {
        dailyUsageTracker.delete(k);
      }
    }
  }

  return { allowed: true, count: nextCount, remaining: DAILY_LIMIT - nextCount };
}

// Clean markdown text for readable chat display
function cleanChatText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-=_]{2,}\s*$/gm, '')
    .replace(/\|/g, '')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s*/gm, '')
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Extract [CREATE_ORDER: {...}] if model emitted it
interface OrderDataPayload {
  product_id?: string;
  title?: string;
  size?: string;
  color?: string;
  quantity?: number;
  price?: number;
  customer_name?: string;
  customer_phone?: string;
  address?: string;
  delivery_type?: 'delivery' | 'pickup';
  payment_method?: string;
  comment?: string;
}

function extractOrderPayload(text: string): { cleanText: string; orderData: OrderDataPayload | null } {
  const orderRegex = /\[CREATE_ORDER:\s*(\{.*?\})\s*\]/s;
  const match = text.match(orderRegex);

  if (!match) {
    return { cleanText: text, orderData: null };
  }

  try {
    const jsonStr = match[1];
    const orderData = JSON.parse(jsonStr) as OrderDataPayload;
    const cleanText = text.replace(orderRegex, '').trim();
    return { cleanText, orderData };
  } catch (err) {
    console.warn('[Marty] Failed to parse CREATE_ORDER JSON:', err);
    return { cleanText: text.replace(orderRegex, '').trim(), orderData: null };
  }
}

// Extract [SUGGEST_PRODUCT: {...}] tags if model emitted any
interface SuggestedProductPayload {
  id: string;
  title: string;
  price: number;
  image_url?: string;
}

function extractSuggestedProducts(text: string): { cleanText: string; products: SuggestedProductPayload[] } {
  const suggestRegex = /\[SUGGEST_PRODUCT:\s*(\{.*?\})\s*\]/gs;
  const products: SuggestedProductPayload[] = [];
  let cleanText = text;

  let match;
  while ((match = suggestRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.id || parsed.title) {
        products.push(parsed);
      }
    } catch {
      // ignore
    }
  }

  cleanText = cleanText.replace(suggestRegex, '').trim();
  return { cleanText, products };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Client IP and Rate Limiting
    const clientIp = getClientIp(request);

    // Burst rate limit: 10 requests per minute
    const burst = checkRateLimit(`marty_burst_${clientIp}`, 10, 60 * 1000);
    if (!burst.success) {
      return NextResponse.json(
        { error: 'Слишком много сообщений. Пожалуйста, подождите минутку.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      messages = [],
      shop = {},
      products = [],
      cart = [],
    } = body;

    const shopSlug = shop.slug || 'tashkent_drip';
    const storeName = shop.store_name || shop.name || 'Tashkent Drip';
    const storeDesc = shop.description || 'Магазин одежды и аксессуаров в Ташкенте';
    const storeCity = shop.city || 'Ташкент';
    const storePhone = shop.phone || '';
    const storeTg = shop.telegram_username || '';

    // 2. Daily Limit Check (Flash-Lite with Daily Quota)
    const dailyKey = `${clientIp}_${shopSlug}`;
    const dailyCheck = checkDailyLimit(dailyKey);

    if (!dailyCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Дневной лимит обращений к AI-ассистенту Марти (50 запросов) исчерпан на сегодня.',
          limitReached: true,
          dailyLimit: DAILY_LIMIT,
          remainingToday: 0,
          reply: 'Дневной лимит бесплатных запросов к AI-консультанту Марти исчерпан на сегодня. Вы можете легко оформить заказ самостоятельно через корзину на сайте или написать нам в Telegram/Instagram!',
        },
        { status: 429 }
      );
    }

    // 3. Prepare Catalog Summary for Marty's Context
    const activeCatalog = products.length > 0 ? products : MOCK_PRODUCTS;
    const catalogSummary = activeCatalog
      .slice(0, 15)
      .map((p: any) => {
        const sizes = Array.isArray(p.size_options) && p.size_options.length > 0 ? `Размеры: ${p.size_options.join(', ')}` : '';
        const colors = Array.isArray(p.color_options) && p.color_options.length > 0 ? `Цвета: ${p.color_options.join(', ')}` : '';
        const details = [sizes, colors].filter(Boolean).join(' | ');
        return `• ID: ${p.id} | ${p.title} — ${p.price?.toLocaleString('ru-RU')} сум${details ? ` (${details})` : ''}${p.in_stock === false ? ' [НЕТ В НАЛИЧИИ]' : ' [В НАЛИЧИИ]'}`;
      })
      .join('\n');

    // 4. Construct System Instruction for Marty
    const systemPrompt = `Ты — Марти (Marty), умный, вежливый и профессиональный AI-консультант интернет-магазина «${storeName}» (${storeCity}, Узбекистан).
Описание магазина: ${storeDesc}.
${storePhone ? `Телефон магазина: ${storePhone}.` : ''}
${storeTg ? `Telegram: @${storeTg}.` : ''}

ТВОИ ГЛАВНЫЕ ЗАДАЧИ:
1. Понятно, тепло и кратко отвечать на вопросы покупателя о товарах, размерах, материалах, ценах и наличии.
2. Помогать подобрать размер и товар под запрос клиента.
3. ПРИНИМАТЬ ЗАКАЗЫ прямо в диалоге! (Клиент может заказать товар, не нажимая кнопок, просто сказав тебе).

УСЛОВИЯ МАГАЗИНА В УЗБЕКИСТАНЕ:
• Доставка по Ташкенту: экспресс через Yandex Go / курьера за 1-2 часа (или в течение дня), стоимость 20 000 - 30 000 сум или бесплатно при заказе от 500 000 сум.
• Доставка по регионам Узбекистана: через курьерскую службу BTS почта за 1-2 дня.
• Оплата: Click, Payme или наличными/переводом курьеру при получении.

КАТАЛОГ ТОВАРОВ «${storeName}»:
${catalogSummary}

ПРАВИЛА ПРИЕМА ЗАКАЗА:
Когда клиент хочет купить или заказать:
1. Если не хватает данных, вежливо запроси недостающие пункты:
   - Точный товар и размер/цвет
   - Имя покупателя
   - Номер телефона (+998...)
   - Адрес доставки в Узбекистане (город, улица, ориентир) или подтверждение самовывоза
   - Способ оплаты (Click / Payme / При получении)
2. КОГДА ВСЕ ДАННЫЕ ЕСТЬ (Товар, Имя, Телефон, Адрес):
   - Подтверди клиенту в сообщении, что заказ успешно принят и забронирован!
   - ОБЯЗАТЕЛЬНО добавь в самый конец своего ответа специальный блок JSON строго в формате:
   [CREATE_ORDER: {"product_id": "...", "title": "...", "size": "...", "quantity": 1, "price": 0, "customer_name": "...", "customer_phone": "...", "address": "...", "delivery_type": "delivery", "payment_method": "cash"}]
   (Где price — цена в сумах числом без пробелов).
3. Если предлагаешь конкретный товар из каталога, можешь добавить:
   [SUGGEST_PRODUCT: {"id": "ID", "title": "Название", "price": 100000}]

СТИЛЬ ОБЩЕНИЯ:
• Общайся дружелюбно, профессионально, с эмодзи (🛍️, ✨, 📦).
• Если клиент пишет на узбекском («Salom», «narxi qancha», «yetkazib berish»), отвечай на узбекском языке! Если на русском — на русском.
• Не используй сложные таблицы и лишнюю разметку. Текст должен быть приятным и легко читаться с телефона.`;

    // 5. Convert conversation history to Gemini contents format
    const contents: any[] = [];

    // Push conversation history
    const recentMessages = messages.slice(-8); // keep last 8 messages for context
    for (const msg of recentMessages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text || msg.content || '' }],
      });
    }

    // Ensure at least one user message
    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: 'Привет! Расскажи, что у вас есть интересного в магазине?' }],
      });
    }

    // Inject system instruction in contents or systemInstruction
    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    };

    // 6. Call Google Studio API with Flash-Lite Models
    let generatedRawText = '';
    let usedModel = '';

    for (const model of FLASH_LITE_MODELS) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_STUDIO_API_KEY}`;
        const geminiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim().length > 0) {
            generatedRawText = candidateText;
            usedModel = model;
            break;
          }
        } else {
          console.warn(`[Marty] Model ${model} returned status ${geminiRes.status}`);
        }
      } catch (err: any) {
        console.warn(`[Marty] Error trying ${model}:`, err.message);
      }
    }

    // 7. Smart Fallback if Google Studio API failed or timeout occurred
    if (!generatedRawText) {
      const lastUserMsg = (contents[contents.length - 1]?.parts?.[0]?.text || '').toLowerCase();
      generatedRawText = generateSmartMartyFallback(lastUserMsg, storeName, activeCatalog);
      usedModel = 'smart-local-fallback';
    }

    // 8. Extract structured actions (Order creation, product suggestions)
    const { cleanText: textAfterOrder, orderData } = extractOrderPayload(generatedRawText);
    const { cleanText: finalText, products: suggestedProducts } = extractSuggestedProducts(textAfterOrder);
    const cleanOutput = cleanChatText(finalText);

    return NextResponse.json({
      success: true,
      reply: cleanOutput,
      orderData: orderData || null,
      suggestedProducts: suggestedProducts.length > 0 ? suggestedProducts : null,
      model: usedModel,
      dailyLimit: DAILY_LIMIT,
      remainingToday: dailyCheck.remaining,
    });
  } catch (error: any) {
    console.error('[Marty API Error]:', error);
    return NextResponse.json(
      {
        error: 'Произошла ошибка при обращении к AI Марти. Пожалуйста, попробуйте снова.',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Fallback logic for high reliability
function generateSmartMartyFallback(q: string, storeName: string, catalog: any[]): string {
  const isUzbek = q.includes('salom') || q.includes('qancha') || q.includes('narx') || q.includes('buyurtma') || q.includes('yetkaz');

  if (isUzbek) {
    if (q.includes('yetkaz') || q.includes('dostavka')) {
      return `«${storeName}» do'konida yetkazib berish shartlari:
• Toshkent bo'yicha: Yandex Go orqali 1-2 soat ichida (20 000 - 30 000 so'm).
• Viloyatlar bo'yicha: BTS pochta orqali 1-2 kunda yetkaziladi.

Buyurtma berish uchun menga tovar nomi, o'lchamingiz va telefon raqamingizni yozing! 📦✨`;
    }

    return `Assalomu alaykum! Men «${storeName}» AI-maslahatchisi Martiman.
Sizga kerakli o'lchamni tanlashda yordam beraman va buyurtmangizni darhol qabul qilaman.

Qaysi tovar sizni qiziqtiryapti? Shunchaki yozing yoki rasmini tanlang! 🛍️`;
  }

  if (q.includes('доставк') || q.includes('курьер') || q.includes('город')) {
    return `Условия доставки в магазине «${storeName}»:
• По Ташкенту: экспресс-доставка через Яндекс Доставку за 1-2 часа (20 000 – 30 000 сум). При заказе от 500 000 сум — доставка бесплатная!
• По регионам Узбекистана: доставка через курьерскую службу BTS за 1-2 рабочих дня.

Оплата возможна через Click, Payme или наличными при получении. Хотите оформить заказ прямо сейчас? Напишите нужный товар и ваш адрес! 🚚`;
  }

  if (q.includes('размер') || q.includes('выбрать')) {
    return `С удовольствием помогу подобрать идеальный размер!
У нас в наличии размеры от S до XL. Напишите ваш рост и примерный вес, либо точный товар, который понравился, и я подскажу, как он сидит (оверсайз или классический fit). 📏✨`;
  }

  const sampleProducts = catalog.slice(0, 3).map((p) => `• ${p.title} (${p.price?.toLocaleString('ru-RU')} сум)`).join('\n');

  return `Здравствуйте! Я Марти — ваш персональный AI-консультант в магазине «${storeName}».

Я знаю всё о нашем ассортименте, могу подсказать по наличию, подобрать размер и сразу принять ваш заказ прямо здесь в переписке! 💬

Популярные позиции сегодня:
${sampleProducts}

Напишите мне, что вас интересует, или просто напишите «Хочу заказать...»! 🛍️`;
}
