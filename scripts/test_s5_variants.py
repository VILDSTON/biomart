import asyncio
import edge_tts

async def test_s5():
    variants = [
        "Бесплатно, без комиссии. BioMart.uz",
        "Бесплатно, без комиссии. BioMart.",
        "Бесплатно, без комиссии. Сайт biomart.uz",
        "Бесплатно, без комиссии. Биомарт точка ю-зет.",
        "Бесплатно, без комиссии. Биомарт точка уз"
    ]
    for v in variants:
        try:
            c = edge_tts.Communicate(v, "ru-RU-DmitryNeural")
            await c.save(r"C:\Users\Hp\BioMart\video\public\voice_v2\scene5.mp3")
            print(f"Success for variant: {v}")
            return
        except Exception as e:
            print(f"Failed '{v}': {e}")
            await asyncio.sleep(1.0)

asyncio.run(test_s5())
