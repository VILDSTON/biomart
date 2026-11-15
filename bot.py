"""
BioMart Official Telegram Bot
Username: @BioMartAssistant_bot

Provides store lookup, catalog browsing, order notifications, merchant management,
and Founder/Moderator supervision tools for ID: 5504101440.
"""

import asyncio
import json
import logging
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any, List

from aiogram import Bot, Dispatcher, F, types, BaseMiddleware
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart, CommandObject
from aiogram.utils.keyboard import InlineKeyboardBuilder, ReplyKeyboardBuilder

def load_local_env():
    env_file = Path(__file__).resolve().parent / ".env.local"
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip("'\"")
                    if k and not os.environ.get(k):
                        os.environ[k] = v

load_local_env()
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TG_BOT_TOKEN") or ""
BASE_WEB_URL = os.environ.get("NEXT_PUBLIC_APP_URL") or os.environ.get("NEXT_PUBLIC_BASE_URL") or "https://biomart.vercel.app"

# Founder / SuperAdmin Telegram ID
FOUNDER_CHAT_ID = int(os.environ.get("ADMIN_TELEGRAM_ID") or os.environ.get("FOUNDER_TELEGRAM_ID") or 5504101440)
ADMIN_IDS = [5504101440, FOUNDER_CHAT_ID]

DATA_DIR = Path(__file__).resolve().parent / "data"
TELEGRAM_USERS_FILE = DATA_DIR / "telegram_users.json"
VERIFIED_STORES_FILE = DATA_DIR / "verified_stores.json"
REGISTERED_STORES_FILE = DATA_DIR / "registered_stores.json"
BANNED_STORES_FILE = DATA_DIR / "banned_stores.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)

def is_founder(user_id: int) -> bool:
    return user_id in ADMIN_IDS

def register_user(chat_id: int, username: str | None = None, first_name: str | None = None):
    """Save user telegram info so web orders can map username -> numeric chat_id"""
    try:
        data = {}
        if TELEGRAM_USERS_FILE.exists():
            try:
                with open(TELEGRAM_USERS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = {}

        chat_key = str(chat_id)
        clean_user = username.lstrip("@").lower().strip() if username else ""
        data[chat_key] = {
            "chat_id": chat_id,
            "username": clean_user,
            "first_name": first_name or "",
            "updated_at": time.time(),
        }
        if clean_user:
            data[f"@{clean_user}"] = chat_id
            data[clean_user] = chat_id

        with open(TELEGRAM_USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.warning(f"Failed to register telegram user: {e}")

def get_verified_stores() -> Dict[str, Any]:
    if VERIFIED_STORES_FILE.exists():
        try:
            with open(VERIFIED_STORES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def is_store_verified(slug: str) -> bool:
    slug = slug.lower().strip()
    if slug in ["tashkent_drip", "samarkand_sweets"]:
        return True
    verified = get_verified_stores()
    return bool(verified.get(slug, {}).get("verified"))

def set_store_verified(slug: str, verified: bool = True):
    slug = slug.lower().strip()
    data = get_verified_stores()
    data[slug] = {
        "slug": slug,
        "verified": verified,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    with open(VERIFIED_STORES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    if slug in STORES_DB:
        STORES_DB[slug]["verified"] = verified

    # Attempt Supabase sync if credentials exist
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if supabase_url and supabase_key:
        try:
            endpoint = f"{supabase_url.rstrip('/')}/rest/v1/stores?slug=eq.{slug}"
            payload = json.dumps({"is_verified": verified, "status": "published" if verified else "pending"}).encode("utf-8")
            req = urllib.request.Request(
                endpoint,
                data=payload,
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                method="PATCH"
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                pass
        except Exception as err:
            logger.warning(f"Supabase verified sync error for {slug}: {err}")

def get_banned_stores() -> Dict[str, Any]:
    if BANNED_STORES_FILE.exists():
        try:
            with open(BANNED_STORES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def set_store_banned(slug: str, banned: bool = True):
    slug = slug.lower().strip()
    data = get_banned_stores()
    data[slug] = {
        "slug": slug,
        "banned": banned,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    with open(BANNED_STORES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_all_stores() -> Dict[str, Dict[str, Any]]:
    stores = dict(STORES_DB)
    if REGISTERED_STORES_FILE.exists():
        try:
            with open(REGISTERED_STORES_FILE, "r", encoding="utf-8") as f:
                registered = json.load(f)
                for slug, info in registered.items():
                    if slug not in stores:
                        stores[slug] = {
                            "slug": slug,
                            "name": info.get("store_name", slug.upper()),
                            "description": info.get("description", "Онлайн-витрина BioMart"),
                            "phone": info.get("phone", "—"),
                            "email": info.get("email", "—"),
                            "instagram": info.get("instagram_url", "—"),
                            "telegram": info.get("telegram_username", "—"),
                            "delivery": "Yandex / BTS доставка",
                            "verified": is_store_verified(slug),
                        }
        except Exception:
            pass
    return stores

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

class AutoRegisterUserMiddleware(BaseMiddleware):
    async def __call__(self, handler, event: types.TelegramObject, data: dict):
        if isinstance(event, types.Message) and event.from_user:
            register_user(event.chat.id, event.from_user.username, event.from_user.first_name)
        elif isinstance(event, types.CallbackQuery) and event.from_user:
            chat_id = event.message.chat.id if event.message else event.from_user.id
            register_user(chat_id, event.from_user.username, event.from_user.first_name)
        return await handler(event, data)

dp.message.outer_middleware(AutoRegisterUserMiddleware())
dp.callback_query.outer_middleware(AutoRegisterUserMiddleware())

def format_sum(amount: int) -> str:
    return f"{amount:,}".replace(",", " ") + " сум"

def get_main_menu_keyboard(is_admin: bool = False):
    builder = ReplyKeyboardBuilder()
    builder.button(text="🛍 Магазин Tashkent Drip")
    builder.button(text="🆔 Мой Chat ID")
    builder.button(text="📦 Демо чека заказа")
    builder.button(text="🔍 Поиск магазина")
    builder.button(text="🚀 Создать витрину")
    builder.button(text="ℹ️ О сервисе BioMart")
    if is_admin:
        builder.button(text="👑 Панель Основателя")
        builder.adjust(2, 2, 2, 1)
    else:
        builder.adjust(2, 2, 2)
    return builder.as_markup(resize_keyboard=True)

# ----------------- FOUNDER & ADMIN COMMANDS (ID: 5504101440) -----------------

@dp.message(F.text == "👑 Панель Основателя")
@dp.message(Command("admin"))
async def cmd_admin_panel(message: types.Message):
    if not is_founder(message.from_user.id):
        await message.answer("❌ Эта команда доступна только основателю платформы BioMart.")
        return

    stores = get_all_stores()
    total_stores = len(stores)
    verified_count = sum(1 for s, data in stores.items() if is_store_verified(s))
    
    users_count = 0
    if TELEGRAM_USERS_FILE.exists():
        try:
            with open(TELEGRAM_USERS_FILE, "r", encoding="utf-8") as f:
                users_data = json.load(f)
                users_count = len([k for k in users_data.keys() if k.isdigit()])
        except Exception:
            pass

    text = (
        "👑 <b>ПАНЕЛЬ УПРАВЛЕНИЯ ОСНОВАТЕЛЯ BIOMART</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        f"👋 Добро пожаловать, <b>{message.from_user.first_name}</b>!\n"
        f"Ваш ID подтверждён: <code>{message.from_user.id}</code> (SuperAdmin / Founder)\n\n"
        "📊 <b>Сводка платформы:</b>\n"
        f"• Всего витрин: <b>{total_stores}</b>\n"
        f"• Верифицированных (Verified): <b>{verified_count}</b>\n"
        f"• Пользователей в Telegram: <b>{users_count}</b>\n\n"
        "🛠 <b>Быстрые команды:</b>\n"
        "• <code>/verify &lt;slug&gt;</code> — выдать галочку Verified\n"
        "• <code>/unverify &lt;slug&gt;</code> — снять галочку Verified\n"
        "• <code>/ban &lt;slug&gt;</code> — заблокировать витрину\n"
        "• <code>/stores</code> — список всех зарегистрированных магазинов\n"
        "• <code>/stats</code> — полная статистика\n\n"
        "Выберите действие ниже:"
    )

    kb = InlineKeyboardBuilder()
    kb.button(text="🏪 Все магазины", callback_data="admin_stores")
    kb.button(text="📊 Статистика", callback_data="admin_stats")
    kb.button(text="🌐 Открыть BioMart", url=BASE_WEB_URL)
    kb.adjust(2, 1)

    await message.answer(text, reply_markup=kb.as_markup())

@dp.message(Command("verify"))
async def cmd_verify_store(message: types.Message, command: CommandObject):
    if not is_founder(message.from_user.id):
        await message.answer("❌ Доступ разрешён только основателю платформы.")
        return

    if not command.args:
        await message.answer(
            "ℹ️ Укажите адрес (слаг) магазина для верификации.\n"
            "Пример: <code>/verify tashkent_drip</code>"
        )
        return

    slug = command.args.strip().lower()
    set_store_verified(slug, True)

    kb = InlineKeyboardBuilder()
    kb.button(text="🌐 Открыть витрину с галочкой", url=f"{BASE_WEB_URL}/{slug}")
    kb.button(text="⚪ Снять верификацию", callback_data=f"unverify_{slug}")
    kb.adjust(1)

    await message.answer(
        f"🎉 <b>МАГАЗИН ВЕРИФИЦИРОВАН!</b>\n\n"
        f"✅ Магазину <code>{slug}</code> успешно присвоен статус <b>Verified</b>!\n"
        f"На его витрине теперь отображается официальный значок доверия BioMart.\n\n"
        f"🔗 <b>Ссылка:</b> {BASE_WEB_URL}/{slug}",
        reply_markup=kb.as_markup()
    )

@dp.message(Command("unverify"))
async def cmd_unverify_store(message: types.Message, command: CommandObject):
    if not is_founder(message.from_user.id):
        await message.answer("❌ Доступ разрешён только основателю платформы.")
        return

    if not command.args:
        await message.answer("Пример: <code>/unverify tashkent_drip</code>")
        return

    slug = command.args.strip().lower()
    set_store_verified(slug, False)
    await message.answer(f"⚪ Верификация с магазина <code>{slug}</code> успешно снята.")

@dp.message(Command("ban"))
async def cmd_ban_store(message: types.Message, command: CommandObject):
    if not is_founder(message.from_user.id):
        await message.answer("❌ Доступ разрешён только основателю платформы.")
        return

    if not command.args:
        await message.answer("Пример: <code>/ban bad_shop</code>")
        return

    slug = command.args.strip().lower()
    set_store_banned(slug, True)
    set_store_verified(slug, False)
    await message.answer(f"🚫 Магазин <code>{slug}</code> <b>заблокирован</b>. Покупатели увидят плашку о проверке безопасности.")

@dp.message(Command("unban"))
async def cmd_unban_store(message: types.Message, command: CommandObject):
    if not is_founder(message.from_user.id):
        await message.answer("❌ Доступ разрешён только основателю платформы.")
        return

    if not command.args:
        await message.answer("Пример: <code>/unban shop_slug</code>")
        return

    slug = command.args.strip().lower()
    set_store_banned(slug, False)
    await message.answer(f"✅ Магазин <code>{slug}</code> разблокирован.")

@dp.message(Command("stores"))
async def cmd_list_stores(message: types.Message):
    if not is_founder(message.from_user.id):
        await message.answer("❌ Доступ разрешён только основателю платформы.")
        return

    stores = get_all_stores()
    if not stores:
        await message.answer("В системе пока нет зарегистрированных магазинов.")
        return

    lines = ["🏪 <b>СПИСОК ВСЕХ МАГАЗИНОВ BIOMART:</b>\n━━━━━━━━━━━━━━━━━━━━━"]
    kb = InlineKeyboardBuilder()

    for slug, data in stores.items():
        v_mark = "✅ Verified" if is_store_verified(slug) else "🟡 На модерации"
        name = data.get("name") or data.get("store_name") or slug.upper()
        phone = data.get("phone", "—")
        lines.append(f"• <b>{name}</b> (<code>{slug}</code>)\n  └ Статус: {v_mark} | Тел: {phone}")
        
        # Add quick action button
        btn_text = f"✅ {slug}" if not is_store_verified(slug) else f"⚙️ {slug}"
        cb_target = f"verify_{slug}" if not is_store_verified(slug) else f"unverify_{slug}"
        kb.button(text=btn_text, callback_data=cb_target)

    kb.adjust(2)
    await message.answer("\n\n".join(lines), reply_markup=kb.as_markup())

@dp.message(Command("stats"))
async def cmd_platform_stats(message: types.Message):
    if not is_founder(message.from_user.id):
        await message.answer("❌ Доступ разрешён только основателю платформы.")
        return

    stores = get_all_stores()
    total_stores = len(stores)
    verified = sum(1 for s in stores.keys() if is_store_verified(s))
    banned = len(get_banned_stores())

    users_count = 0
    if TELEGRAM_USERS_FILE.exists():
        try:
            with open(TELEGRAM_USERS_FILE, "r", encoding="utf-8") as f:
                users_count = len([k for k in json.load(f).keys() if k.isdigit()])
        except Exception:
            pass

    text = (
        "📊 <b>СТАТИСТИКА ПЛАТФОРМЫ BIOMART</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        f"🏪 Всего магазинов: <b>{total_stores}</b>\n"
        f"✅ Верифицировано: <b>{verified}</b>\n"
        f"🚫 Заблокировано: <b>{banned}</b>\n"
        f"👥 Пользователей в боте: <b>{users_count}</b>\n"
        f"🌐 Домен витрин: <b>{BASE_WEB_URL}</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━"
    )
    await message.answer(text)

# ----------------- CALLBACK QUERIES FOR ADMIN & USERS -----------------

@dp.callback_query(F.data.startswith("verify_"))
async def cb_verify_action(callback: types.CallbackQuery):
    if not is_founder(callback.from_user.id):
        await callback.answer("❌ Действие доступно только основателю платформы", show_alert=True)
        return

    slug = callback.data.replace("verify_", "").strip().lower()
    set_store_verified(slug, True)
    await callback.answer(f"Магазин {slug} успешно верифицирован! ✅", show_alert=True)

    kb = InlineKeyboardBuilder()
    kb.button(text="🌐 Открыть витрину", url=f"{BASE_WEB_URL}/{slug}")
    kb.button(text="⚪ Снять верификацию", callback_data=f"unverify_{slug}")
    kb.button(text="👑 Панель Основателя", callback_data="admin_panel")
    kb.adjust(1)

    if callback.message:
        orig = callback.message.text or callback.message.caption or ""
        updated_text = (
            orig + f"\n\n🟢 <b>Статус: ВЕРИФИЦИРОВАН (Verified ✅)</b>\n<i>Подтверждено основателем @{callback.from_user.username or callback.from_user.id}</i>"
        )
        try:
            await callback.message.edit_text(updated_text, reply_markup=kb.as_markup())
        except Exception:
            pass

@dp.callback_query(F.data.startswith("unverify_"))
async def cb_unverify_action(callback: types.CallbackQuery):
    if not is_founder(callback.from_user.id):
        await callback.answer("❌ Действие доступно только основателю платформы", show_alert=True)
        return

    slug = callback.data.replace("unverify_", "").strip().lower()
    set_store_verified(slug, False)
    await callback.answer(f"Верификация магазина {slug} снята", show_alert=True)

    kb = InlineKeyboardBuilder()
    kb.button(text="✅ Выдать Verified", callback_data=f"verify_{slug}")
    kb.button(text="🌐 Открыть витрину", url=f"{BASE_WEB_URL}/{slug}")
    kb.adjust(1)

    if callback.message:
        try:
            await callback.message.edit_text(
                callback.message.text + f"\n\n⚪ <b>Верификация снята основателем.</b>",
                reply_markup=kb.as_markup()
            )
        except Exception:
            pass

@dp.callback_query(F.data.startswith("ban_"))
async def cb_ban_action(callback: types.CallbackQuery):
    if not is_founder(callback.from_user.id):
        await callback.answer("❌ Действие доступно только основателю платформы", show_alert=True)
        return

    slug = callback.data.replace("ban_", "").strip().lower()
    set_store_banned(slug, True)
    set_store_verified(slug, False)
    await callback.answer(f"Магазин {slug} заблокирован! 🚫", show_alert=True)

    if callback.message:
        try:
            await callback.message.edit_text(
                callback.message.text + f"\n\n🔴 <b>Статус: ЗАБЛОКИРОВАН АДМИНИСТРАТОРОМ</b>",
                reply_markup=None
            )
        except Exception:
            pass

@dp.callback_query(F.data == "admin_panel")
async def cb_admin_panel(callback: types.CallbackQuery):
    if not is_founder(callback.from_user.id):
        await callback.answer("❌ Доступ только для основателя", show_alert=True)
        return
    await callback.answer()
    if callback.message:
        await cmd_admin_panel(callback.message)

@dp.callback_query(F.data == "admin_stores")
async def cb_admin_stores(callback: types.CallbackQuery):
    if not is_founder(callback.from_user.id):
        await callback.answer("❌ Доступ только для основателя", show_alert=True)
        return
    await callback.answer()
    if callback.message:
        await cmd_list_stores(callback.message)

@dp.callback_query(F.data == "admin_stats")
async def cb_admin_stats(callback: types.CallbackQuery):
    if not is_founder(callback.from_user.id):
        await callback.answer("❌ Доступ только для основателя", show_alert=True)
        return
    await callback.answer()
    if callback.message:
        await cmd_platform_stats(callback.message)

# ----------------- STANDARD USER HANDLERS -----------------

@dp.message(CommandStart())
async def cmd_start(message: types.Message, command: CommandObject):
    args = command.args
    user_name = message.from_user.first_name if message.from_user else "друг"
    chat_id = message.chat.id
    username = message.from_user.username if message.from_user else None
    founder_flag = is_founder(chat_id)

    # Deep-link support for retrieving ID: /start getid
    if args and args.strip().lower() == "getid":
        user_mention = f" или юзернейм <code>@{username}</code>" if username else ""
        text = (
            f"🆔 <b>Ваш Telegram Chat ID:</b> <code>{chat_id}</code>\n"
            "<i>(Нажмите на номер выше, чтобы скопировать)</i>\n\n"
            f"✅ <b>Готово! Бот запомнил ваш аккаунт.</b>\n"
            f"В панели управления BioMart (вкладка «Telegram») укажите этот Chat ID{user_mention}.\n\n"
            "🚀 Теперь чеки всех новых заказов с вашей витрины будут мгновенно приходить прямо в этот чат!"
        )
        kb = InlineKeyboardBuilder()
        kb.button(text="⚙️ Открыть кабинет BioMart", url=f"{BASE_WEB_URL}/dashboard?tab=telegram")
        kb.button(text="📦 Получить демо-чек", callback_data="demo_receipt")
        kb.adjust(1)
        await message.answer(text, reply_markup=get_main_menu_keyboard(founder_flag))
        await message.answer("Быстрый переход:", reply_markup=kb.as_markup())
        return

    # Deep-link support for interactive store binding: /start bind_username_slug
    if args and args.startswith("bind_"):
        parts = args.split("_")
        target_user = parts[1] if len(parts) > 1 else (username or "seller")
        target_slug = parts[2] if len(parts) > 2 else "tashkent_drip"
        store_name = target_slug.replace("_", " ").upper()
        
        bind_text = (
            f"👋 <b>Здравствуйте, {user_name}!</b>\n\n"
            f"🏪 <b>Запрос на привязку витрины BioMart:</b>\n"
            f"Магазин: <b>{store_name}</b> (<code>{BASE_WEB_URL}/{target_slug}</code>)\n"
            f"Юзернейм: <code>@{username or target_user}</code>\n"
            f"Ваш Chat ID: <code>{chat_id}</code>\n\n"
            f"Разрешаете ли вы официальному боту <b>BioMart</b> присылать вам мгновенные чеки заказов от ваших покупателей в этот чат?"
        )
        kb = InlineKeyboardBuilder()
        kb.button(text="✅ Да, подтверждаю привязку", callback_data=f"confirm_bind_{target_slug}")
        kb.button(text="❌ Отклонить", callback_data="reject_bind")
        kb.adjust(1)
        await message.answer(bind_text, reply_markup=kb.as_markup())
        return

    # Deep-link support: /start store_tashkent_drip
    if args and args.startswith("store_"):
        slug = args.replace("store_", "").strip().lower()
        await show_store_details(message, slug)
        return

    user_str = f"@{username}" if username else f"ID: {chat_id}"
    founder_welcome = "\n\n👑 <b>Вы авторизованы как Основатель платформы (SuperAdmin)!</b>\nВам доступно модераторское меню: /admin" if founder_flag else ""

    text = (
        f"👋 <b>Ассалому алейкум, {user_name}! Добро пожаловать в официальный бот BioMart!</b>\n\n"
        "⚡ <b>BioMart</b> — платформа быстрых мобильных витрин для продавцов в Instagram и Telegram в Узбекистане.\n\n"
        f"🆔 <b>Ваш Telegram Chat ID:</b> <code>{chat_id}</code>\n"
        f"👤 <b>Ваш аккаунт:</b> <code>{user_str}</code>\n\n"
        "<i>(Скопируйте этот номер или укажите ваш @username в кабинете BioMart → вкладка «Telegram», чтобы бот моментально присылал вам уведомления о каждом заказе!)</i>\n\n"
        "<b>Возможности бота:</b>\n"
        "• Мгновенные уведомления о заказах с товарами, размером, адресом и телефоном\n"
        "• Кнопки быстрого звонка клиенту и адреса в Яндекс Картах\n"
        "• Просмотр каталогов и демо чеков\n"
        f"{founder_welcome}\n"
        "Выберите действие в меню ниже:"
    )

    kb = InlineKeyboardBuilder()
    kb.button(text="🛍 Открыть витрину (Tashkent Drip)", url=f"{BASE_WEB_URL}/tashkent_drip")
    kb.button(text="📦 Получить демо-чек заказа", callback_data="demo_receipt")
    kb.button(text="⚙️ Панель продавца", url=f"{BASE_WEB_URL}/dashboard?tab=telegram")
    kb.button(text="➕ Создать витрину", url=f"{BASE_WEB_URL}/register")
    if founder_flag:
        kb.button(text="👑 Открыть Админ-панель", callback_data="admin_panel")
        kb.adjust(1, 1, 1, 1, 1)
    else:
        kb.adjust(1)

    await message.answer(text, reply_markup=get_main_menu_keyboard(founder_flag))
    await message.answer("Быстрые действия:", reply_markup=kb.as_markup())

@dp.message(F.text == "🆔 Мой Chat ID")
@dp.message(Command("myid"))
@dp.message(Command("id"))
async def cmd_my_id(message: types.Message):
    username = message.from_user.username if message.from_user else None
    user_hint = f"\n👤 <b>Ваш юзернейм:</b> <code>@{username}</code>" if username else ""
    await message.answer(
        f"🆔 <b>Ваш Telegram Chat ID:</b> <code>{message.chat.id}</code>\n"
        f"<i>(Нажмите на номер, чтобы скопировать)</i>{user_hint}\n\n"
        "💡 <b>Как привязать приём заказов:</b>\n"
        f"Вставьте этот ID или ваш юзернейм <code>@{username or 'username'}</code> в панели управления BioMart (вкладка <b>Telegram</b>). "
        "После этого бот будет присылать все оформленные заказы прямо в этот чат!",
        reply_markup=get_main_menu_keyboard(is_founder(message.chat.id))
    )

@dp.message(F.text == "🛍 Магазин Tashkent Drip")
@dp.message(Command("demo"))
async def cmd_demo_store(message: types.Message):
    await show_store_details(message, "tashkent_drip")

async def show_store_details(message: types.Message, slug: str):
    stores = get_all_stores()
    store = stores.get(slug)
    if not store:
        await message.answer(
            f"❌ Магазин <code>{slug}</code> не найден.\n\n"
            f"Проверьте правильность написания или откройте тестовый: /store tashkent_drip"
        )
        return

    verified_badge = "✅ <b>(Verified • Подтверждено BioMart)</b>\n" if is_store_verified(slug) else "🟡 <b>(На проверке)</b>\n"
    text = (
        f"🏪 <b>{store['name']}</b>\n"
        f"{verified_badge}\n"
        f"📝 {store['description']}\n\n"
        f"🚚 <b>Доставка:</b> {store.get('delivery', 'Yandex / BTS')}\n"
        f"📞 <b>Телефон:</b> {store.get('phone', '—')}\n"
        f"🔗 <b>Веб-витрина:</b> {BASE_WEB_URL}/{slug}\n"
    )

    kb = InlineKeyboardBuilder()
    kb.button(text="🌐 Открыть витрину BioMart", url=f"{BASE_WEB_URL}/{slug}")
    if store.get("products"):
        kb.button(text="📋 Каталог товаров в Telegram", callback_data=f"catalog_{slug}")
    if store.get("telegram") and store["telegram"] != "—":
        clean_tg = store["telegram"].lstrip("@")
        kb.button(text="💬 Написать продавцу", url=f"https://t.me/{clean_tg}")
    kb.adjust(1)

    await message.answer(text, reply_markup=kb.as_markup())

@dp.message(F.text == "🔍 Поиск магазина")
async def cmd_search_prompt(message: types.Message):
    text = (
        "🔍 <b>Поиск витрины:</b>\n\n"
        "Отправьте юзернейм или ссылку на магазин, например:\n"
        "• <code>tashkent_drip</code>\n"
        "• <code>samarkand_sweets</code>\n"
        f"• <code>{BASE_WEB_URL}/tashkent_drip</code>"
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
        "💬 <b>Комментарий:</b> <i>Подъезд 2, этаж 4, домофон 28В</i>\n"
        "🗺 <a href=\"https://yandex.uz/maps\">Показать адрес на Яндекс Карте</a>\n\n"
        "🛍 <b>Состав заказа:</b>\n"
        "1. Худи Оверсайз «Ташкент» Drip Edition\n"
        "   └ Размер: <b>M</b> | 1 шт. × 320 000 сум\n\n"
        "💰 <b>Итого к оплате:</b> <b>320 000 сум</b>\n"
        "💳 <b>Оплата:</b> Переводом Payme / Click\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        "⏰ <i>Только что • Оформлено через BioMart</i>"
    )

    kb = InlineKeyboardBuilder()
    kb.button(text="✅ Принять в обработку", callback_data="order_accept_1042")
    kb.button(text="💬 Написать покупателю", url="https://t.me/sardor_alimov")
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

@dp.callback_query(F.data.startswith("confirm_bind_"))
async def cb_confirm_bind(callback: types.CallbackQuery):
    target_slug = callback.data.replace("confirm_bind_", "").strip()
    chat_id = callback.message.chat.id if callback.message else callback.from_user.id
    username = callback.from_user.username
    first_name = callback.from_user.first_name
    register_user(chat_id, username, first_name)

    # Store in mapping
    try:
        if TELEGRAM_USERS_FILE.exists():
            with open(TELEGRAM_USERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = {}
        data[f"store_{target_slug.lower()}"] = chat_id
        data[target_slug.lower()] = chat_id
        if str(chat_id) in data and isinstance(data[str(chat_id)], dict):
            data[str(chat_id)]["store_slug"] = target_slug.lower()
            data[str(chat_id)]["verified"] = True
        with open(TELEGRAM_USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.warning(f"Failed to record store mapping: {e}")

    await callback.answer("Привязка успешно подтверждена!", show_alert=True)
    user_str = f"@{username}" if username else str(chat_id)
    confirmed_text = (
        f"🎉 <b>Привязка успешно подтверждена!</b>\n\n"
        f"✅ Ваш Telegram-аккаунт <code>{user_str}</code> успешно подключён к магазину <code>{target_slug}</code>.\n"
        f"🆔 Ваш Chat ID: <code>{chat_id}</code>\n\n"
        f"Теперь при каждом заказе на вашей витрине вы моментально получите чек прямо сюда! 📦🚀"
    )
    if callback.message:
        await callback.message.edit_text(confirmed_text)

@dp.callback_query(F.data == "reject_bind")
async def cb_reject_bind(callback: types.CallbackQuery):
    await callback.answer("Привязка отклонена", show_alert=False)
    if callback.message:
        await callback.message.edit_text("❌ Привязка витрины отклонена.")

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
    clean = (
        message.text.strip()
        .lower()
        .replace("http://", "")
        .replace("https://", "")
        .replace("biomart.vercel.app/", "")
        .replace("biomart.uz/", "")
    )
    clean = clean.split("/")[0].strip()
    stores = get_all_stores()
    if clean in stores:
        await show_store_details(message, clean)
        return

    user_name = message.from_user.first_name if message.from_user else "друг"
    chat_id = message.chat.id
    username = message.from_user.username if message.from_user else None
    user_str = f" (@{username})" if username else ""
    founder_flag = is_founder(chat_id)

    text = (
        f"👋 Здравствуйте, <b>{user_name}</b>{user_str}!\n\n"
        "Я официальный бот платформы <b>BioMart</b>. Я помогаю продавцам мгновенно получать заказы покупателей с их витрин прямо сюда в Telegram.\n\n"
        f"🆔 <b>Ваш Telegram Chat ID:</b> <code>{chat_id}</code>\n"
        f"{f'👤 <b>Ваш юзернейм:</b> <code>@{username}</code>\n' if username else ''}\n"
        "Вы можете указать этот ID или ваш @username в кабинете продавца BioMart, чтобы принимать чеки заказов.\n\n"
        "Выберите действие ниже или отправьте слаг магазина (например: <code>tashkent_drip</code>):"
    )
    kb = InlineKeyboardBuilder()
    kb.button(text="🛍 Открыть витрину (Tashkent Drip)", url=f"{BASE_WEB_URL}/tashkent_drip")
    kb.button(text="📦 Демо чека заказа", callback_data="demo_receipt")
    kb.button(text="⚙️ Панель продавца", url=f"{BASE_WEB_URL}/dashboard?tab=telegram")
    if founder_flag:
        kb.button(text="👑 Открыть Админ-панель", callback_data="admin_panel")
        kb.adjust(1, 1, 1, 1)
    else:
        kb.adjust(1)

    await message.answer(text, reply_markup=get_main_menu_keyboard(founder_flag))
    await message.answer("Быстрые действия:", reply_markup=kb.as_markup())

async def main():
    logger.info("Starting BioMart Telegram Bot (@BioMartAssistant_bot)...")
    await bot.delete_webhook(drop_pending_updates=False)
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped.")
