import asyncio
import edge_tts

async def main():
    text = "Устали от сотен одинаковых вопросов в Direct? BioMart превращает ваш Instagram в умный онлайн-магазин за две минуты. Все заказы мгновенно приходят в Telegram с точной локацией на карте."
    communicate = edge_tts.Communicate(text, voice="ru-RU-DmitryNeural", rate="+5%")
    await communicate.save(r"C:\Users\Hp\BioMart\video\public\test_voice.mp3")
    print("Voice generated successfully with ru-RU-DmitryNeural!")

if __name__ == "__main__":
    asyncio.run(main())
