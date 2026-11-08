import asyncio
import edge_tts

async def main():
    text = "Сделайте витрину в BioMart. Одна ссылка в шапке профиля, и клиент сам выбирает товар."
    c = edge_tts.Communicate(text, "ru-RU-DmitryNeural", rate="-5%")
    await c.save(r"C:\Users\Hp\BioMart\video\public\voice_dmitry_scene3.mp3")
    print("Scene 3 succeeded with ru-RU-DmitryNeural!")

if __name__ == "__main__":
    asyncio.run(main())
