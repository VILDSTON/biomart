import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim() || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Models to try in order of availability and speed on Groq
const CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

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
    // Convert markdown bullet lists (* item, - item) to clean bullets (• item)
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    // Strip any remaining lone markdown artifacts
    .replace(/[\*\_#\|~]/g, '')
    // Collapse multiple consecutive newlines into at most two
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Smart contextual fallback generator for Uzbek e-commerce
function generateSmartFallback(lastUserMessage: string, storeName: string, category?: string): string {
  const q = lastUserMessage.toLowerCase();

  // Uzbek language check
  const isUzbek =
    q.includes('salom') ||
    q.includes('assalom') ||
    q.includes('narx') ||
    q.includes('sotish') ||
    q.includes('yetkaz') ||
    q.includes('mijoz') ||
    q.includes('chegirma') ||
    q.includes('yordam');

  if (isUzbek) {
    if (q.includes('sotish') || q.includes('mijoz') || q.includes('savdo')) {
      return `«${storeName}» do'koningizda sotuvni oshirish bo'yicha 3 ta amaliy qadam:

1. Instagram Bio sozlamasi: Profilingizdagi havola (Bio) ga BioMart vitrinangiz manzilini qo'ying va Stories'da «Katalogdagi barcha tovarlar yuqoridagi havolada» deb e'lon qiling.
2. Tezkor yetkazib berish: Toshkent bo'yicha Yandex Yetkazib berish orqali 1-2 soatda yetkazish imkoniyatini ta'kidlang. Bu xaridorlarning 40%ida qaror qabul qilishni tezlashtiradi.
3. Cheklangan chegirma: Yangi tovarlarga 24 soatlik maxsus narx qo'ying va Instagram Stories orqali to'g'ridan-to'g'ri vitrinaga yo'naltiring.

Buyurtmalar xaridorlar tomonidan 2 klikda rasmiylashtiriladi va to'g'ridan-to'g'ri Telegramingizga kelib tushadi.`;
    }

    return `Assalomu alaykum! Men «${storeName}» do'koni uchun shaxsiy biznes-maslahatchiman.

Qanday yordam bera olaman:
• Tovar uchun sotuvchi tavsif va post matnini tayyorlash.
• Instagram Stories uchun chegirma va aksiyalar mexanikasini tuzish.
• Xaridorlarga xushmuomala javob skriptlarini yozish.
• Toshkent va viloyatlar bo'yicha yetkazib berish shartlarini sozlash.

Savolingizni yozing, darhol amaliy maslahat beraman!`;
  }

  // Greetings check
  if (
    q === 'привет' ||
    q === 'здравствуйте' ||
    q === 'салам' ||
    q === 'добрый день' ||
    q === 'хай' ||
    q.startsWith('привет') && q.length < 15
  ) {
    return `Здравствуйте! Рад приветствовать владельца магазина «${storeName}».

Какую задачу решим прямо сейчас:
1. Составить продающий текст или описание для нового товара в витрину.
2. Придумать механику горячей акции или скидки для ваших Instagram Stories.
3. Написать скрипт вежливого ответа клиенту на вопрос «Сколько стоит?» или «Дорого».
4. Настроить тарифы доставки и способы оплаты по Ташкенту и регионам.

Напишите мне любой вопрос по продажам или ассортименту!`;
  }

  // Sales and order growth
  if (
    q.includes('продать') ||
    q.includes('продаж') ||
    q.includes('клиент') ||
    q.includes('заказ') ||
    q.includes('выручк') ||
    q.includes('качать')
  ) {
    return `План по взрывному росту продаж для магазина «${storeName}»:

1. Закрепите витрину в Instagram: поместите прямую ссылку на витрину BioMart в поле «Сайт» вашего профиля Instagram и в шапку Telegram-канала.
2. Продажи через Stories: ежедневно выкладывайте 3-4 Stories с распаковкой или видеообзором товаров, прикрепляя стикер-ссылку на конкретный товар на витрине.
3. Быстрая доставка по Ташкенту: предложите клиентам доставку день в день через Яндекс Курьер. Клиенты в Ташкенте ценят скорость выше, чем скидки.
4. Дожим сомневающихся: когда клиент пишет в Direct «Сколько стоит?», не просто называйте цену, а отправляйте короткое видео товара и ссылку на оформление в витрине в 1 клик.`;
  }

  // Instagram, Stories, Reels, Bio
  if (
    q.includes('инстаграм') ||
    q.includes('instagram') ||
    q.includes('stories') ||
    q.includes('сторис') ||
    q.includes('reels') ||
    q.includes('рилс') ||
    q.includes('шапк') ||
    q.includes('bio') ||
    q.includes('профил')
  ) {
    return `Готовая структура Instagram для магазина «${storeName}»:

1. Идеальная шапка профиля (Bio):
• «${storeName} | ${category || 'Стильная одежда и обувь'}»
• «В наличии в Ташкенте • Доставка 1-2 часа»
• «Быстрый онлайн-заказ в каталоге ниже ⬇️»
• [Ссылка на витрину BioMart]

2. 3 идеи для ежедневных Stories:
• Утро: детальный макро-видеообзор одной позиции (ткань, швы, примерка).
• День: процесс сборки заказов клиентов с отметкой курьера.
• Вечер: опрос или интерактив с выбором лучшей расцветки + ссылка на покупку.

3. Reels: снимайте короткие динамичные видео до 10 секунд под трендовый звук. В конце добавляйте текст: «Ссылка на весь каталог в шапке профиля».`;
  }

  // Pricing, Discounts, Margin
  if (
    q.includes('цен') ||
    q.includes('стоимост') ||
    q.includes('наценк') ||
    q.includes('марж') ||
    q.includes('акци') ||
    q.includes('скидк') ||
    q.includes('промо')
  ) {
    return `Стратегия ценообразования и акций для «${storeName}»:

1. Психологические цены: используйте круглые для восприятия суммы, например, 199 000 сум вместо 205 000 сум или 349 000 сум. В e-commerce Узбекистана такие ценники вызывают ощущение выгодной покупки.
2. Акция «1+1 = бесплатная доставка»: при покупке 2 товаров доставка курьером по Ташкенту за ваш счет. Это поднимает средний чек на 35%.
3. Промокод первого заказа: дайте новым подписчикам промокод START10 на скидку 10%. Это снимает первый барьер перед покупкой.
4. Спецпредложение 24 часа: выберите 1 товар, поставьте на витрине старую зачеркнутую цену и новую акционную, и запустите опрос в Stories.`;
  }

  // Delivery & Logistics
  if (
    q.includes('доставк') ||
    q.includes('курьер') ||
    q.includes('яндекс') ||
    q.includes('bts') ||
    q.includes('fargo') ||
    q.includes('emu') ||
    q.includes('yandex')
  ) {
    return `Рекомендации по организации доставки для «${storeName}»:

1. Доставка по Ташкенту:
• Используйте тариф «Яндекс Доставка» или «Курьер».
• Время получения покупателем: от 40 минут до 2 часов.
• Рекомендуемый тариф: фиксированные 25 000 сум по городу, либо бесплатно при заказе от 350 000 сум.

2. Доставка по регионам Узбекистана:
• Службы: BTS Express, Fargo, EMU или почта O'zbekiston Pochtasi.
• Срок: 1-2 рабочих дня. Средняя стоимость 25 000 - 35 000 сум.
• Отправляйте трек-номер клиенту в Telegram сразу после сдачи посылки в отделение.`;
  }

  // Objections and scripts
  if (
    q.includes('дорого') ||
    q.includes('молчит') ||
    q.includes('не отвечает') ||
    q.includes('подумаю') ||
    q.includes('скрипт') ||
    q.includes('сообщен')
  ) {
    return `Готовые скрипты ответов клиентам для «${storeName}»:

1. Если клиент пишет «Дорого»:
«Понимаю вас! Мы держим эту цену, потому что используем оригинальное качество и проверяем каждую вещь перед отправкой. Плюс у вас есть возможность примерить товар при курьере. Оформить вам бесплатную доставку по Ташкенту сегодня?»

2. Если клиент сказал «Я подумаю» и пропал:
«Здравствуйте! Подскажите, пожалуйста, у вас остались вопросы по размеру или ткани? У нас осталось всего 2 единицы этой модели на складе в Ташкенте, могу забронировать ваш размер на пару часов, если хотите».

3. Дожим клиента с корзиной:
«Добрый день! Вижу, вы присматривали [Название товара]. Сегодня отправляем заказы курьером до 18:00. Хотите, привезём сегодня на примерку?»`;
  }

  // Payment methods
  if (
    q.includes('оплат') ||
    q.includes('payme') ||
    q.includes('click') ||
    q.includes('uzum') ||
    q.includes('карт') ||
    q.includes('перевод')
  ) {
    return `Настройка удобной оплаты для магазина «${storeName}»:

1. Перевод на карту (Click / Payme): самый популярный способ в Узбекистане. Укажите номер карты в подтверждающем сообщении после заказа на витрине и просите отправить чек в Telegram.
2. Оплата при получении (наличными или перевод курьеру): доверие к магазину возрастает в 2 раза, если клиент знает, что может расплатиться с курьером после осмотра.
3. Предоплата доставки: для отправок в другие города (Самарканд, Бухара, Фергана) берите предоплату стоимости доставки (30 000 сум), а остаток за товар — при получении.`;
  }

  // Product descriptions and photography
  if (
    q.includes('описан') ||
    q.includes('текст') ||
    q.includes('пост') ||
    q.includes('товар') ||
    q.includes('фото') ||
    q.includes('съемк')
  ) {
    return `Формула продающего описания товара для витрины:

1. Заголовок: Название модели + ключевое преимущество (например: «Худи оверсайз из плотного 100% хлопка»).
2. Характеристики списком:
• Материал: премиальный футер трехнитка с начесом.
• Размеры: M, L, XL (свободная посадка).
• Цвета: чернильно-черный, графит, молочный.
• Производство: премиум-фабрика, Ташкент.
3. Условия: «В наличии на складе в Ташкенте. Доставка курьером за 2 часа, отправка в регионы в день заказа».
4. Призыв к действию: «Выберите свой размер выше и нажмите Добавить в корзину».`;
  }

  // Default smart dynamic answer for any general question
  return `Отличный вопрос для развития магазина «${storeName}»!

Вот 3 практических шага с максимальным эффектом:
1. Каталог в 2 клика: покупатели в Instagram не любят ждать долгих ответов в Direct. С витриной BioMart клиент сразу видит актуальные размеры, цены и фото, нажимает «Оформить» — и заказ со всеми деталями мгновенно поступает вам в Telegram.
2. Прозрачность условий: добавьте в описание магазина информацию о быстрой доставке по Ташкенту и регионам Узбекистана. Это снимает главное сомнение перед первым заказом.
3. Активность в историях: публикуйте живые видео товаров с ссылкой на вашу витрину BioMart в закрепленных Stories и в описании профиля.

Напишите мне, какой конкретный товар или задачу вы хотите разобрать — текст поста, скрипт для переписки или акцию со скидкой!`;
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

    const conversationMessages =
      Array.isArray(messages) && messages.length > 0
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
- Отвечайте лаконично, точно, дружелюбно и по делу.
- Отвечайте на том языке, на котором написал продавец (русский или узбекский).`;

    // Try Groq models in order
    if (GROQ_API_KEY) {
      for (const model of CANDIDATE_MODELS) {
        try {
          const groqPayload = {
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationMessages,
            ],
            temperature: 0.6,
            max_tokens: 800,
          };

          const res = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(groqPayload),
          });

          if (res.ok) {
            const data = await res.json();
            const rawReply = data.choices?.[0]?.message?.content || '';
            if (rawReply.trim().length > 0) {
              const cleanedReply = cleanMarkdownText(rawReply);
              return NextResponse.json({ success: true, reply: cleanedReply, modelUsed: model });
            }
          }
        } catch (groqErr) {
          console.warn(`Groq fetch exception for model ${model}:`, groqErr);
        }
      }
    }

    // Smart contextual fallback (always clean, always helpful, no markdown)
    const fallbackReply = generateSmartFallback(lastUserMsg, storeName || 'Ваш магазин', category);
    return NextResponse.json({
      success: true,
      reply: cleanMarkdownText(fallbackReply),
      fallback: true,
    });
  } catch (err: any) {
    console.error('AI assistant route error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
