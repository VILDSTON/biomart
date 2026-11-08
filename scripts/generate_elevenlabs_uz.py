import urllib.request
import json
import os
import subprocess

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
# Using Adam (pNInz6obpgDQGcFmaJgB) with eleven_multilingual_v2
VOICE_ID = "pNInz6obpgDQGcFmaJgB"
OUT_DIR = r"C:\Users\Hp\BioMart\video\public\voice_uz"
os.makedirs(OUT_DIR, exist_ok=True)

scenes_uz = [
    {
        "id": "scene1.mp3",
        "text": "Direct-da «narxi qancha?» deb javob berishdan charchadingizmi?"
    },
    {
        "id": "scene2.mp3",
        "text": "O‘lchami? Yetkazib berish? Qayerga to‘lov qilay? Siz javob berguncha xaridor sovib bo‘ladi."
    },
    {
        "id": "scene3.mp3",
        "text": "BioMart-da vitrina oching. Profil sarlavhasida bitta havola, va xaridor mahsulotni o‘zi tanlaydi."
    },
    {
        "id": "scene4.mp3",
        "text": "Buyurtma esa darhol Telegramingizga keladi."
    },
    {
        "id": "scene5.mp3",
        "text": "Bepul. BioMart."
    }
]

def generate_voice():
    durations = []
    for item in scenes_uz:
        out_f = os.path.join(OUT_DIR, item["id"])
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
        payload = {
            "text": item["text"],
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.65,
                "similarity_boost": 0.85,
                "style": 0.15,
                "use_speaker_boost": True
            }
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "xi-api-key": API_KEY,
                "Content-Type": "application/json"
            }
        )
        with urllib.request.urlopen(req) as resp:
            audio_bytes = resp.read()
            with open(out_f, "wb") as f:
                f.write(audio_bytes)
                
        dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_f]
        dur = float(subprocess.check_output(dur_cmd).decode().strip())
        durations.append((item["id"], dur, item["text"]))
        print(f"Generated {item['id']}: duration = {dur:.2f}s ({len(audio_bytes)} bytes)")

    print("\nAll ElevenLabs Uzbek scene files generated:")
    total = sum(d for _, d, _ in durations)
    for sid, d, t in durations:
        print(f"  {sid}: {d:.2f}s | {t}")
    print(f"Total speech duration: {total:.2f}s")

if __name__ == "__main__":
    generate_voice()
