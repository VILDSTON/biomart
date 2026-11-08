import asyncio
import edge_tts

async def test_rates():
    for r in ["+0%", "-5%", "+5%"]:
        try:
            c = edge_tts.Communicate("Сколько можно отвечать цена в директе?", "ru-RU-DmitryNeural", rate=r)
            await c.save(f"test_rate_{r.replace('%', '').replace('-', 'm').replace('+', 'p')}.mp3")
            print(f"Rate {r} SUCCEEDED!")
        except Exception as e:
            print(f"Rate {r} FAILED: {e}")

asyncio.run(test_rates())
