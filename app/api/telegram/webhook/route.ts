import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { FOUNDER_TELEGRAM_ID, ADMIN_TELEGRAM_IDS, SITE_URL } from '@/lib/constants';
import {
  setStoreVerifiedInFile,
  isStoreVerifiedInFile,
  setStoreBannedInFile,
  getAllRegisteredStores,
} from '@/lib/telegram';

const TELEGRAM_USERS_FILE = path.join(process.cwd(), 'data', 'telegram_users.json');

function getTelegramUsersFilePath(): string {
  try {
    const dir = path.dirname(TELEGRAM_USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return TELEGRAM_USERS_FILE;
  } catch {
    const tmpDir = path.join('/tmp', 'biomart_data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {}
    return path.join(tmpDir, 'telegram_users.json');
  }
}

function isFounder(chatId: string | number): boolean {
  const strId = String(chatId);
  return strId === '5504101440' || ADMIN_TELEGRAM_IDS.includes(strId);
}

function registerUserServer(chatId: number | string, username?: string | null, firstName?: string | null, storeSlug?: string | null) {
  try {
    const filePath = getTelegramUsersFilePath();
    let data: Record<string, any> = {};
    if (fs.existsSync(filePath)) {
      try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
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

async function editTelegramMessage(botToken: string, chatId: number | string, messageId: number, text: string, replyMarkup?: any) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: replyMarkup,
      }),
    });
  } catch (err) {
    console.error('[Telegram Webhook] Edit message error:', err);
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

  // Verify secret token from Telegram if configured
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || process.env.TG_WEBHOOK_SECRET?.trim();
  if (expectedSecret) {
    const receivedSecret = req.headers.get('x-telegram-bot-api-secret-token');
    if (receivedSecret !== expectedSecret) {
      console.warn('[Telegram Webhook] Request rejected: invalid secret token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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
      const founder = isFounder(chatId);

      if (!chatId) return NextResponse.json({ ok: true });

      // Automatically register user
      registerUserServer(chatId, username, firstName);

      // --- FOUNDER / ADMIN COMMANDS ---
      if (founder) {
        if (text === '/admin' || text === '👑 Панель Основателя') {
          const registered = getAllRegisteredStores();
          const count = Object.keys(registered).length || 2;
          const adminText = `👑 <b>ПАНЕЛЬ УПРАВЛЕНИЯ ОСНОВАТЕЛЯ BIOMART</b>\n━━━━━━━━━━━━━━━━━━━━━\n👋 Приветствуем, <b>${firstName}</b>!\nВаш ID подтверждён: <code>${chatId}</code> (SuperAdmin)\n\n📊 <b>Сводка платформы:</b>\n• Зарегистрированных магазинов: <b>${count}</b>\n• Статус бота: 🟢 Активен\n\n🛠 <b>Команды администратора:</b>\n• <code>/verify &lt;slug&gt;</code> — выдать галочку Verified\n• <code>/unverify &lt;slug&gt;</code> — снять галочку Verified\n• <code>/stores</code> — список всех магазинов\n• <code>/ban &lt;slug&gt;</code> — заблокировать магазин`;

          const kb = {
            inline_keyboard: [
              [
                { text: '🏪 Список магазинов', callback_data: 'admin_stores' },
                { text: '🌐 Открыть BioMart', url: SITE_URL },
              ],
            ],
          };
          await sendTelegramMessage(botToken, chatId, adminText, kb);
          return NextResponse.json({ ok: true });
        }

        if (text.startsWith('/verify')) {
          const slug = text.replace('/verify', '').trim().toLowerCase();
          if (!slug) {
            await sendTelegramMessage(botToken, chatId, 'ℹ️ Укажите слаг магазина. Пример: <code>/verify tashkent_drip</code>');
            return NextResponse.json({ ok: true });
          }

          setStoreVerifiedInFile(slug, true);
          if (isSupabaseConfigured && supabaseAdmin) {
            try {
              await supabaseAdmin.from('stores').update({ is_verified: true, status: 'published' }).eq('slug', slug);
            } catch {}
          }

          await sendTelegramMessage(
            botToken,
            chatId,
            `🎉 <b>МАГАЗИН ВЕРИФИЦИРОВАН!</b>\n\n✅ Магазину <code>${slug}</code> успешно присвоен статус <b>Verified</b>!\nНа витрине активирован официальный бейдж доверия.\n\n🔗 <a href="${SITE_URL}/${slug}">${SITE_URL}/${slug}</a>`
          );
          return NextResponse.json({ ok: true });
        }

        if (text.startsWith('/unverify')) {
          const slug = text.replace('/unverify', '').trim().toLowerCase();
          if (!slug) {
            await sendTelegramMessage(botToken, chatId, 'Пример: <code>/unverify tashkent_drip</code>');
            return NextResponse.json({ ok: true });
          }

          setStoreVerifiedInFile(slug, false);
          if (isSupabaseConfigured && supabaseAdmin) {
            try {
              await supabaseAdmin.from('stores').update({ is_verified: false }).eq('slug', slug);
            } catch {}
          }

          await sendTelegramMessage(botToken, chatId, `⚪ Верификация с магазина <code>${slug}</code> успешно снята.`);
          return NextResponse.json({ ok: true });
        }

        if (text === '/stores') {
          const registered = getAllRegisteredStores();
          const items = Object.entries(registered);
          if (items.length === 0) {
            await sendTelegramMessage(botToken, chatId, 'В системе пока нет зарегистрированных магазинов.');
            return NextResponse.json({ ok: true });
          }

          const lines = ['🏪 <b>СПИСОК МАГАЗИНОВ BIOMART:</b>\n━━━━━━━━━━━━━━━━━━━━━'];
          const keyboardRows: any[] = [];

          for (const [slug, data] of items) {
            const isV = isStoreVerifiedInFile(slug);
            const statusMark = isV ? '✅ Verified' : '🟡 На проверке';
            lines.push(`• <b>${data.store_name || slug}</b> (<code>${slug}</code>)\n  └ ${statusMark} | Тел: ${data.phone || '—'}`);
            keyboardRows.push([
              { text: isV ? `⚙️ ${slug}` : `✅ Выдать Verified: ${slug}`, callback_data: `verify_${slug}` },
              { text: '🌐 Витрина', url: `${SITE_URL}/${slug}` },
            ]);
          }

          await sendTelegramMessage(botToken, chatId, lines.join('\n\n'), { inline_keyboard: keyboardRows });
          return NextResponse.json({ ok: true });
        }
      }

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

          const bindText = `👋 <b>Здравствуйте, ${firstName}!</b>\n\n🏪 <b>Запрос на привязку витрины BioMart:</b>\nМагазин: <b>${storeName}</b> (<code>${SITE_URL}/${targetSlug}</code>)\nЮзернейм: <code>@${username || targetUser}</code>\nВаш Chat ID: <code>${chatId}</code>\n\nРазрешаете ли вы официальному боту <b>BioMart</b> присылать вам мгновенные чеки заказов от ваших покупателей в этот чат?`;

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
        const founderWelcome = founder
          ? `\n\n👑 <b>Вы авторизованы как Основатель платформы!</b>\nНажмите /admin для перехода в панель управления.`
          : '';

        const welcomeText = `👋 <b>Ассалому алейкум, ${firstName}! Добро пожаловать в официальный бот BioMart!</b>\n\n⚡ <b>BioMart</b> — платформа быстрых мобильных витрин для продавцов в Instagram и Telegram в Узбекистане.\n\n🆔 <b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n👤 <b>Ваш аккаунт:</b> <code>@${username || chatId}</code>\n\n<i>(Скопируйте этот номер или укажите ваш @username в кабинете BioMart → вкладка «Telegram», чтобы бот моментально присылал вам уведомления о каждом заказе!)</i>${founderWelcome}`;

        const welcomeKb = founder
          ? { inline_keyboard: [[{ text: '👑 Панель Основателя', callback_data: 'admin_panel' }]] }
          : undefined;

        await sendTelegramMessage(botToken, chatId, welcomeText, welcomeKb);
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
      const messageId = cb.message?.message_id;

      // FOUNDER VERIFY STORE
      if (data.startsWith('verify_')) {
        if (!isFounder(chatId)) {
          await answerCallbackQuery(botToken, cb.id, '❌ Доступ только для основателя', true);
          return NextResponse.json({ ok: true });
        }

        const slug = data.replace('verify_', '').trim().toLowerCase();
        setStoreVerifiedInFile(slug, true);

        if (isSupabaseConfigured && supabaseAdmin) {
          try {
            await supabaseAdmin.from('stores').update({ is_verified: true, status: 'published' }).eq('slug', slug);
          } catch {}
        }

        await answerCallbackQuery(botToken, cb.id, `Магазин ${slug} верифицирован! ✅`, true);

        if (messageId) {
          const orig = cb.message?.text || '';
          const updated = `${orig}\n\n🟢 <b>Статус: ВЕРИФИЦИРОВАН (Verified ✅)</b>\n<i>Подтверждено основателем платформы</i>`;
          const kb = {
            inline_keyboard: [
              [
                { text: '🌐 Открыть витрину', url: `${SITE_URL}/${slug}` },
                { text: '⚪ Снять верификацию', callback_data: `unverify_${slug}` },
              ],
            ],
          };
          await editTelegramMessage(botToken, chatId, messageId, updated, kb);
        }
        return NextResponse.json({ ok: true });
      }

      // FOUNDER UNVERIFY STORE
      if (data.startsWith('unverify_')) {
        if (!isFounder(chatId)) {
          await answerCallbackQuery(botToken, cb.id, '❌ Доступ только для основателя', true);
          return NextResponse.json({ ok: true });
        }

        const slug = data.replace('unverify_', '').trim().toLowerCase();
        setStoreVerifiedInFile(slug, false);

        if (isSupabaseConfigured && supabaseAdmin) {
          try {
            await supabaseAdmin.from('stores').update({ is_verified: false }).eq('slug', slug);
          } catch {}
        }

        await answerCallbackQuery(botToken, cb.id, `Верификация магазина ${slug} снята`, true);
        if (messageId) {
          const kb = {
            inline_keyboard: [
              [
                { text: '✅ Выдать Verified', callback_data: `verify_${slug}` },
                { text: '🌐 Открыть витрину', url: `${SITE_URL}/${slug}` },
              ],
            ],
          };
          await editTelegramMessage(botToken, chatId, messageId, `${cb.message?.text}\n\n⚪ <b>Верификация снята.</b>`, kb);
        }
        return NextResponse.json({ ok: true });
      }

      // FOUNDER BAN STORE
      if (data.startsWith('ban_')) {
        if (!isFounder(chatId)) {
          await answerCallbackQuery(botToken, cb.id, '❌ Доступ только для основателя', true);
          return NextResponse.json({ ok: true });
        }

        const slug = data.replace('ban_', '').trim().toLowerCase();
        setStoreBannedInFile(slug, true);
        setStoreVerifiedInFile(slug, false);

        if (isSupabaseConfigured && supabaseAdmin) {
          try {
            await supabaseAdmin.from('stores').update({ status: 'rejected', is_verified: false }).eq('slug', slug);
          } catch {}
        }

        await answerCallbackQuery(botToken, cb.id, `Магазин ${slug} заблокирован! 🚫`, true);
        if (messageId) {
          await editTelegramMessage(botToken, chatId, messageId, `${cb.message?.text}\n\n🔴 <b>Статус: ЗАБЛОКИРОВАН АДМИНИСТРАТОРОМ</b>`);
        }
        return NextResponse.json({ ok: true });
      }

      // FOUNDER ADMIN PANEL
      if (data === 'admin_panel') {
        if (!isFounder(chatId)) {
          await answerCallbackQuery(botToken, cb.id, '❌ Доступ только для основателя', true);
          return NextResponse.json({ ok: true });
        }
        await answerCallbackQuery(botToken, cb.id);
        const registered = getAllRegisteredStores();
        const count = Object.keys(registered).length || 2;
        const text = `👑 <b>ПАНЕЛЬ УПРАВЛЕНИЯ ОСНОВАТЕЛЯ BIOMART</b>\n━━━━━━━━━━━━━━━━━━━━━\n📊 Магазинов в базе: <b>${count}</b>\n\nКоманды:\n• <code>/verify &lt;slug&gt;</code>\n• <code>/stores</code>\n• <code>/ban &lt;slug&gt;</code>`;
        await sendTelegramMessage(botToken, chatId, text, {
          inline_keyboard: [[{ text: '🏪 Список магазинов', callback_data: 'admin_stores' }]],
        });
        return NextResponse.json({ ok: true });
      }

      // MERCHANT CONFIRM BIND
      if (data.startsWith('confirm_bind_')) {
        const storeSlug = data.replace('confirm_bind_', '').trim();
        registerUserServer(chatId, username, firstName, storeSlug);

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
      : (process.env.NEXT_PUBLIC_BASE_URL || SITE_URL);

    const webhookUrl = `${origin}/api/telegram/webhook`;
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || process.env.TG_WEBHOOK_SECRET?.trim();
    const setWebhookUrl = new URL(`https://api.telegram.org/bot${botToken}/setWebhook`);
    setWebhookUrl.searchParams.set('url', webhookUrl);
    if (expectedSecret) {
      setWebhookUrl.searchParams.set('secret_token', expectedSecret);
    }
    const res = await fetch(setWebhookUrl.toString());
    const data = await res.json();
    return NextResponse.json({ webhookUrl, telegramResponse: data });
  }

  // 2. Return current Webhook Info
  const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
  const info = await infoRes.json();
  return NextResponse.json({ webhookInfo: info });
}
