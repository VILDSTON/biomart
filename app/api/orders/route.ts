import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { createOrderSchema, escapeTelegramHtml } from '@/lib/security';
import { MOCK_PRODUCTS, MOCK_STORE_SETTINGS } from '@/lib/mock-data';
import { OrderItem } from '@/types';

interface StoreMetaCache {
  id?: string;
  telegram_chat_id?: string;
  telegram_username?: string;
  promo_codes?: any[];
}

async function resolveSellerChatId(
  sellerChatId?: string,
  sellerUsername?: string,
  shopSlug?: string,
  cachedStore?: StoreMetaCache | null
): Promise<string | null> {
  // 1. If explicitly provided numeric chat id (or negative group chat id like -100...)
  if (sellerChatId && /^-?\d+$/.test(sellerChatId.trim())) {
    return sellerChatId.trim();
  }

  // 2. Collect candidate keys to check against mapping
  const candidates: string[] = [];
  if (sellerChatId) {
    const clean = sellerChatId.trim().toLowerCase().replace(/^@/, '');
    if (clean && !candidates.includes(clean)) candidates.push(clean);
  }
  if (sellerUsername) {
    const clean = sellerUsername.trim().toLowerCase().replace(/^@/, '');
    if (clean && !candidates.includes(clean)) candidates.push(clean);
  }
  if (shopSlug) {
    const cleanSlug = shopSlug.trim().toLowerCase();
    if (!candidates.includes(`store_${cleanSlug}`)) candidates.push(`store_${cleanSlug}`);
    if (!candidates.includes(cleanSlug)) candidates.push(cleanSlug);
  }

  // 3. Check data/telegram_users.json
  if (candidates.length > 0) {
    try {
      const mappingPath = path.join(process.cwd(), 'data', 'telegram_users.json');
      if (fs.existsSync(mappingPath)) {
        const raw = fs.readFileSync(mappingPath, 'utf-8');
        const mapping = JSON.parse(raw);
        for (const candidate of candidates) {
          // Direct check
          if (mapping[candidate]) {
            const val = mapping[candidate];
            const resolved = typeof val === 'object' ? val.chat_id : val;
            if (resolved) {
              console.log(`[Orders API] Resolved chat ID ${resolved} for candidate "${candidate}"`);
              return String(resolved);
            }
          }
          // @check
          if (mapping[`@${candidate}`]) {
            const val = mapping[`@${candidate}`];
            const resolved = typeof val === 'object' ? val.chat_id : val;
            if (resolved) {
              console.log(`[Orders API] Resolved chat ID ${resolved} for candidate "@${candidate}"`);
              return String(resolved);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Orders API] Could not read telegram_users.json:', e);
    }
  }

  // 4. Use cached Store record or query Supabase stores table if shop_slug is provided
  let storeRecord = cachedStore;
  if (!storeRecord && shopSlug && isSupabaseConfigured && supabaseAdmin) {
    try {
      const cleanSlug = shopSlug.trim().toLowerCase();
      const { data } = await supabaseAdmin
        .from('stores')
        .select('telegram_chat_id, telegram_username')
        .eq('slug', cleanSlug)
        .maybeSingle();
      if (data) storeRecord = data;
    } catch (err) {
      console.warn('[Orders API] Supabase store lookup failed:', err);
    }
  }

  if (storeRecord) {
    if (storeRecord.telegram_chat_id && /^-?\d+$/.test(String(storeRecord.telegram_chat_id).trim())) {
      return String(storeRecord.telegram_chat_id).trim();
    }
    if (storeRecord.telegram_username) {
      const cleanUser = storeRecord.telegram_username.trim().toLowerCase().replace(/^@/, '');
      try {
        const mappingPath = path.join(process.cwd(), 'data', 'telegram_users.json');
        if (fs.existsSync(mappingPath)) {
          const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
          const val = mapping[cleanUser] || mapping[`@${cleanUser}`];
          const resolved = typeof val === 'object' ? val.chat_id : val;
          if (resolved) return String(resolved);
        }
      } catch {}
    }
  }

  // 5. Fallback to process.env.TELEGRAM_CHAT_ID default
  return process.env.TELEGRAM_CHAT_ID?.trim() || null;
}

export async function POST(request: Request) {
  try {
    // 1. IP Rate Limiting: Max 5 orders per 10 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`order_${clientIp}`, 5, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Слишком много заказов с вашего устройства. Пожалуйста, подождите 10 минут перед повторным заказом.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 2. Honeypot check: Bots fill out hidden fields, humans never see them
    if (body.website_url) {
      console.warn(`[Security] Honeypot triggered by IP ${clientIp}`);
      return NextResponse.json({
        success: true,
        order: {
          id: Math.floor(1000 + Math.random() * 9000),
          shop_slug: body.shop_slug || 'tashkent_drip',
          customer_name: 'Customer',
          customer_phone: '+998900000000',
          delivery_type: 'pickup',
          address: '',
          comment: '',
          items: [],
          total_price: 0,
          status: 'new' as const,
          created_at: new Date().toISOString(),
        },
        savedToSupabase: false,
        telegramSent: false,
        demoMode: true,
      });
    }

    // 3. Zod Schema Validation
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Некорректные данные заказа';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      shop_slug,
      seller_chat_id,
      seller_username,
      customer_name,
      customer_phone,
      customer_telegram,
      delivery_type,
      payment_method,
      address,
      comment,
      promo_code,
      items: incomingItems,
    } = validation.data;

    if (delivery_type === 'delivery' && !address?.trim()) {
      return NextResponse.json(
        { error: 'Укажите адрес доставки для курьера' },
        { status: 400 }
      );
    }

    // Single unified store query to avoid multiple round-trips to Supabase
    let storeRecord: StoreMetaCache | null = null;
    if (shop_slug && isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from('stores')
          .select('id, telegram_chat_id, telegram_username, promo_codes')
          .eq('slug', shop_slug.trim().toLowerCase())
          .maybeSingle();
        if (data) {
          storeRecord = data;
        }
      } catch (err) {
        console.warn('[Orders API] Store lookup error:', err);
      }
    }

    // 4. Server-Side Price Lookup & Recalculation (Authoritative)
    // Never trust client cart item prices to prevent malicious client price alterations!
    let validatedItems: OrderItem[] = [];
    let authoritativeSubtotal = 0;

    // Only query specific products ordered rather than select('*') from whole catalog!
    // Saves massive DB bandwidth and memory on Supabase free tier.
    const productIds = incomingItems.map((i) => i.product_id);
    let serverCatalog = MOCK_PRODUCTS;

    if (isSupabaseConfigured && supabaseAdmin && productIds.length > 0) {
      try {
        const { data: dbProducts } = await supabaseAdmin
          .from('products')
          .select('id, title, price, in_stock, images')
          .in('id', productIds)
          .eq('is_active', true);
        if (dbProducts && dbProducts.length > 0) {
          serverCatalog = dbProducts as any;
        }
      } catch (err) {
        console.warn('Failed to query products from Supabase, using local catalog fallback:', err);
      }
    }

    for (const item of incomingItems) {
      const product = serverCatalog.find((p) => p.id === item.product_id);
      if (!product) {
        // Fallback for custom added local items
        const unitPrice = typeof item.price === 'number' && item.price > 0 ? item.price : 100000;
        const itemTotal = unitPrice * item.quantity;
        authoritativeSubtotal += itemTotal;
        validatedItems.push({
          product_id: item.product_id,
          title: item.title || 'Товар',
          size: item.size || null,
          price: unitPrice,
          quantity: item.quantity,
          image: '',
        });
        continue;
      }

      if (!product.in_stock) {
        return NextResponse.json(
          { error: `Товар «${product.title}» сейчас закончился на складе` },
          { status: 400 }
        );
      }

      const verifiedUnitPrice = product.price;
      const itemTotal = verifiedUnitPrice * item.quantity;
      authoritativeSubtotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        title: product.title,
        size: item.size || null,
        price: verifiedUnitPrice,
        quantity: item.quantity,
        image: product.images?.[0] || '',
      });
    }

    // Server-side promo code verification (supports database and mock store promo codes)
    let discountAmount = 0;
    let verifiedPromoCode: string | null = null;
    if (promo_code) {
      const cleanPromo = promo_code.trim().toUpperCase();
      let availablePromos = [...(MOCK_STORE_SETTINGS.promo_codes || [])];

      if (storeRecord?.promo_codes && Array.isArray(storeRecord.promo_codes)) {
        availablePromos = [...storeRecord.promo_codes, ...availablePromos];
      }

      const validPromo = availablePromos.find(
        (p: any) => p.code?.toUpperCase() === cleanPromo && (p.active !== false)
      );

      if (validPromo) {
        verifiedPromoCode = validPromo.code;
        discountAmount = Math.round((authoritativeSubtotal * (validPromo.discount_percent || 0)) / 100);
      }
    }

    const authoritativeTotalPrice = Math.max(0, authoritativeSubtotal - discountAmount);

    const randomOrderId = Math.floor(1000 + Math.random() * 9000);
    let orderId: number | string = randomOrderId;
    let savedToSupabase = false;

    // 5. Save to Supabase if configured
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const storeId = storeRecord?.id || null;

        const fullComment = [
          comment?.trim() || null,
          customer_telegram ? `TG клиента: ${customer_telegram.startsWith('@') ? customer_telegram : `@${customer_telegram}`}` : null,
          payment_method === 'card' ? 'Оплата: Перевод на карту (Click/Payme)' : 'Оплата: Наличными при получении',
        ].filter(Boolean).join('\n');

        const insertPayload: Record<string, any> = {
          customer_name: customer_name.trim(),
          customer_phone: customer_phone.trim(),
          delivery_type,
          address: delivery_type === 'delivery' ? address?.trim() : null,
          comment: fullComment || null,
          items: validatedItems,
          total_price: authoritativeTotalPrice,
          promo_code: verifiedPromoCode,
          discount_amount: discountAmount,
          status: 'new',
        };
        if (storeId) {
          insertPayload.store_id = storeId;
        }

        const { data: dbOrder, error: dbError } = await supabaseAdmin
          .from('orders')
          .insert(insertPayload)
          .select('id')
          .single();

        if (!dbError && dbOrder) {
          orderId = dbOrder.id;
          savedToSupabase = true;
        } else {
          console.warn('Supabase insert warning:', dbError?.message);
        }
      } catch (err) {
        console.warn('Supabase insert exception:', err);
      }
    }

    // 6. Format Telegram Notification Message (Strict HTML Sanitization)
    const deliveryTitle = delivery_type === 'delivery' ? 'Доставка курьером' : 'Самовывоз из магазина';
    const cleanAddress = address ? address.trim() : '';
    const yandexMapsUrl = cleanAddress
      ? `https://yandex.ru/maps/?text=${encodeURIComponent(cleanAddress)}`
      : '';

    const addressLine =
      delivery_type === 'delivery'
        ? `<b>Адрес доставки:</b> ${escapeTelegramHtml(cleanAddress)}\n${
            yandexMapsUrl
              ? `<a href="${yandexMapsUrl}">Открыть адрес в Яндекс Картах</a>\n`
              : ''
          }`
        : '<b>Адрес:</b> Самовывоз из магазина\n';

    const commentLine = comment?.trim()
      ? `<b>Комментарий:</b> <i>${escapeTelegramHtml(comment.trim())}</i>\n`
      : '';

    const promoLine = verifiedPromoCode
      ? `<b>Промокод:</b> <code>${escapeTelegramHtml(verifiedPromoCode)}</code> (-${formatPrice(discountAmount)})\n`
      : '';

    const itemsFormatted = validatedItems
      .map((item) => {
        const sizeInfo = item.size ? ` (${escapeTelegramHtml(item.size)})` : '';
        return `• <b>${escapeTelegramHtml(item.title)}</b>${sizeInfo}\n  — ${item.quantity} шт. × ${formatPrice(item.price)}`;
      })
      .join('\n\n');

    const cleanPhone = customer_phone.replace(/[^\d+]/g, '');
    const cleanTg = customer_telegram?.trim().replace(/^@/, '');
    const shopBadge = shop_slug ? `\n<b>Магазин:</b> biomart.vercel.app/${escapeTelegramHtml(shop_slug)}` : '';
    const paymentTitle = payment_method === 'card' ? '💳 Перевод на карту (Click / Payme)' : '💵 Наличными при получении';
    const tgLine = cleanTg ? `<b>Telegram клиента:</b> <a href="https://t.me/${cleanTg}">@${escapeTelegramHtml(cleanTg)}</a>\n` : '';

    const tgMessage = `<b>НОВЫЙ ЗАКАЗ #${orderId}</b>${shopBadge}

<b>Клиент:</b> ${escapeTelegramHtml(customer_name.trim())}
<b>Телефон:</b> <a href="tel:${cleanPhone}">${escapeTelegramHtml(customer_phone.trim())}</a>
${tgLine}<b>Способ получения:</b> ${deliveryTitle}
<b>Способ оплаты:</b> ${paymentTitle}
${addressLine}${commentLine}${promoLine}
<b>Состав заказа:</b>
${itemsFormatted}

<b>ИТОГО К ОПЛАТЕ: ${formatPrice(authoritativeTotalPrice)}</b>`;

    // 7. Resolve Seller Telegram Chat ID (Multi-tenant with Username / Chat ID mapping)
    const botToken =
      process.env.TELEGRAM_BOT_TOKEN?.trim() ||
      process.env.TG_BOT_TOKEN?.trim();
    const targetChatId = await resolveSellerChatId(seller_chat_id, seller_username, shop_slug, storeRecord);
    let telegramSent = false;
    let telegramError = null;

    if (botToken && targetChatId) {
      console.log(`[Orders API] Dispatching order #${orderId} to Telegram chat ${targetChatId}`);
      const inlineButtons: Array<Array<{ text: string; url: string }>> = [];

      if (cleanTg) {
        inlineButtons.push([
          {
            text: `💬 Telegram клиента (@${cleanTg})`,
            url: `https://t.me/${cleanTg}`,
          },
        ]);
      }

      const phoneDigits = cleanPhone.replace(/\D/g, '');
      if (phoneDigits) {
        inlineButtons.push([
          {
            text: '💬 Чат в Telegram',
            url: `https://t.me/+${phoneDigits}`,
          },
          {
            text: '📞 Позвонить клиенту',
            url: `tel:+${phoneDigits}`,
          },
        ]);
      }

      if (delivery_type === 'delivery' && yandexMapsUrl) {
        inlineButtons.push([
          {
            text: '📍 Открыть в Яндекс Картах',
            url: yandexMapsUrl,
          },
        ]);
      }

      try {
        const tgRes = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChatId,
              text: tgMessage,
              parse_mode: 'HTML',
              disable_web_page_preview: true,
              reply_markup: {
                inline_keyboard: inlineButtons,
              },
            }),
          }
        );

        const tgData = await tgRes.json();
        if (tgData.ok) {
          telegramSent = true;
        } else {
          telegramError = tgData.description || 'Unknown Telegram error';
          console.error('Telegram Bot API response error:', tgData);
        }
      } catch (err: any) {
        telegramError = err?.message || 'Network error sending to Telegram';
        console.error('Telegram notification fetch failed:', err);
      }
    } else {
      console.log('Telegram notifications skipped (no bot token or target chat id configured)');
    }

    const orderRecord = {
      id: orderId,
      shop_slug: shop_slug || 'tashkent_drip',
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_telegram: cleanTg ? `@${cleanTg}` : undefined,
      delivery_type,
      payment_method: payment_method || 'cash',
      address: delivery_type === 'delivery' ? (address?.trim() || '') : '',
      comment: comment?.trim() || '',
      items: validatedItems,
      total_price: authoritativeTotalPrice,
      promo_code: verifiedPromoCode || undefined,
      discount_amount: discountAmount || undefined,
      status: 'new' as const,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      order: orderRecord,
      savedToSupabase,
      telegramSent,
      telegramError,
      demoMode: !isSupabaseConfigured,
    });
  } catch (error: any) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Внутренняя ошибка сервера при оформлении заказа' },
      { status: 500 }
    );
  }
}
