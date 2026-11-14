import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

const TELEGRAM_USERS_FILE = path.join(process.cwd(), 'data', 'telegram_users.json');

function registerUserServer(chatId: number | string, username?: string | null, firstName?: string | null, storeSlug?: string | null) {
  try {
    const dir = path.dirname(TELEGRAM_USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let data: Record<string, any> = {};
    if (fs.existsSync(TELEGRAM_USERS_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(TELEGRAM_USERS_FILE, 'utf-8'));
      } catch {
        data = {};
      }
    }

    const chatKey = String(chatId);
    const cleanUser = username ? username.replace(/^@/, '').toLowerCase().trim() : '';

    data[chatKey] = {
      chat_id: Number(chatId),
      username: cleanUser,
      first_name: firstName || '',
      updated_at: Date.now(),
    };

    if (cleanUser) {
      data[`@${cleanUser}`] = Number(chatId);
      data[cleanUser] = Number(chatId);
    }

    if (storeSlug) {
      data[`store_${storeSlug.toLowerCase()}`] = Number(chatId);
    }

    fs.writeFileSync(TELEGRAM_USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Telegram Webhook] Failed to register user:', err);
  }
}

async function sendTelegramMessage(botToken: string, chatId: number | string, text: string, replyMarkup?: any) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: replyMarkup,
      }),
    });
  } catch (err) {
    console.error('[Telegram Webhook] Send message error:', err);
  }
}

async function answerCallbackQuery(botToken: string, callbackQueryId: string, text?: string, showAlert: boolean = false) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch {}
}

export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || process.env.TG_BOT_TOKEN?.trim();
  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
  }

  try {
    const update = await req.json();

    // 1. Handle incoming Message
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = msg.text?.trim() || '';
      const from = msg.from || {};
      const username = from.username || null;
      const firstName = from.first_name || 'друг';

      if (!chatId) return NextResponse.json({ ok: true });

      // Automatically register user
      registerUserServer(chatId, username, firstName);

      // A. Command /start
      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const arg = parts[1] || '';

        // Deep-link /start bind_username_slug
        if (arg.startsWith('bind_')) {
          const bindParts = arg.split('_');
          const targetUser = bindParts[1] || (username || 'seller');
          const targetSlug = bindParts[2] || 'tashkent_drip';
          const storeName = targetSlug.replace(/_/g, ' ').toUpperCase();

          const bindText = `👋 <b>Здравствуйте, ${firstName}!</b>\n\n🏪 <b>Запрос на привязку витрины BioMart:</b>\nМагазин: <b>${storeName}</b> (<code>biomart.vercel.app/${targetSlug}</code>)\nЮзернейм: <code>@${username || targetUser}</code>\nВаш Chat ID: <code>${chatId}</code>\n\nРазрешаете ли вы официальному боту <b>BioMart</b> присылать вам мгновенные чеки заказов от ваших покупателей в этот чат?`;

          await sendTelegramMessage(botToken, chatId, bindText, {
            inline_keyboard: [
              [{ text: '✅ Да, подтверждаю привязку', callback_data: `confirm_bind_${targetSlug}` }],
              [{ text: '❌ Отклонить', callback_data: 'reject_bind' }],
            ],
          });
          return NextResponse.json({ ok: true });
        }

        // Deep-link /start getid
        if (arg.toLowerCase() === 'getid') {
          const userMention = username ? ` или юзернейм <code>@${username}</code>` : '';
          const idText = `🆔 <b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n<i>(Нажмите на номер выше, чтобы скопировать)</i>\n\n✅ <b>Готово! Бот запомнил ваш аккаунт.</b>\nВ панели управления BioMart (вкладка «Telegram») укажите этот Chat ID${userMention}.\n\n🚀 Теперь чеки всех новых заказов с вашей витрины будут мгновенно приходить прямо в этот чат!`;
          await sendTelegramMessage(botToken, chatId, idText);
          return NextResponse.json({ ok: true });
        }

        // Standard /start welcome
        const welcomeText = `👋 <b>Ассалому алейкум, ${firstName}! Добро пожаловать в официальный бот BioMart!</b>\n\n⚡ <b>BioMart</b> — платформа быстрых мобильных витрин для продавцов в Instagram и Telegram в Узбекистане.\n\n🆔 <b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n👤 <b>Ваш аккаунт:</b> <code>@${username || chatId}</code>\n\n<i>(Скопируйте этот номер или укажите ваш @username в кабинете BioMart → вкладка «Telegram», чтобы бот моментально присылал вам уведомления о каждом заказе!)</i>`;
        await sendTelegramMessage(botToken, chatId, welcomeText);
        return NextResponse.json({ ok: true });
      }

      // B. Command /myid or /id
      if (text === '/id' || text === '/myid' || text.toLowerCase() === 'id' || text.toLowerCase() === 'мой id') {
        const userHint = username ? `\n👤 <b>Ваш юзернейм:</b> <code>@${username}</code>` : '';
        const idText = `🆔 <b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n<i>(Нажмите на номер, чтобы скопировать)</i>${userHint}\n\n💡 <b>Как привязать приём заказов:</b>\nВставьте этот ID или ваш юзернейм <code>@${username || 'username'}</code> в панели управления BioMart (вкладка <b>Telegram</b>).`;
        await sendTelegramMessage(botToken, chatId, idText);
        return NextResponse.json({ ok: true });
      }

      // C. Catch-all text response
      const defaultText = `👋 Здравствуйте, <b>${firstName}</b>!\n\nЯ официальный бот платформы <b>BioMart</b>. Я помогаю продавцам мгновенно получать чеки заказов с витрин прямо сюда в Telegram.\n\n🆔 <b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n${username ? `👤 <b>Ваш юзернейм:</b> <code>@${username}</code>\n` : ''}\nВы можете указать этот ID или ваш @username в кабинете продавца BioMart, чтобы принимать чеки заказов.`;
      await sendTelegramMessage(botToken, chatId, defaultText);
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Callback Query
    if (update.callback_query) {
      const cb = update.callback_query;
      const data = cb.data || '';
      const chatId = cb.message?.chat?.id || cb.from?.id;
      const username = cb.from?.username || '';
      const firstName = cb.from?.first_name || '';

      if (data.startsWith('confirm_bind_')) {
        const storeSlug = data.replace('confirm_bind_', '').trim();
        registerUserServer(chatId, username, firstName, storeSlug);

        // Also update Supabase store record if configured
        if (isSupabaseConfigured && supabaseAdmin && storeSlug) {
          try {
            await supabaseAdmin
              .from('stores')
              .update({ telegram_chat_id: String(chatId) })
              .eq('slug', storeSlug);
          } catch {}
        }

        await answerCallbackQuery(botToken, cb.id, 'Привязка успешно подтверждена!', true);
        const confirmedText = `🎉 <b>Привязка успешно подтверждена!</b>\n\n✅ Ваш Telegram-аккаунт <code>@${username}</code> успешно подключён к магазину <code>${storeSlug}</code>.\n🆔 Ваш Chat ID: <code>${chatId}</code>\n\nТеперь при каждом заказе на вашей витрине вы моментально получите чек прямо сюда! 📦🚀`;
        await sendTelegramMessage(botToken, chatId, confirmedText);
        return NextResponse.json({ ok: true });
      }

      if (data === 'reject_bind') {
        await answerCallbackQuery(botToken, cb.id, 'Привязка отклонена');
        await sendTelegramMessage(botToken, chatId, '❌ Привязка витрины отклонена.');
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Telegram Webhook] Handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || process.env.TG_BOT_TOKEN?.trim();
  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const shouldSet = searchParams.get('set');

  // 1. Setup Webhook URL on Telegram
  if (shouldSet === '1') {
    const origin = req.headers.get('host')
      ? `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://biomart.vercel.app');

    const webhookUrl = `${origin}/api/telegram/webhook`;
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await res.json();
    return NextResponse.json({ webhookUrl, telegramResponse: data });
  }

  // 2. Return current Webhook Info
  const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
  const info = await infoRes.json();
  return NextResponse.json({ webhookInfo: info });
}
