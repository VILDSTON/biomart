import asyncio
import edge_tts

lines = [
    "Сколько можно отвечать «цена?» в директе?",
    "Размер? Доставка? Куда скинуть оплату? Пока ответишь, клиент уже остыл.",
    "Сделайте витрину в BioMart. Одна ссылка в шапке профиля, и клиент сам выбирает товар.",
    "А заказ сразу приходит вам в Telegram.",
    "Бесплатно, без комиссии. BioMart точка уз."
]

async def test_all():
    for i, line in enumerate(lines):
        clean_text = line.replace("«", '"').replace("»", '"')
        c = edge_tts.Communicate(clean_text, "ru-RU-DmitryNeural", rate="-5%")
        out_f = rf"C:\Users\Hp\BioMart\video\public\test_dmitry_scene{i+1}.mp3"
        await c.save(out_f)
        print(f"Scene {i+1} success: {out_f}")

asyncio.run(test_all())
