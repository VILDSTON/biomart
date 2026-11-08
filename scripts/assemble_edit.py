import os
import subprocess
import json

FFMPEG = r"C:\Users\Hp\BioMart\video\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
SRC_VIDEO = r"C:\Users\Hp\BioMart\assets-raw\video_pro_biomart.mp4"
OUT_DIR = r"C:\Users\Hp\BioMart\assets-raw\clips"
HYPERFRAMES_ASSETS = r"C:\Users\Hp\BioMart\video-hyperframes\assets"

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(HYPERFRAMES_ASSETS, exist_ok=True)

# Key scenes to extract with tight editing (start_sec, end_sec, label)
SCENES = [
    # Scene 1: Storefront Intro
    (0.5, 17.5, "01_storefront"),
    # Scene 2: Selecting size & 1-Click order
    (22.0, 27.5, "02_cart_item"),
    (46.0, 58.0, "03_cart_order"),
    # Scene 3: Telegram order notification & action buttons
    (71.5, 83.0, "04_tg_order_received"),
    (88.0, 104.0, "05_tg_call_and_map"),
    # Scene 4: Analytics, Excel & AI Designer
    (122.0, 136.0, "06_analytics"),
    (155.0, 166.0, "07_categories"),
    (200.0, 222.0, "08_ai_designer"),
    # Scene 5: Tariffs (Start Free, Pro AI) & Outro
    (259.5, 274.0, "09_tariffs"),
    (280.0, 290.0, "10_pro_ai"),
    (311.5, 319.2, "11_outro")
]

clip_paths = []

for idx, (start, end, label) in enumerate(SCENES):
    out_clip = os.path.join(OUT_DIR, f"{label}.mp4")
    duration = end - start
    print(f"Rendering {label} ({start}s -> {end}s, dur: {duration:.1f}s)...")
    
    # Crop to clean phone screen without keyboard: crop=980:1300:50:50,scale=1080:1920
    vf_filter = "crop=980:1300:50:50,scale=1080:1920"
    
    cmd = [
        FFMPEG,
        "-ss", str(start),
        "-t", str(duration),
        "-i", SRC_VIDEO,
        "-vf", vf_filter,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "48000",
        out_clip,
        "-y"
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode != 0:
        print(f"Error on {label}:", res.stderr.decode('utf-8', errors='ignore')[-300:])
    else:
        clip_paths.append(out_clip)
        print(f"Done {label}")

# Create concat list
concat_txt = os.path.join(OUT_DIR, "concat.txt")
with open(concat_txt, "w", encoding="utf-8") as f:
    for cp in clip_paths:
        f.write(f"file '{cp}'\n")

# Concat all scenes into master edited video
master_video = os.path.join(HYPERFRAMES_ASSETS, "master_edit.mp4")
print(f"\nConcatenating {len(clip_paths)} clips into {master_video}...")

concat_cmd = [
    FFMPEG,
    "-f", "concat",
    "-safe", "0",
    "-i", concat_txt,
    "-c", "copy",
    master_video,
    "-y"
]

res = subprocess.run(concat_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
if res.returncode == 0:
    print(f"Master edited video successfully created: {master_video}")
else:
    print("Concat error:", res.stderr.decode('utf-8', errors='ignore')[-300:])

