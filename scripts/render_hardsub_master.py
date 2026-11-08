import os
import sys
import json
import time
import subprocess
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

VIDEO_IN = r"C:\Users\Hp\BioMart\video-hyperframes\assets\master_edit.mp4"
TEMP_VIDEO = r"C:\Users\Hp\BioMart\video-hyperframes\assets\temp_video_subbed.mp4"
VIDEO_OUT = r"C:\Users\Hp\BioMart\video-hyperframes\assets\master_edit_subtitled.mp4"
SUBS_JSON = r"C:\Users\Hp\BioMart\video-hyperframes\assets\subtitles.json"
FFMPEG_BIN = r"C:\Users\Hp\.gemini\antigravity\bin\ffmpeg.exe"

with open(SUBS_JSON, "r", encoding="utf-8") as f:
    subs_data = json.load(f)

captions = subs_data["captions"]

# Fonts
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
font_subs = ImageFont.truetype(FONT_BOLD, 46)
font_badge = ImageFont.truetype(FONT_BOLD, 30)
font_brand = ImageFont.truetype(FONT_BOLD, 26)

badges = [
    (0.0, 20.0, "🛍️  Витрина товаров для Instagram"),
    (20.0, 46.0, "🛒  Корзина и оформление в 2 клика"),
    (46.0, 74.0, "⚡  Мгновенные заказы в Telegram"),
    (74.0, 94.0, "📍  Интеграция с Яндекс Картами"),
    (94.0, 118.0, "📦  Управление каталогом и складом"),
    (118.0, 142.0, "🚀  PRO-тариф и масштабирование"),
]

# 1. Pre-render Brand Pill
brand_text = "BioMart  |  Обзор платформы"
brand_w, brand_h = 420, 56
brand_img = Image.new("RGBA", (brand_w, brand_h), (0, 0, 0, 0))
d_brand = ImageDraw.Draw(brand_img)
d_brand.rounded_rectangle([0, 0, brand_w, brand_h], radius=28, fill=(15, 23, 42, 230), outline=(16, 185, 129, 200), width=2)
d_brand.ellipse([22, 22, 34, 34], fill=(16, 185, 129))
d_brand.text((46, 12), brand_text, font=font_brand, fill=(255, 255, 255))
brand_np = np.array(brand_img)
brand_rgb = cv2.cvtColor(brand_np[:, :, :3], cv2.COLOR_RGB2BGR)
brand_a = brand_np[:, :, 3:] / 255.0

# 2. Pre-render Badges
badge_cache = {}
bw, bh = 560, 64
for _, _, b_title in badges:
    b_img = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    db = ImageDraw.Draw(b_img)
    db.rounded_rectangle([0, 0, bw, bh], radius=20, fill=(9, 14, 26, 235), outline=(52, 211, 153, 210), width=2)
    bbox = db.textbbox((0, 0), b_title, font=font_badge)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (bw - tw) // 2
    ty = (bh - th) // 2 - 2
    db.text((tx, ty), b_title, font=font_badge, fill=(240, 253, 244))
    b_arr = np.array(b_img)
    badge_cache[b_title] = (
        cv2.cvtColor(b_arr[:, :, :3], cv2.COLOR_RGB2BGR),
        b_arr[:, :, 3:] / 255.0
    )

dummy_img = Image.new("RGBA", (100, 100))
dummy_draw = ImageDraw.Draw(dummy_img)
space_width = dummy_draw.textbbox((0, 0), " ", font=font_subs)[2]

subtitle_cache = {}

def get_subtitle_overlay(active_caption, t_sec):
    if not active_caption or not active_caption.get("words"):
        return None
        
    words = active_caption["words"]
    active_idx = -1
    for i, w_obj in enumerate(words):
        if w_obj["start"] <= t_sec <= w_obj["end"] + 0.15:
            active_idx = i
            break
            
    cache_key = (active_caption["id"], active_idx)
    if cache_key in subtitle_cache:
        return subtitle_cache[cache_key]

    word_render_data = []
    for i, w_obj in enumerate(words):
        w_str = w_obj["word"]
        w_bbox = dummy_draw.textbbox((0, 0), w_str, font=font_subs)
        w_width = w_bbox[2] - w_bbox[0]
        word_render_data.append({
            "word": w_str,
            "width": w_width,
            "active": (i == active_idx)
        })
        
    lines = []
    cur_line = []
    cur_line_w = 0
    for item in word_render_data:
        added_w = item["width"] if not cur_line else (space_width + item["width"])
        if cur_line and (cur_line_w + added_w > 860):
            lines.append((cur_line, cur_line_w))
            cur_line = [item]
            cur_line_w = item["width"]
        else:
            cur_line.append(item)
            cur_line_w += added_w
    if cur_line:
        lines.append((cur_line, cur_line_w))
        
    line_height = 62
    sub_pad_y = 18
    sub_pad_x = 36
    total_sub_h = len(lines) * line_height + sub_pad_y * 2
    max_line_w = max(lw for _, lw in lines) if lines else 300
    total_sub_w = min(max(max_line_w + sub_pad_x * 2, 420), 960)
    
    sub_img = Image.new("RGBA", (total_sub_w, total_sub_h), (0, 0, 0, 0))
    d_sub = ImageDraw.Draw(sub_img)
    d_sub.rounded_rectangle(
        [0, 0, total_sub_w, total_sub_h],
        radius=26,
        fill=(10, 15, 29, 235),
        outline=(16, 185, 129, 160),
        width=2
    )
    
    for l_idx, (line_words, l_w) in enumerate(lines):
        start_x = (total_sub_w - l_w) // 2
        y_pos = sub_pad_y + l_idx * line_height + 4
        x_pos = start_x
        
        for item in line_words:
            w_str = item["word"]
            if item["active"]:
                fill_col = (52, 211, 153, 255) # emerald-400
                d_sub.rounded_rectangle(
                    [x_pos - 6, y_pos - 2, x_pos + item["width"] + 6, y_pos + line_height - 12],
                    radius=8,
                    fill=(16, 185, 129, 70)
                )
            else:
                fill_col = (255, 255, 255, 255)
                
            d_sub.text((x_pos, y_pos), w_str, font=font_subs, fill=fill_col)
            x_pos += item["width"] + space_width

    sub_np = np.array(sub_img)
    sub_rgb = cv2.cvtColor(sub_np[:, :, :3], cv2.COLOR_RGB2BGR)
    sub_a = sub_np[:, :, 3:] / 255.0
    
    res = (total_sub_w, total_sub_h, sub_rgb, sub_a)
    subtitle_cache[cache_key] = res
    return res

def process_video():
    cap = cv2.VideoCapture(VIDEO_IN)
    src_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_sec = total_frames / src_fps
    
    print(f"Rendering hardsub video: {width}x{height} @ {src_fps:.2f}fps ({total_sec:.1f}s, {total_frames} frames)")
    
    # Use mp4v VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(TEMP_VIDEO, fourcc, src_fps, (width, height))
    
    brand_x = (width - brand_w) // 2
    brand_y = 35
    bx = (width - bw) // 2
    by = 105
    
    cap_idx = 0
    t0 = time.time()
    frame_i = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        t_sec = frame_i / src_fps
            
        # 1. Top progress bar
        bar_w = int(width * (t_sec / total_sec))
        if bar_w > 0:
            cv2.rectangle(frame, (0, 0), (bar_w, 8), (129, 185, 16), -1)
            cv2.circle(frame, (bar_w, 4), 6, (180, 240, 52), -1)

        # 2. Brand pill
        roi_b = frame[brand_y:brand_y+brand_h, brand_x:brand_x+brand_w]
        frame[brand_y:brand_y+brand_h, brand_x:brand_x+brand_w] = (roi_b * (1.0 - brand_a) + brand_rgb * brand_a).astype(np.uint8)

        # 3. Badge
        curr_badge = None
        for b_start, b_end, b_title in badges:
            if b_start <= t_sec < b_end:
                curr_badge = b_title
                break
        if curr_badge and curr_badge in badge_cache:
            bg_rgb, bg_a = badge_cache[curr_badge]
            roi_badge = frame[by:by+bh, bx:bx+bw]
            frame[by:by+bh, bx:bx+bw] = (roi_badge * (1.0 - bg_a) + bg_rgb * bg_a).astype(np.uint8)

        # 4. Subtitle
        while cap_idx < len(captions) and captions[cap_idx]["end"] < t_sec:
            cap_idx += 1
            
        active_cap = None
        if cap_idx < len(captions) and captions[cap_idx]["start"] <= t_sec <= captions[cap_idx]["end"]:
            active_cap = captions[cap_idx]
            
        if active_cap:
            sub_res = get_subtitle_overlay(active_cap, t_sec)
            if sub_res:
                sub_w, sub_h, sub_rgb, sub_a = sub_res
                sy = height - 260 - sub_h
                sx = (width - sub_w) // 2
                roi_sub = frame[sy:sy+sub_h, sx:sx+sub_w]
                frame[sy:sy+sub_h, sx:sx+sub_w] = (roi_sub * (1.0 - sub_a) + sub_rgb * sub_a).astype(np.uint8)

        writer.write(frame)
        frame_i += 1
        
        if frame_i % 600 == 0:
            elapsed = time.time() - t0
            fps_proc = frame_i / max(elapsed, 0.001)
            eta = (total_frames - frame_i) / max(fps_proc, 0.001)
            print(f"Frame {frame_i}/{total_frames} ({frame_i/total_frames*100:.1f}%) | Speed: {fps_proc:.1f} fps | ETA: {eta:.0f}s")
            
    cap.release()
    writer.release()
    
    t_overlay = time.time() - t0
    print(f"Overlay rendered in {t_overlay:.1f}s. Now encoding final H.264 MP4 with AAC audio...")
    
    # Mux with original audio and encode to H.264
    mux_cmd = [
        FFMPEG_BIN, "-y",
        "-i", TEMP_VIDEO,
        "-i", VIDEO_IN,
        "-map", "0:v",
        "-map", "1:a",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "19",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        VIDEO_OUT
    ]
    subprocess.run(mux_cmd, check=True)
    
    # Remove temp video
    if os.path.exists(TEMP_VIDEO):
        os.remove(TEMP_VIDEO)
        
    total_time = time.time() - t0
    print(f"SUCCESS! Finished in {total_time:.1f}s.")
    print(f"Final video: {VIDEO_OUT} ({os.path.getsize(VIDEO_OUT)/(1024*1024):.1f} MB)")

if __name__ == "__main__":
    process_video()
