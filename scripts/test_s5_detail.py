import asyncio
import edge_tts

async def t():
    for text in [
        "Бесплатно, без комиссии. Биомарт точка у зет.",
        "Бесплатно, без комиссии. Биомарт точка уз.",
        "Бесплатно, без комиссии. BioMart точка uz."
    ]:
        try:
            c = edge_tts.Communicate(text, "ru-RU-DmitryNeural")
            await c.save("s5_test.mp3")
            print(f"Success: {text}")
            return
        except Exception as e:
            print(f"Failed: {text} -> {e}")

asyncio.run(t())
