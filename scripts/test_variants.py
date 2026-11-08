import asyncio
import edge_tts
import time

async def test_sentences():
    variants = [
        "Размер, доставка, куда скинуть оплату. Пока ответишь, клиент уже остыл.",
        "Размер? Доставка? Куда скинуть оплату? Пока ответишь, клиент уже остыл.",
        "Пока ответишь в директе, клиент уже остыл."
    ]
    for idx, v in enumerate(variants):
        time.sleep(1.5)
        try:
            c = edge_tts.Communicate(v, "ru-RU-DmitryNeural", rate="-5%")
            out_name = f"test_var_{idx}.mp3"
            await c.save(out_name)
            print(f"Variant {idx} succeeded: {v}")
        except Exception as e:
            print(f"Variant {idx} failed: {e}")

asyncio.run(test_sentences())
