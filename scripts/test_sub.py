import asyncio
import edge_tts

async def test_sub():
    text = "Сделайте витрину в BioMart."
    try:
        c = edge_tts.Communicate(text, "ru-RU-DmitryNeural")
        await c.save("sub1.mp3")
        print("sub1 success")
    except Exception as e:
        print(f"sub1 error: {e}")

    text2 = "Одна ссылка в шапке профиля, и клиент сам выбирает товар."
    try:
        c = edge_tts.Communicate(text2, "ru-RU-DmitryNeural")
        await c.save("sub2.mp3")
        print("sub2 success")
    except Exception as e:
        print(f"sub2 error: {e}")

asyncio.run(test_sub())
