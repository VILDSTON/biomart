import asyncio
import edge_tts
import subprocess

async def main():
    text = "Бесплатно, без комиссии. BioMart точка уз."
    c = edge_tts.Communicate(text, "ru-RU-DmitryNeural")
    raw_path = r"C:\Users\Hp\BioMart\video\public\voice_v3\raw_s5.mp3"
    final_path = r"C:\Users\Hp\BioMart\video\public\voice_v3\scene5.mp3"
    await c.save(raw_path)
    cmd = ["ffmpeg", "-y", "-i", raw_path, "-filter:a", "atempo=1.05", final_path]
    subprocess.run(cmd, check=True)
    print("Scene 5 updated with точка уз successfully!")

asyncio.run(main())
