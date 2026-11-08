import asyncio
import edge_tts

async def test():
    for voice in ["ru-RU-DmitryNeural"]:
        try:
            c = edge_tts.Communicate("Привет", voice)
            await c.save(r"C:\Users\Hp\BioMart\video\public\test_dmitry_p.mp3")
            print(f"Success with {voice}!")
            return
        except Exception as e:
            print(f"Failed with {voice}: {e}")

asyncio.run(test())
