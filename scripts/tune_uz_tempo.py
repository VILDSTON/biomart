import os
import subprocess

OUT_DIR = r"C:\Users\Hp\BioMart\video\public\voice_uz"

tempos = {
    "scene1.mp3": 1.14,
    "scene2.mp3": 1.12,
    "scene3.mp3": 1.14,
    "scene4.mp3": 1.10,
    "scene5.mp3": 1.05,
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
    print(f"Uzbek {fname}: {dur:.2f}s")
