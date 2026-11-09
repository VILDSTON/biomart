# BioMart Fixes & Enhancements Implementation Plan

## Goal
Implement all 10 user-requested fixes and enhancements:
1. Fix 404 page visual bug (remove awkward overlapping box cutting through the zero, make it clean and modern).
2. Update Favicon with user's exact SVG vector (`#468B6F`, transparent background, pure bag + bolt).
3. Add Email + OTP verification code step to store registration (`app/register/page.tsx`).
4. Completely eliminate PRO subscription prompts and mentions from Dashboard since subscriptions are disabled.
5. Add «Команда» (`team`) tab in Dashboard with staff management.
6. Support generating a special invite link / Telegram share / QR code to invite team members.
7. Enable editing Store Name (`store_name`), Description, and Store Slug (`slug`) in Dashboard.
8. Fix links visibility on `/tashkent_drip` by properly persisting `custom_links` to cookies, store, and SSR payload.
9. Fix Telegram username bug where empty input fell back to `@biomart_support` or showed an empty button.
10. Restructure Design tab in Dashboard with clear sections and visual helpers so merchants easily understand all settings.

---

## Tasks Breakdown

### Task 1: Favicon Replacement (User SVG)
- Write the user's exact SVG to `public/icon.svg`, `public/favicon.svg`, `app/icon.svg`.
- Use Chrome DevTools / headless to render transparent 512x512 PNG, and Python PIL to generate multi-size `favicon.ico` (16x16, 32x32, 48x48), `apple-touch-icon.png` (180x180), `icon-192.png`, `icon-512.png`.
- Copy to `public/` and `app/`.

### Task 2: 404 Page Visual Redesign
- In `app/not-found.tsx`:
  - Eliminate the overlapping square box that was cutting through the "404" numbers.
  - Create a clean, elegant layout: refined typography, subtle animated status pill, brand logo header, clear explanation, direct buttons ("На главную BioMart", "Примеры витрин"), and helpful links card.
  - Verify visually on desktop (1280px) and mobile (390px).

### Task 3: Storefront Header & SSR Persistence Fixes
- In `components/StoreHeader.tsx`:
  - Fix Telegram button: ONLY render if `settings.telegram_username` is non-empty. Remove fallback to `biomart_support`.
  - Same for Instagram and Phone (clean conditions).
- In `app/[slug]/page.tsx`:
  - Pass `custom_links: cookieContacts?.custom_links ?? dbStore?.custom_links ?? (demoPreset ? demoPreset.settings.custom_links : [])` into `storeSettings`.
- In `components/StorefrontClient.tsx`:
  - Merge `initialSettings.custom_links` and `shopData?.settings.custom_links` properly so client hydration never loses links.
- In `store/useStore.ts`:
  - Ensure `tashkent_drip` and demo presets in initial store have `custom_links` populated.

### Task 4: Store Name & Slug (URL) Editing in Dashboard
- In `app/dashboard/page.tsx`:
  - In Settings/Branding/Contacts tab, add a prominent **«Основные данные витрины»** card:
    - Поле "Название витрины" (`store_name`)
    - Поле "Ссылка на витрину (адрес)" (`slug`) с префиксом `biomart.uz/`
    - Валидация слага при сохранении (не пустой, не зарезервированный, латинские буквы/цифры/подчеркивания).
    - При смене слага: перенос данных в Zustand, обновление cookie `biomart_contacts_${newSlug}`, `biomart_theme_${newSlug}`, обновление `activeSlug` и `router.replace('/dashboard?shop=' + newSlug)`.

### Task 5: Elimination of PRO Prompts in Dashboard
- In `app/dashboard/page.tsx`:
  - Change product limit error text: "Вы достигли бесплатного лимита 10 товаров в каталоге" (remove "Перейдите на Plus или Pro").
  - Change Top products badge from "ТАРИФ PRO" to "ТОП ПРОДАЖ".
  - Make Excel import available or friendly without requiring PRO.
  - Remove all remaining Pro upsell barriers in dashboard.

### Task 6: Team Management Tab («Команда») & Special Invite Link
- In `app/dashboard/page.tsx`:
  - Add `'team'` to `DashboardTab` and `allowedTabs`.
  - Add navigation tab button: `<Users className="w-3.5 h-3.5" /> <span>Команда</span>`.
  - Add Team tab view:
    - Header: «Команда витрины» + кнопка «+ Пригласить сотрудника».
    - List of team members (Owner with badge "Владелец", Managers, Couriers).
    - Modal «Приглашение в команду»:
      - Role selector: Менеджер заказов, Курьер, Администратор.
      - Generated unique invite link: `https://biomart.vercel.app/register?invite=team_...&shop=${activeSlug}&role=${role}`.
      - 1-click copy button with toast.
      - "Отправить приглашение в Telegram" button.
      - QR code for quick scanning.
      - Ability to add a member directly by name/phone.

### Task 7: Design Tab Polish & Clear Hierarchy
- In `components/StorefrontDesignEditor.tsx`:
  - Group settings into clear, collapsible or tabbed sections:
    1. «Стиль и цвета» (Шаблон, Акцентный цвет, Тема день/ночь)
    2. «Вид каталога» (Сетка 2 колонки / 1 колонка, Текст кнопки заказа)
    3. «Шапка и аватар» (Логотип, Баннер)
    4. «Доверие» (Бейджи надежности, Отзывы)
  - Add clear explanations to each setting so the merchant immediately understands what they are editing.

### Task 8: Registration with Email & Confirmation Code (OTP)
- In `app/register/page.tsx`:
  - Add Email input field.
  - 2-step verification flow:
    - Step 1: Merchant enters Store Name, Slug, Email, Password.
    - Step 2: "Подтверждение Email" — 4 or 6-digit OTP code input screen with timer, resend button, and validation.
    - Instant demo verification code hint if SMTP not active.
    - On verification, complete registration and proceed to dashboard.

### Task 9: Verification, Testing & Git Push
- Type check: `npx tsc --noEmit`.
- Next.js build: `npm run build`.
- Capture screenshots of 404, Team tab, Design tab, Storefront links on `/tashkent_drip`, and Registration OTP.
- Commit and push to `origin/main`.
