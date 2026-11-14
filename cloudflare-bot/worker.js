/**
 * BioMart Official Telegram Bot — Cloudflare Worker (24/7 Serverless Edge)
 * Bot Username: @BioMartAssistant_bot
 * 
 * Runs 24/7 on Cloudflare Edge with 0ms cold starts and 100,000 free requests/day.
 */

const DEFAULT_WEB_URL = "https://biomart.vercel.app";

function formatSum(amount) {
  if (!amount) return "0 сум";
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " сум";
}

async function sendTelegram(botToken, method, payload) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error(`[Cloudflare Bot] Telegram ${method} error:`, err);
    return { ok: false, error: err.message };
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const botToken = env?.TELEGRAM_BOT_TOKEN || "";
    const webUrl = env?.BASE_WEB_URL || DEFAULT_WEB_URL;

    // 1. Health check & status endpoint
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "online",
          bot: "@BioMartAssistant_bot",
          platform: "Cloudflare Workers (24/7 Edge)",
          timestamp: new Date().toISOString(),
          endpoints: {
            webhook: "POST / or POST /webhook",
            set_webhook: "GET /set-webhook",
            get_webhook: "GET /get-webhook",
            notify_order: "POST /notify-order",
          },
        }, null, 2),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Set Webhook Utility (1-click activation)
    if (url.pathname === "/set-webhook") {
      const workerWebhookUrl = `${url.origin}/webhook`;
      const tgRes = await sendTelegram(botToken, "setWebhook", {
        url: workerWebhookUrl,
        allowed_updates: ["message", "callback_query"],
      });
      return new Response(
        JSON.stringify({
          message: "Webhook registration dispatched to Telegram API",
          webhook_url: workerWebhookUrl,
          telegram_response: tgRes,
        }, null, 2),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Webhook status check
    if (url.pathname === "/get-webhook") {
      const tgRes = await sendTelegram(botToken, "getWebhookInfo", {});
      return new Response(JSON.stringify(tgRes, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Delete webhook (if user wants to revert to local polling)
    if (url.pathname === "/delete-webhook") {
      const tgRes = await sendTelegram(botToken, "deleteWebhook", { drop_pending_updates: false });
      return new Response(JSON.stringify(tgRes, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Direct Order Notification Endpoint
    // Allows Vercel / local Next.js to trigger order checks via this worker
    if (url.pathname === "/notify-order" && request.method === "POST") {
      try {
        const body = await request.json();
        const { chat_id, text, reply_markup } = body;
        if (!chat_id || !text) {
          return new Response(JSON.stringify({ error: "chat_id and text required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const result = await sendTelegram(botToken, "sendMessage", {
          chat_id,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup,
        });
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 6. Handle Telegram Webhook POST updates
    if (request.method === "POST") {
      let update;
      try {
        update = await request.json();
      } catch (err) {
        return new Response("Invalid JSON", { status: 400 });
      }

      // --- A. Handle Callback Queries (Button Clicks) ---
      if (update.callback_query) {
        const cb = update.callback_query;
        const data = cb.data || "";
        const chatId = cb.message?.chat?.id || cb.from?.id;
        const username = cb.from?.username || "";
        const firstName = cb.from?.first_name || "друг";

        // Answer callback query so button doesn't spin
        await sendTelegram(botToken, "answerCallbackQuery", {
          callback_query_id: cb.id,
          text: data.startsWith("confirm_bind_") ? "Привязка успешно подтверждена!" : undefined,
          show_alert: data.startsWith("confirm_bind_"),
        });

        // Confirm binding
        if (data.startsWith("confirm_bind_")) {
          const targetSlug = data.replace("confirm_bind_", "").trim();
          const userStr = username ? `@${username}` : `ID: ${chatId}`;

          const confirmedText = 
            `🎉 <b>Привязка успешно подтверждена!</b>\n\n` +
            `✅ Ваш Telegram-аккаунт <code>${userStr}</code> успешно подключён к магазину <code>${targetSlug}</code>.\n` +
            `🆔 Ваш Chat ID: <code>${chatId}</code>\n\n` +
            `Теперь при каждом заказе на вашей витрине вы моментально получите чек прямо сюда! 📦🚀`;

          const kb = {
            inline_keyboard: [
              [{ text: "🛍 Открыть витрину магазина", url: `${webUrl}/${targetSlug}` }],
              [{ text: "📦 Получить тестовый чек", callback_data: `demo_receipt_${targetSlug}` }],
              [{ text: "⚙️ Панель продавца BioMart", url: `${webUrl}/dashboard?tab=telegram` }],
            ],
          };

          if (cb.message?.message_id) {
            await sendTelegram(botToken, "editMessageText", {
              chat_id: chatId,
              message_id: cb.message.message_id,
              text: confirmedText,
              parse_mode: "HTML",
              reply_markup: kb,
            });
          } else {
            await sendTelegram(botToken, "sendMessage", {
              chat_id: chatId,
              text: confirmedText,
              parse_mode: "HTML",
              reply_markup: kb,
            });
          }

          // Optional: Notify BioMart backend webhook to save binding in Supabase
          ctx?.waitUntil?.(
            fetch(`${webUrl}/api/telegram/webhook`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(update),
            }).catch(() => null)
          );

          return new Response("OK", { status: 200 });
        }

        // Reject binding
        if (data === "reject_bind") {
          if (cb.message?.message_id) {
            await sendTelegram(botToken, "editMessageText", {
              chat_id: chatId,
              message_id: cb.message.message_id,
              text: "❌ <b>Привязка витрины отклонена.</b>\nВы можете привязать магазин позже в любое время.",
              parse_mode: "HTML",
            });
          }
          return new Response("OK", { status: 200 });
        }

        // Demo receipt
        if (data.startsWith("demo_receipt")) {
          const demoText = 
            `<b>НОВЫЙ ЗАКАЗ #4892</b>\n` +
            `<b>Магазин:</b> biomart.vercel.app/tashkent_drip\n\n` +
            `<b>Клиент:</b> Сардор Рахимов\n` +
            `<b>Телефон:</b> <a href="tel:+998901234567">+998 90 123 45 67</a>\n` +
            `<b>Способ получения:</b> Доставка курьером (Yandex)\n` +
            `<b>Адрес:</b> г. Ташкент, Мирзо-Улугбекский р-н, ул. Мустакиллик 42\n` +
            `<b>Комментарий:</b> <i>«Позвонить за 15 минут, домофон работает»</i>\n` +
            `<b>Промокод:</b> <code>SPRING10</code> (-32 000 сум)\n\n` +
            `<b>Состав заказа:</b>\n` +
            `• <b>Худи Оверсайз «Ташкент» Drip Edition</b> (L)\n  — 1 шт. × 320 000 сум\n\n` +
            `<b>ИТОГО К ОПЛАТЕ: 288 000 сум</b>`;

          const demoKb = {
            inline_keyboard: [
              [
                { text: "💬 Чат в Telegram с клиентом", url: "https://t.me/xsakm" },
              ],
              [
                { text: "📍 Открыть в Яндекс Картах", url: "https://yandex.uz/maps/?text=Tashkent+Mustaqillik+42" },
              ],
            ],
          };

          await sendTelegram(botToken, "sendMessage", {
            chat_id: chatId,
            text: demoText,
            parse_mode: "HTML",
            reply_markup: demoKb,
          });
          return new Response("OK", { status: 200 });
        }
      }

      // --- B. Handle Incoming Messages ---
      if (update.message) {
        const msg = update.message;
        const chatId = msg.chat?.id;
        const text = msg.text?.trim() || "";
        const from = msg.from || {};
        const username = from.username || "";
        const firstName = from.first_name || "друг";

        if (!chatId) return new Response("OK", { status: 200 });

        // Forward to Next.js webhook async in background if available
        ctx?.waitUntil?.(
          fetch(`${webUrl}/api/telegram/webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(update),
          }).catch(() => null)
        );

        // 1. Command: /start
        if (text.startsWith("/start")) {
          const parts = text.split(" ");
          const arg = parts[1] || "";

          // Deep link: /start bind_username_slug
          if (arg.startsWith("bind_")) {
            const bindParts = arg.split("_");
            const targetUser = bindParts[1] || (username || "seller");
            const targetSlug = bindParts[2] || "market";
            const storeName = targetSlug.replace(/_/g, " ").toUpperCase();

            const bindText = 
              `👋 <b>Здравствуйте, ${firstName}!</b>\n\n` +
              `🏪 <b>Запрос на привязку витрины BioMart:</b>\n` +
              `Магазин: <b>${storeName}</b> (<code>biomart.vercel.app/${targetSlug}</code>)\n` +
              `Юзернейм: <code>@${username || targetUser}</code>\n` +
              `Ваш Chat ID: <code>${chatId}</code>\n\n` +
              `Разрешаете ли вы официальному боту <b>BioMart</b> присылать вам мгновенные чеки заказов от ваших покупателей в этот чат?`;

            const bindKb = {
              inline_keyboard: [
                [{ text: "✅ Да, подтверждаю привязку", callback_data: `confirm_bind_${targetSlug}` }],
                [{ text: "❌ Отклонить", callback_data: "reject_bind" }],
              ],
            };

            await sendTelegram(botToken, "sendMessage", {
              chat_id: chatId,
              text: bindText,
              parse_mode: "HTML",
              reply_markup: bindKb,
            });
            return new Response("OK", { status: 200 });
          }

          // Deep link: /start getid
          if (arg.toLowerCase() === "getid") {
            const userMention = username ? ` или юзернейм <code>@${username}</code>` : "";
            const idText = 
              `🆔 <b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n` +
              `<i>(Нажмите на номер выше, чтобы скопировать)</i>\n\n` +
              `✅ <b>Готово! Бот запомнил ваш аккаунт.</b>\n` +
              `В панели управления BioMart (вкладка «Telegram») укажите этот Chat ID${userMention}.\n\n` +
              `🚀 Теперь чеки всех новых заказов с вашей витрины будут мгновенно приходить прямо в этот чат!`;

            const idKb = {
              inline_keyboard: [
                [{ text: "⚙️ Открыть кабинет BioMart", url: `${webUrl}/dashboard?tab=telegram` }],
                [{ text: "📦 Получить демо-чек", callback_data: "demo_receipt" }],
              ],
            };

            await sendTelegram(botToken, "sendMessage", {
              chat_id: chatId,
              text: idText,
              parse_mode: "HTML",
              reply_markup: idKb,
            });
            return new Response("OK", { status: 200 });
          }

          // Normal /start
          const userStr = username ? `@${username}` : `ID: ${chatId}`;
          const startText = 
            `👋 <b>Ассалому алейкум, ${firstName}! Добро пожаловать в официальный бот BioMart!</b>\n\n` +
            `⚡ <b>BioMart</b> — платформа быстрых мобильных витрин для продавцов в Instagram и Telegram в Узбекистане.\n\n` +
            `🆔 <b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n` +
            `👤 <b>Ваш аккаунт:</b> <code>${userStr}</code>\n\n` +
            `<i>(Скопируйте этот номер или укажите ваш @username в кабинете BioMart → вкладка «Telegram», чтобы бот моментально присылал вам уведомления о каждом заказе!)</i>\n\n` +
            `<b>Возможности бота:</b>\n` +
            `• Мгновенные чеки заказов с товарами, размером, адресом и телефоном\n` +
            `• Кнопки быстрого звонка клиенту и адреса в Яндекс Картах\n` +
            `• 24/7 работа на Cloudflare Edge`;

          const startKb = {
            inline_keyboard: [
              [{ text: "🛍 Открыть витрину (Tashkent Drip)", url: `${webUrl}/tashkent_drip` }],
              [{ text: "📦 Демо-чек заказа", callback_data: "demo_receipt" }],
              [{ text: "⚙️ Панель продавца", url: `${webUrl}/dashboard?tab=telegram` }],
              [{ text: "➕ Создать витрину", url: `${webUrl}/register` }],
            ],
          };

          await sendTelegram(botToken, "sendMessage", {
            chat_id: chatId,
            text: startText,
            parse_mode: "HTML",
            reply_markup: startKb,
          });
          return new Response("OK", { status: 200 });
        }

        // 2. Command: /id or /myid
        if (text === "/id" || text === "/myid" || text.includes("Мой Chat ID")) {
          const userHint = username ? `\n👤 <b>Ваш юзернейм:</b> <code>@${username}</code>` : "";
          const myIdText = 
            `🆔 <b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n` +
            `<i>(Нажмите на номер, чтобы скопировать)</i>${userHint}\n\n` +
            `💡 <b>Как привязать приём заказов:</b>\n` +
            `Вставьте этот ID или ваш юзернейм <code>@${username || "username"}</code> в панели управления BioMart (вкладка <b>Telegram</b>). ` +
            `После этого бот будет присылать все оформленные заказы прямо в этот чат!`;

          const myIdKb = {
            inline_keyboard: [
              [{ text: "⚙️ Перейти в настройки кабинета", url: `${webUrl}/dashboard?tab=telegram` }],
              [{ text: "📦 Получить тестовый чек", callback_data: "demo_receipt" }],
            ],
          };

          await sendTelegram(botToken, "sendMessage", {
            chat_id: chatId,
            text: myIdText,
            parse_mode: "HTML",
            reply_markup: myIdKb,
          });
          return new Response("OK", { status: 200 });
        }

        // 3. Catch-all reply
        const fallbackText = 
          `👋 <b>Здравствуйте, ${firstName}!</b>\n\n` +
          `Я официальный бот платформы <b>BioMart</b>. Я помогаю продавцам мгновенно получать чеки заказов с витрин прямо сюда в Telegram.\n\n` +
          `🆔 <b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n` +
          `${username ? `👤 <b>Ваш юзернейм:</b> <code>@${username}</code>\n` : ""}\n` +
          `Вы можете указать этот ID или ваш @username в кабинете продавца BioMart, чтобы принимать чеки заказов.`;

        const fallbackKb = {
          inline_keyboard: [
            [{ text: "🛍 Открыть витрину (Tashkent Drip)", url: `${webUrl}/tashkent_drip` }],
            [{ text: "📦 Демо-чек заказа", callback_data: "demo_receipt" }],
            [{ text: "⚙️ Панель продавца", url: `${webUrl}/dashboard?tab=telegram` }],
          ],
        };

        await sendTelegram(botToken, "sendMessage", {
          chat_id: chatId,
          text: fallbackText,
          parse_mode: "HTML",
          reply_markup: fallbackKb,
        });
        return new Response("OK", { status: 200 });
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },
};
