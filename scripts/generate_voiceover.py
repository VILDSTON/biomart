import asyncio
import os
import edge_tts

VOICE = "ru-RU-SvetlanaNeural"
OUT_DIR = r"C:\Users\Hp\BioMart\video\public"

scenes = [
    {
        "id": "voice_scene1.mp3",
        "text": "Устали отвечать на сотни одинаковых сообщений в Direct? «Сколько стоит?», «Есть ли размер?»... Клиенты устают ждать и уходят.",
        "rate": "+5%"
    },
    {
        "id": "voice_scene2.mp3",
        "text": "BioMart решает это раз и навсегда! Ваша персональная витрина готова за две минуты: стильный каталог, выбор размеров и заказ в два клика.",
        "rate": "+4%"
    },
    {
        "id": "voice_scene3.mp3",
        "text": "Каждый заказ мгновенно прилетает прямо в ваш Telegram бот: товары, контакты и точная геолокация на Яндекс Картах.",
        "rate": "+4%"
    },
    {
        "id": "voice_scene4.mp3",
        "text": "Автоматизируйте продажи и растите бизнес уже сегодня вместе с BioMart!",
        "rate": "+5%"
    }
]

async def generate():
    for item in scenes:
        out_path = os.path.join(OUT_DIR, item["id"])
        comm = edge_tts.Communicate(item["text"], voice=VOICE, rate=item["rate"])
        await comm.save(out_path)
        print(f"Generated {item['id']} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    asyncio.run(generate())
