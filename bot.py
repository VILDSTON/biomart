"""
BioMart Official Telegram Bot
Token: 9023083705:AAHRnvV1ihvAENYcZiKW8UDn7cbD4iEMdm0
Username: @BioMartAssistant_bot

Provides store lookup, catalog browsing, order notifications, and merchant management.
"""

import asyncio
import logging
import sys
from typing import Dict, Any, List

from aiogram import Bot, Dispatcher, F, types
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart, CommandObject
from aiogram.utils.keyboard import InlineKeyboardBuilder, ReplyKeyboardBuilder

BOT_TOKEN = "9023083705:AAHRnvV1ihvAENYcZiKW8UDn7cbD4iEMdm0"
BASE_WEB_URL = "http://localhost:3000"

# Mock stores database synced with Next.js BioMart mock data
STORES_DB: Dict[str, Dict[str, Any]] = {
    "tashkent_drip": {
        "slug": "tashkent_drip",
        "name": "TASHKENT DRIP",
        "description": "Премиальный streetwear, обувь и селективный парфюм в Ташкенте. Быстрая доставка по всему Узбекистану.",
        "phone": "+998 90 123 45 67",
        "instagram": "https://instagram.com/tashkent_drip",
        "telegram": "tashkent_drip_order",
        "delivery": "Yandex по Ташкенту 25 000 сум (2-4 часа). BTS по регионам 35 000 сум.",
        "verified": True,
        "products": [
            {
                "id": "p-1",
                "title": "Худи Оверсайз «Ташкент» Drip Edition",
                "price": 320000,
                "old_price": 420000,
                "sizes": ["S", "M", "L", "XL"],
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
            },
            {
                "id": "p-2",
                "title": "Кроссовки Retro Runner Vintage Cream",
                "price": 680000,
                "old_price": 850000,
                "sizes": ["40", "41", "42", "43", "44"],
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
            },
            {
                "id": "p-3",
                "title": "Парфюм Tom Ford Tobacco Vanille (Декант 10ml)",
                "price": 190000,
                "old_price": 240000,
                "sizes": ["5ml", "10ml", "15ml"],
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
            },
            {
                "id": "p-4",
                "title": "Футболка Boxy Heavyweight Washed Black",
                "price": 210000,
                "old_price": None,
                "sizes": ["M", "L", "XL"],
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
            },
        ],
    },
    "samarkand_sweets": {
        "slug": "samarkand_sweets",
        "name": "Samarkand Sweets & Halva",
        "description": "Традиционная самаркандская халва, восточные сладости и сухофрукты ручной работы.",
        "phone": "+998 93 456 78 90",
        "instagram": "https://instagram.com/samarkand_sweets",
        "telegram": "samarkand_sweets_order",
        "delivery": "Доставка в любой город Узбекистана от 25 000 сум.",
        "verified": True,
        "products": [
            {
                "id": "s-1",
                "title": "Фисташковая самаркандская халва 500г",
                "price": 75000,
                "old_price": 90000,
                "sizes": ["500г", "1кг"],
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
            }
        ],
    },
}

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()


def format_sum(amount: int) -> str:
    return f"{amount:,}".replace(",", " ") + " сум"


def get_main_menu_keyboard():
    builder = ReplyKeyboardBuilder()
    builder.button(text="🛍 Магазин Tashkent Drip")
    builder.button(text="🆔 Мой Chat ID")
    builder.button(text="📦 Демо чека заказа")
    builder.button(text="🔍 Поиск магазина")
    builder.button(text="🚀 Создать витрину")
    builder.button(text="ℹ️ О сервисе BioMart")
    builder.adjust(2, 2, 2)
    return builder.as_markup(resize_keyboard=True)


@dp.message(CommandStart())
async def cmd_start(message: types.Message, command: CommandObject):
    args = command.args
    user_name = message.from_user.first_name if message.from_user else "друг"
    chat_id = message.chat.id

    # Deep-link support: /start store_tashkent_drip
    if args and args.startswith("store_"):
        slug = args.replace("store_", "").strip().lower()
        await show_store_details(message, slug)
        return

    text = (
        f"👋 <b>Ассалому алейкум, {user_name}! Добро пожаловать в официальный бот BioMart!</b>\n\n"
        "⚡ <b>BioMart</b> — платформа быстрых мобильных витрин для продавцов в Instagram и Telegram в Узбекистане.\n\n"
        f"🆔 <b>Ваш Telegram Chat ID:</b> <code>{chat_id}</code>\n"
        "<i>(Скопируйте этот номер и укажите в кабинете BioMart → вкладка «Telegram», чтобы бот моментально присылал вам уведомления о каждом заказе!)</i>\n\n"
        "<b>Возможности бота:</b>\n"
        "• Мгновенные уведомления о заказах с товарами, размером и контактами покупателя\n"
        "• Кнопки быстрого звонка, чата с клиентом и адреса в Яндекс Картах\n"
        "• Просмотр каталогов и демо чеков\n\n"
        "Выберите действие в меню ниже или введите слаг магазина (например: <code>tashkent_drip</code>):"
    )

    kb = InlineKeyboardBuilder()
    kb.button(text="🛍 Открыть витрину (Tashkent Drip)", url=f"{BASE_WEB_URL}/tashkent_drip")
    kb.button(text="📦 Получить демо-чек заказа", callback_data="demo_receipt")
    kb.button(text="⚙️ Панель продавца", url=f"{BASE_WEB_URL}/dashboard?tab=telegram")
    kb.button(text="➕ Создать витрину", url=f"{BASE_WEB_URL}/register")
    kb.adjust(1)

    await message.answer(text, reply_markup=get_main_menu_keyboard())
    await message.answer("Быстрые действия:", reply_markup=kb.as_markup())


@dp.message(F.text == "🆔 Мой Chat ID")
@dp.message(Command("myid"))
@dp.message(Command("id"))
async def cmd_my_id(message: types.Message):
    await message.answer(
        f"🆔 <b>Ваш Telegram Chat ID:</b> <code>{message.chat.id}</code>\n\n"
        "Вставьте этот ID в панели управления BioMart (вкладка <b>Telegram</b>), "
        "чтобы мгновенно получать чеки заказов от ваших покупателей в этот чат.",
        reply_markup=get_main_menu_keyboard()
    )


@dp.message(F.text == "🛍 Магазин Tashkent Drip")
@dp.message(Command("demo"))
async def cmd_demo_store(message: types.Message):
    await show_store_details(message, "tashkent_drip")


async def show_store_details(message: types.Message, slug: str):
    store = STORES_DB.get(slug)
    if not store:
        await message.answer(
            f"❌ Магазин <code>{slug}</code> не найден.\n\n"
            f"Проверьте правильность написания или откройте тестовый: /store tashkent_drip"
        )
        return

    verified_badge = "✅ <b>(подтверждено BioMart)</b>\n" if store.get("verified") else ""
    text = (
        f"🏪 <b>{store['name']}</b>\n"
        f"{verified_badge}\n"
        f"📝 {store['description']}\n\n"
        f"🚚 <b>Доставка:</b> {store['delivery']}\n"
        f"📞 <b>Телефон:</b> {store['phone']}\n"
        f"🔗 <b>Веб-витрина:</b> {BASE_WEB_URL}/{store['slug']}\n"
    )

    kb = InlineKeyboardBuilder()
    kb.button(text="🌐 Открыть витрину BioMart", url=f"{BASE_WEB_URL}/{store['slug']}")
    kb.button(text="📋 Каталог товаров в Telegram", callback_data=f"catalog_{slug}")
    kb.button(text="💬 Написать продавцу", url=f"https://t.me/{store['telegram']}")
    kb.adjust(1)

    await message.answer(text, reply_markup=kb.as_markup())


@dp.message(F.text == "🔍 Поиск магазина")
async def cmd_search_prompt(message: types.Message):
    text = (
        "🔍 <b>Поиск витрины:</b>\n\n"
        "Отправьте юзернейм или ссылку на магазин, например:\n"
        "• <code>tashkent_drip</code>\n"
        "• <code>samarkand_sweets</code>\n"
        "• <code>biomart.uz/tashkent_drip</code>"
    )
    await message.answer(text)


@dp.message(F.text == "📦 Демо чека заказа")
@dp.message(Command("demo_order"))
async def cmd_demo_order(message: types.Message):
    await send_demo_order_receipt(message)


@dp.callback_query(F.data == "demo_receipt")
async def cb_demo_receipt(callback: types.CallbackQuery):
    await callback.answer()
    if callback.message:
        await send_demo_order_receipt(callback.message)


async def send_demo_order_receipt(message: types.Message):
    text = (
        "🔔 <b>НОВЫЙ ЗАКАЗ #1042</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        "🏪 <b>Магазин:</b> TASHKENT DRIP\n"
        "👤 <b>Покупатель:</b> Сардор Алимов\n"
        "📞 <b>Телефон:</b> +998 90 123 45 67\n"
        "🚚 <b>Доставка:</b> Курьер Yandex\n"
        "📍 <b>Адрес:</b> г. Ташкент, Чиланзар-9, дом 14, кв. 28\n"
        "🗺 <a href=\"https://yandex.uz/maps\">Показать адрес на Яндекс Карте</a>\n\n"
        "🛍 <b>Состав заказа:</b>\n"
        "1. Худи Оверсайз «Ташкент» Drip Edition\n"
        "   └ Размер: <b>M</b> | 1 шт. × 320 000 сум\n\n"
        "💰 <b>Итого к оплате:</b> <b>320 000 сум</b>\n"
        "💳 <b>Оплата:</b> Переводом Payme / Click\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        "⏰ <i>Только что • Оформлено через BioMart Web</i>"
    )

    kb = InlineKeyboardBuilder()
    kb.button(text="✅ Принять в обработку", callback_data="order_accept_1042")
    kb.button(text="💬 Написать покупателю", url="https://t.me/sardor_alimov")
    kb.button(text="📞 Позвонить клиенту", url="tel:+998901234567")
    kb.adjust(1)

    await message.answer(text, reply_markup=kb.as_markup(), disable_web_page_preview=True)


@dp.callback_query(F.data.startswith("order_accept_"))
async def cb_order_accept(callback: types.CallbackQuery):
    order_id = callback.data.split("_")[-1]
    await callback.answer(f"Заказ #{order_id} принят в работу!", show_alert=True)
    if callback.message:
        await callback.message.edit_text(
            callback.message.text + "\n\n🟢 <b>Статус: Принят в работу продавцом</b>",
            reply_markup=None
        )


@dp.callback_query(F.data.startswith("catalog_"))
async def cb_show_catalog(callback: types.CallbackQuery):
    slug = callback.data.replace("catalog_", "").strip()
    store = STORES_DB.get(slug)
    await callback.answer()

    if not store:
        await callback.message.answer("Магазин не найден.")
        return

    products = store.get("products", [])
    if not products:
        await callback.message.answer("В каталоге магазина пока нет товаров.")
        return

    await callback.message.answer(f"📦 <b>Каталог {store['name']} ({len(products)} товаров):</b>")

    for p in products:
        old_price_text = f" <s>{format_sum(p['old_price'])}</s>" if p.get("old_price") else ""
        sizes_text = f"• Размеры: {', '.join(p['sizes'])}\n" if p.get("sizes") else ""
        caption = (
            f"<b>{p['title']}</b>\n\n"
            f"💰 Цена: <b>{format_sum(p['price'])}</b>{old_price_text}\n"
            f"{sizes_text}"
            f"✅ В наличии\n"
        )
        kb = InlineKeyboardBuilder()
        kb.button(text="Купить на BioMart 🛍", url=f"{BASE_WEB_URL}/{slug}?item={p['id']}")
        try:
            await callback.message.answer_photo(photo=p["image"], caption=caption, reply_markup=kb.as_markup())
        except Exception as e:
            logger.warning(f"Failed to send photo for {p['id']}: {e}")
            await callback.message.answer(caption, reply_markup=kb.as_markup())


@dp.message(F.text == "🚀 Создать витрину")
async def cmd_create_store(message: types.Message):
    text = (
        "🚀 <b>Создайте витрину своего магазина за 2 минуты!</b>\n\n"
        "1. Перейдите по ссылке ниже\n"
        "2. Укажите имя и ник магазина\n"
        "3. Добавьте первый товар\n"
        "4. Получите готовую ссылку для Instagram шапки профиля\n\n"
        "Бесплатно, 0% комиссии с продаж!"
    )
    kb = InlineKeyboardBuilder()
    kb.button(text="✨ Открыть регистрацию", url=f"{BASE_WEB_URL}/register")
    kb.adjust(1)
    await message.answer(text, reply_markup=kb.as_markup())


@dp.message(F.text == "ℹ️ О сервисе BioMart")
async def cmd_about(message: types.Message):
    text = (
        "⚡ <b>BioMart — быстрые продажи в соцсетях без рутины в Direct.</b>\n\n"
        "🇺🇿 Создано специально для локального рынка Узбекистана:\n"
        "• Мобильная витрина открывается за 0.8 сек в браузере Instagram\n"
        "• Заказ улетает структурированным чеком прямо вам в Telegram\n"
        "• Поддержка Payme, Click, Yandex Доставки и BTS\n"
        "• Работает на узбекском и русском языках"
    )
    kb = InlineKeyboardBuilder()
    kb.button(text="Попробовать демо-витрину", url=f"{BASE_WEB_URL}/tashkent_drip")
    kb.button(text="Кабинет управления", url=f"{BASE_WEB_URL}/dashboard")
    kb.adjust(1)
    await message.answer(text, reply_markup=kb.as_markup())


@dp.message(Command("store"))
async def cmd_store_param(message: types.Message, command: CommandObject):
    if not command.args:
        await message.answer("Пожалуйста, укажите ник магазина. Например: <code>/store tashkent_drip</code>")
        return
    slug = command.args.strip().lower()
    await show_store_details(message, slug)


@dp.message(Command("catalog"))
async def cmd_catalog_param(message: types.Message, command: CommandObject):
    slug = command.args.strip().lower() if command.args else "tashkent_drip"
    store = STORES_DB.get(slug)
    if not store:
        await message.answer(f"Магазин {slug} не найден.")
        return
    # Use fake callback query simulation or send products directly
    products = store.get("products", [])
    for p in products:
        old_price_text = f" <s>{format_sum(p['old_price'])}</s>" if p.get("old_price") else ""
        sizes_text = f"• Размеры: {', '.join(p['sizes'])}\n" if p.get("sizes") else ""
        caption = (
            f"<b>{p['title']}</b>\n\n"
            f"💰 Цена: <b>{format_sum(p['price'])}</b>{old_price_text}\n"
            f"{sizes_text}"
            f"✅ В наличии\n"
        )
        kb = InlineKeyboardBuilder()
        kb.button(text="Купить на BioMart 🛍", url=f"{BASE_WEB_URL}/{slug}?item={p['id']}")
        try:
            await message.answer_photo(photo=p["image"], caption=caption, reply_markup=kb.as_markup())
        except Exception:
            await message.answer(caption, reply_markup=kb.as_markup())


@dp.message(F.text)
async def handle_any_text(message: types.Message):
    clean = message.text.strip().lower().replace("http://", "").replace("https://", "").replace("biomart.uz/", "")
    clean = clean.split("/")[0].strip()
    if clean in STORES_DB:
        await show_store_details(message, clean)
    else:
        await message.answer(
            f"Не удалось найти магазин по запросу «{message.text}».\n\n"
            "Попробуйте <code>tashkent_drip</code> или выберите команду в меню."
        )


async def main():
    logger.info("Starting BioMart Telegram Bot...")
    # Drop pending updates to avoid backlog spam on startup
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped.")
