import json
import os
import subprocess

import av
_orig_open = av.open
def _patched_open(*args, **kwargs):
    kwargs.pop("metadata_errors", None)
    return _orig_open(*args, **kwargs)
av.open = _patched_open

from faster_whisper import WhisperModel

FFMPEG = r"C:\Users\Hp\BioMart\video\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
MASTER_VIDEO = r"C:\Users\Hp\BioMart\video-hyperframes\assets\master_edit.mp4"
MASTER_WAV = r"C:\Users\Hp\BioMart\video-hyperframes\assets\master_audio.wav"
OUT_JSON = r"C:\Users\Hp\BioMart\video-hyperframes\assets\subtitles.json"
OUT_SRT = r"C:\Users\Hp\BioMart\video-hyperframes\assets\subtitles.srt"

print("Extracting audio from master edit...")
subprocess.run([
    FFMPEG,
    "-i", MASTER_VIDEO,
    "-vn",
    "-ar", "16000",
    "-ac", "1",
    "-c:a", "pcm_s16le",
    MASTER_WAV,
    "-y"
], check=True)

print("Transcribing master audio with word-level timestamps...")
model = WhisperModel("base", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    MASTER_WAV,
    language="ru",
    word_timestamps=True,
    vad_filter=True,
    vad_parameters=dict(min_silence_duration_ms=400)
)

sub_groups = []
srt_lines = []
srt_index = 1

def format_timestamp(sec):
    hrs = int(sec // 3600)
    mins = int((sec % 3600) // 60)
    secs = int(sec % 60)
    millis = int((sec - int(sec)) * 1000)
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

for seg in segments:
    words = seg.words if seg.words else []
    if not words:
        continue
    
    # Group words into 3-5 word chunks for energetic Reels/Shorts dynamic captions
    chunk_size = 4
    for i in range(0, len(words), chunk_size):
        chunk = words[i:i+chunk_size]
        start_t = round(chunk[0].start, 2)
        end_t = round(chunk[-1].end, 2)
        chunk_text = " ".join([w.word.strip() for w in chunk])
        
        # Word items with timing for karaoke highlighting
        word_items = []
        for w in chunk:
            word_items.append({
                "word": w.word.strip(),
                "start": round(w.start, 2),
                "end": round(w.end, 2)
            })
            
        sub_groups.append({
            "id": f"sub_{len(sub_groups)}",
            "start": start_t,
            "end": end_t,
            "text": chunk_text,
            "words": word_items
        })
        
        # SRT format
        srt_lines.append(f"{srt_index}\n{format_timestamp(start_t)} --> {format_timestamp(end_t)}\n{chunk_text}\n")
        srt_index += 1

with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump({
        "duration": info.duration,
        "language": info.language,
        "captions": sub_groups
    }, f, ensure_ascii=False, indent=2)

with open(OUT_SRT, "w", encoding="utf-8") as f:
    f.write("\n".join(srt_lines))

print(f"Generated {len(sub_groups)} caption cues. Saved to {OUT_JSON} and {OUT_SRT}")
