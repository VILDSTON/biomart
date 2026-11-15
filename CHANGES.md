# Recent changes (2026-11-15)

- **Domain Default**: Restored default domain to `biomart.vercel.app` across `lib/constants.ts`, `bot.py`, and OpenGraph metadata until `biomart.uz` is officially acquired and pointed.
- **Uzbek Phone Mask (`+998`)**: Added `formatUzbekPhone` in `lib/utils.ts` and integrated it into both checkout forms (`OneClickCheckoutModal.tsx` and `CartCheckoutDrawer.tsx`). Now automatically formats typed or pasted numbers as `+998 (XX) XXX-XX-XX`.
- **Prominent Quick Call Button**: Enhanced the `📞 Позвонить` button in `components/StoreHeader.tsx` with high-contrast emerald styling so buyers can call sellers with a single tap.
- **Trust & Safety Banner**: Added a dedicated buyer protection strip under the storefront header: `🔒 Безопасный заказ • Оплата продавцу напрямую` / `Xavfsiz xarid • To‘lov to‘g‘ridan-to‘g‘ri do‘konga` with a live `Verified ✓` badge indicator.
- **Google AI Studio Integration**: Switched product description generator (`app/api/ai/generate-description/route.ts`) to Google Gemini (Flash-Lite / 1.5 Flash).
- **Founder Notification on Store Creation**: Automated Telegram alerts to Founder (`5504101440`) with inline verification buttons.
- **Telegram Bot Founder Suite (`bot.py` & Webhook)**: Full suite of founder management commands (`/admin`, `/verify <slug>`, `/unverify <slug>`, `/stores`, `/stats`, `/ban <slug>`).

# Previous changes (2026-11-13)

- **Telegram bot token** moved from source code to `.env.local` as `TG_BOT_TOKEN` and referenced via `process.env.TG_BOT_TOKEN` in `bot.py`.
- **Admin password UI** is integrated in the dashboard (`app/dashboard/page.tsx`).
- **Realistic reviews** and **custom phone links** are active in the storefront.
