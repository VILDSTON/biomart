import os
import subprocess

OUT_DIR = r"C:\Users\Hp\BioMart\video\public\voice_v3"

# Target durations to perfectly fit 23.5s total:
# Scene 1: 0 - 3.2s  (voice ~2.8s)
# Scene 2: 3.2 - 8.5s (voice ~5.0s)
# Scene 3: 8.5 - 15.0s (voice ~6.2s)
# Scene 4: 15.0 - 19.0s (voice ~3.2s)
# Scene 5: 19.0 - 23.5s (voice ~4.0s)

tempos = {
    "scene1.mp3": 1.15,
    "scene2.mp3": 1.65, # Urgent questions in direct: fast & punchy!
    "scene3.mp3": 1.25,
    "scene4.mp3": 1.10,
    "scene5.mp3": 1.20,
}

for fname, tempo in tempos.items():
    orig = os.path.join(OUT_DIR, fname)
    tmp = os.path.join(OUT_DIR, "tmp_" + fname)
    os.rename(orig, tmp)
    cmd = ["ffmpeg", "-y", "-i", tmp, "-filter:a", f"atempo={tempo}", orig]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(tmp)
    
    dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", orig]
    dur = float(subprocess.check_output(dur_cmd).decode().strip())
    print(f"{fname}: {dur:.2f}s")
