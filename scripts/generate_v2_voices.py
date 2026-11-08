import asyncio
import os
import subprocess
import time
import edge_tts

OUT_DIR = r"C:\Users\Hp\BioMart\video\public\voice_v2"
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
        "text": "Бесплатно, без комиссии. Биомарт точка уз."
    }
]

async def generate_single(item):
    raw_f = os.path.join(OUT_DIR, "raw_" + item["id"])
    out_f = os.path.join(OUT_DIR, item["id"])
    
    if os.path.exists(out_f) and os.path.getsize(out_f) > 1000:
        dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_f]
        dur = float(subprocess.check_output(dur_cmd).decode().strip())
        print(f"Already exists: {item['id']} ({dur:.2f}s)")
        return dur

    print(f"Generating {item['id']}...")
    for attempt in range(4):
        try:
            c = edge_tts.Communicate(item["text"], VOICE)
            await c.save(raw_f)
            cmd = ["ffmpeg", "-y", "-i", raw_f, "-filter:a", "atempo=0.95", out_f]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if os.path.exists(raw_f):
                os.remove(raw_f)
            dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_f]
            dur = float(subprocess.check_output(dur_cmd).decode().strip())
            print(f"Success {item['id']}: duration = {dur:.2f}s")
            return dur
        except Exception as e:
            print(f"Attempt {attempt+1} failed for {item['id']}: {e}. Retrying in 3s...")
            await asyncio.sleep(3.0)
    raise RuntimeError(f"Could not generate {item['id']}")

async def main():
    durations = []
    for item in scenes:
        dur = await generate_single(item)
        durations.append((item["id"], dur, item["text"]))
        await asyncio.sleep(2.0)
        
    print("\nAll scenes generated:")
    total = sum(d for _, d, _ in durations)
    for sid, d, t in durations:
        print(f"  {sid}: {d:.2f}s | {t}")
    print(f"Total: {total:.2f}s")

if __name__ == "__main__":
    asyncio.run(main())
