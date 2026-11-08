import asyncio
import os
import subprocess
import time
import edge_tts

OUT_DIR = r"C:\Users\Hp\BioMart\video\public\voice_v3"
os.makedirs(OUT_DIR, exist_ok=True)

VOICE = "ru-RU-DmitryNeural"

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
        "text": "Сделайте витрину в Биомарт. Одна ссылка в шапке профиля, и клиент сам выбирает товар."
    },
    {
        "id": "scene4.mp3",
        "text": "А заказ сразу приходит вам в Telegram."
    },
    {
        "id": "scene5.mp3",
        "text": "Бесплатно, без комиссии. BioMart."
    }
]

async def generate():
    results = []
    for item in scenes:
        raw_f = os.path.join(OUT_DIR, "raw_" + item["id"])
        out_f = os.path.join(OUT_DIR, item["id"])
        
        print(f"Generating {item['id']}...")
        success = False
        for attempt in range(4):
            try:
                c = edge_tts.Communicate(item["text"], VOICE)
                await c.save(raw_f)
                
                # Apply atempo=0.95 (5% slower, calm and natural)
                cmd = ["ffmpeg", "-y", "-i", raw_f, "-filter:a", "atempo=0.95", out_f]
                subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                if os.path.exists(raw_f):
                    os.remove(raw_f)
                    
                dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_f]
                dur = float(subprocess.check_output(dur_cmd).decode().strip())
                print(f"  OK {item['id']}: {dur:.2f}s")
                results.append((item["id"], dur, item["text"]))
                success = True
                break
            except Exception as e:
                print(f"  Attempt {attempt+1} failed: {e}. Waiting 2s...")
                await asyncio.sleep(2.0)
                
        if not success:
            raise RuntimeError(f"Failed to generate {item['id']}")
        await asyncio.sleep(1.0)
        
    print("\nAll audio files generated successfully:")
    total = 0
    for sid, dur, txt in results:
        total += dur
        print(f"  {sid}: {dur:.2f}s")
    print(f"Total speech duration: {total:.2f}s")

if __name__ == "__main__":
    asyncio.run(generate())
