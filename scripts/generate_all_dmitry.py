# -*- coding: utf-8 -*-
import asyncio
import os
import subprocess
import edge_tts

OUT_DIR = r"C:\Users\Hp\BioMart\video\public\voice_v2"
os.makedirs(OUT_DIR, exist_ok=True)

VOICE = "ru-RU-DmitryNeural"
RATE = "-5%"

scenes = [
    {
        "id": "scene1.mp3",
        "text": "Сколько можно отвечать цена в директе?"
    },
    {
        "id": "scene2.mp3",
        "text": "Размер? Доставка? Куда скинуть оплату? Пока ответишь, клиент уже остыл."
    },
    {
        "id": "scene3.mp3",
        "text": "Сделайте витрину в BioMart. Одна ссылка в шапке профиля, и клиент сам выбирает товар."
    },
    {
        "id": "scene4.mp3",
        "text": "А заказ сразу приходит вам в Telegram."
    },
    {
        "id": "scene5.mp3",
        "text": "Бесплатно, без комиссии. BioMart точка уз."
    }
]

async def generate():
    for item in scenes:
        out_f = os.path.join(OUT_DIR, item["id"])
        print(f"Generating {item['id']}...")
        c = edge_tts.Communicate(item["text"], VOICE, rate=RATE)
        await c.save(out_f)
        
        dur_cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            out_f
        ]
        dur = subprocess.check_output(dur_cmd).decode().strip()
        print(f"Generated {item['id']}: duration = {float(dur):.2f}s, size = {os.path.getsize(out_f)} bytes")
        await asyncio.sleep(0.5)

if __name__ == "__main__":
    asyncio.run(generate())
