import asyncio
import edge_tts

async def test_translit():
    test_cases = [
        ("Сделайте витрину в BioMart. Одна ссылка в шапке профиля, и клиент сам выбирает товар.", "latin"),
        ("Сделайте витрину в Биомарт. Одна ссылка в шапке профиля, и клиент сам выбирает товар.", "cyrillic"),
        ("А заказ сразу приходит вам в Telegram.", "tg_latin"),
        ("А заказ сразу приходит вам в Телеграм.", "tg_cyrillic"),
        ("Бесплатно, без комиссии. BioMart точка уз.", "bm_latin"),
        ("Бесплатно, без комиссии. Биомарт точка уз.", "bm_cyrillic")
    ]
    for text, label in test_cases:
        try:
            c = edge_tts.Communicate(text, "ru-RU-DmitryNeural")
            out = f"test_{label}.mp3"
            await c.save(out)
            print(f"Success for [{label}]")
        except Exception as e:
            print(f"Failed for [{label}]: {e}")

asyncio.run(test_translit())
