# BioMart Official Telegram Bot (Cloudflare Worker 24/7)

Serverless Telegram Bot for BioMart running 24/7 on Cloudflare Workers (Edge).

## Быстрый деплой за 1 минуту:

### Вариант 1: Через терминал с Wrangler
1. Перейдите в папку:
   ```bash
   cd cloudflare-bot
   ```
2. Установите секретный токен бота:
   ```bash
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   # Вставьте: 9023083705:AAHTQ9YwgBR8NVRzx1vc-wDQHitLpK6scyI
   ```
3. Задеплойте воркер на Cloudflare:
   ```bash
   npx wrangler deploy
   ```
4. После деплоя воркер выдаст URL (например, `https://biomart-telegram-bot.<subdomain>.workers.dev`).
   Зарегистрируйте вебхук в Telegram в 1 клик, просто открыв в браузере:
   `https://biomart-telegram-bot.<subdomain>.workers.dev/set-webhook`

---

### Вариант 2: Через панель Cloudflare Dashboard (Без терминала)
1. Откройте [dash.cloudflare.com](https://dash.cloudflare.com/) → **Compute (Workers & Pages)** → **Create Application** → **Create Worker**.
2. Вставьте код из `worker.js` в онлайн-редактор и нажмите **Save & Deploy**.
3. В **Settings** → **Variables and Secrets** добавьте:
   - `TELEGRAM_BOT_TOKEN`: `9023083705:AAHTQ9YwgBR8NVRzx1vc-wDQHitLpK6scyI`
   - `BASE_WEB_URL`: `https://biomart.vercel.app`
4. Перейдите по ссылке `https://<your-worker>.workers.dev/set-webhook` для мгновенной привязки к Telegram!
