import urllib.request
import json
import os
import subprocess

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
VOICE_ID = "pNInz6obpgDQGcFmaJgB"
OUT_FILE = r"C:\Users\Hp\BioMart\video\public\voice_eleven\scene5.mp3"

text = "Бесплатно. Продавайте проще. BioMart."

def generate():
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    payload = {
        "text": text,
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
        with open(OUT_FILE, "wb") as f:
            f.write(audio_bytes)
            
    dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", OUT_FILE]
    dur = float(subprocess.check_output(dur_cmd).decode().strip())
    print(f"Generated scene5.mp3: duration = {dur:.2f}s ({len(audio_bytes)} bytes)")

if __name__ == "__main__":
    generate()
