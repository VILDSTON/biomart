import asyncio
import edge_tts

async def t():
    for word in ["Биомарт точка ю-зет", "Биомарт точка юз", "Биомарт точка u z", "Биомарт"]:
        txt = f"Бесплатно, без комиссии. {word}."
        try:
            c = edge_tts.Communicate(txt, "ru-RU-DmitryNeural")
            await c.save(f"s5_{word[:8]}.mp3")
            print(f"Success: {word}")
        except Exception as e:
            print(f"Failed: {word} -> {e}")

asyncio.run(t())
