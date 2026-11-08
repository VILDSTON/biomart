import asyncio
import edge_tts

async def test_voice(voice_name):
    print(f"Testing {voice_name}...")
    try:
        comm = edge_tts.Communicate("Сколько можно отвечать цена в директе?", voice=voice_name)
        audio_bytes = 0
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                audio_bytes += len(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                pass
        print(f"  Result: Success! Received {audio_bytes} bytes of audio.")
        return True
    except Exception as e:
        print(f"  Result: Failed with error: {e}")
        return False

async def main():
    voices = await edge_tts.list_voices()
    male_voices = [v for v in voices if v["Gender"] == "Male" and any(k in v["Locale"] for k in ["ru", "uz", "kk", "uk", "be"])]
    print("Found candidate male voices:", [(v["ShortName"], v["Locale"]) for v in male_voices])
    
    for v in male_voices:
        await test_voice(v["ShortName"])

if __name__ == "__main__":
    asyncio.run(main())
