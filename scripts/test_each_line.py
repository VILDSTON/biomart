import asyncio
import edge_tts

lines = [
    "Сколько можно отвечать «цена?» в директе?",
    "Размер? Доставка? Куда скинуть оплату? Пока ответишь, клиент уже остыл.",
    "Сделайте витрину в BioMart. Одна ссылка в шапке профиля, и клиент сам выбирает товар.",
    "А заказ сразу приходит вам в Telegram.",
    "Бесплатно, без комиссии. BioMart точка уз."
]

async def test_line(i, text):
    print(f"Trying line {i}: {text}")
    try:
        clean = text.replace("«", "").replace("»", "").replace('"', '')
        c = edge_tts.Communicate(clean, "ru-RU-DmitryNeural")
        await c.save(f"test_line_{i}.mp3")
        print(f"Line {i} succeeded!")
    except Exception as e:
        print(f"Line {i} failed: {e}")

async def main():
    for i, line in enumerate(lines):
        await test_line(i+1, line)

asyncio.run(main())
