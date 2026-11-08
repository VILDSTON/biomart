import os
import json
import subprocess
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

VIDEO_IN = r"C:\Users\Hp\BioMart\video-hyperframes\assets\master_edit.mp4"
SUBS_JSON = r"C:\Users\Hp\BioMart\video-hyperframes\assets\subtitles.json"
TEST_IMG = r"C:\Users\Hp\BioMart\video-hyperframes\assets\test_frame_subtitled.png"

with open(SUBS_JSON, "r", encoding="utf-8") as f:
    subs_data = json.load(f)

captions = subs_data["captions"]

# Load fonts
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

def render_frame_overlay(frame_bgr, t_sec, total_t=141.4):
    h, w, _ = frame_bgr.shape
    
    # 1. Top progress bar
    progress = min(max(t_sec / total_t, 0.0), 1.0)
    bar_w = int(w * progress)
    if bar_w > 0:
        cv2.rectangle(frame_bgr, (0, 0), (bar_w, 8), (129, 185, 16), -1) # BGR for #10B981 is (129, 185, 16)
        # Glow edge
        cv2.circle(frame_bgr, (bar_w, 4), 6, (180, 240, 52), -1)

    # 2. Top Brand Pill (always visible)
    # "[⚡ BioMart • Обзор платформы]"
    brand_text = "BioMart  |  Обзор платформы"
    # Pre-render via PIL on small ROI
    brand_w, brand_h = 420, 56
    brand_x = (w - brand_w) // 2
    brand_y = 30
    
    brand_img = Image.new("RGBA", (brand_w, brand_h), (0, 0, 0, 0))
    d_brand = ImageDraw.Draw(brand_img)
    # Rounded container
    d_brand.rounded_rectangle([0, 0, brand_w, brand_h], radius=28, fill=(15, 23, 42, 225), outline=(16, 185, 129, 180), width=2)
    # Draw green dot
    d_brand.ellipse([22, 22, 34, 34], fill=(16, 185, 129))
    d_brand.text((46, 12), brand_text, font=font_brand, fill=(255, 255, 255))
    
    b_np = np.array(brand_img)
    b_rgb = cv2.cvtColor(b_np[:, :, :3], cv2.COLOR_RGB2BGR)
    b_a = b_np[:, :, 3:] / 255.0
    roi_b = frame_bgr[brand_y:brand_y+brand_h, brand_x:brand_x+brand_w]
    frame_bgr[brand_y:brand_y+brand_h, brand_x:brand_x+brand_w] = (roi_b * (1.0 - b_a) + b_rgb * b_a).astype(np.uint8)

    # 3. Active Feature Badge (if any)
    curr_badge = None
    for b_start, b_end, b_title in badges:
        if b_start <= t_sec < b_end:
            curr_badge = b_title
            break
            
    if curr_badge:
        bw, bh = 560, 64
        bx = (w - bw) // 2
        by = 100
        badge_img = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
        d_badge = ImageDraw.Draw(badge_img)
        d_badge.rounded_rectangle([0, 0, bw, bh], radius=20, fill=(9, 14, 26, 235), outline=(52, 211, 153, 200), width=2)
        # Center text
        bbox = d_badge.textbbox((0, 0), curr_badge, font=font_badge)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = (bw - tw) // 2
        ty = (bh - th) // 2 - 2
        d_badge.text((tx, ty), curr_badge, font=font_badge, fill=(240, 253, 244))
        
        bg_np = np.array(badge_img)
        bg_rgb = cv2.cvtColor(bg_np[:, :, :3], cv2.COLOR_RGB2BGR)
        bg_a = bg_np[:, :, 3:] / 255.0
        roi_badge = frame_bgr[by:by+bh, bx:bx+bw]
        frame_bgr[by:by+bh, bx:bx+bw] = (roi_badge * (1.0 - bg_a) + bg_rgb * bg_a).astype(np.uint8)

    # 4. Subtitles (Karaoke style)
    active_caption = None
    for cap in captions:
        if cap["start"] <= t_sec <= cap["end"]:
            active_caption = cap
            break
            
    if active_caption and active_caption.get("words"):
        words = active_caption["words"]
        # Calculate width of full text
        # Format in 1 or 2 lines if needed
        # Let's measure words
        full_text = " ".join(w_obj["word"] for w_obj in words)
        
        # Build PIL canvas for subtitles
        # Max width 980
        dummy_img = Image.new("RGBA", (100, 100))
        dummy_draw = ImageDraw.Draw(dummy_img)
        
        # Word dimensions
        word_render_data = []
        for w_obj in words:
            w_str = w_obj["word"]
            w_bbox = dummy_draw.textbbox((0, 0), w_str, font=font_subs)
            w_width = w_bbox[2] - w_bbox[0]
            is_active = (w_obj["start"] <= t_sec <= w_obj["end"] + 0.1)
            is_past = (t_sec > w_obj["end"] + 0.1)
            word_render_data.append({
                "word": w_str,
                "width": w_width,
                "active": is_active,
                "past": is_past
            })
            
        space_width = dummy_draw.textbbox((0, 0), " ", font=font_subs)[2]
        
        # Layout words into lines (max line width = 880)
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
            
        line_height = 60
        sub_pad_y = 20
        sub_pad_x = 36
        total_sub_h = len(lines) * line_height + sub_pad_y * 2
        max_line_w = max(lw for _, lw in lines) if lines else 300
        total_sub_w = min(max(max_line_w + sub_pad_x * 2, 400), 960)
        
        sub_img = Image.new("RGBA", (total_sub_w, total_sub_h), (0, 0, 0, 0))
        d_sub = ImageDraw.Draw(sub_img)
        # Rounded pill with glow outline
        d_sub.rounded_rectangle(
            [0, 0, total_sub_w, total_sub_h],
            radius=26,
            fill=(10, 15, 29, 235),
            outline=(16, 185, 129, 140),
            width=2
        )
        
        # Draw words line by line
        for l_idx, (line_words, l_w) in enumerate(lines):
            # center each line
            start_x = (total_sub_w - l_w) // 2
            y_pos = sub_pad_y + l_idx * line_height + 4
            x_pos = start_x
            
            for item in line_words:
                w_str = item["word"]
                if item["active"]:
                    # Active word: Bright Emerald (#10B981) + bold glow
                    fill_col = (52, 211, 153, 255) # emerald-400
                    # draw small highlight pill under active word
                    wb = dummy_draw.textbbox((0, 0), w_str, font=font_subs)
                    d_sub.rounded_rectangle(
                        [x_pos - 6, y_pos - 2, x_pos + item["width"] + 6, y_pos + line_height - 10],
                        radius=8,
                        fill=(16, 185, 129, 70)
                    )
                else:
                    # White for spoken or upcoming
                    fill_col = (255, 255, 255, 255)
                    
                d_sub.text((x_pos, y_pos), w_str, font=font_subs, fill=fill_col)
                x_pos += item["width"] + space_width

        # Composite subtitle onto frame at bottom
        sub_np = np.array(sub_img)
        sub_rgb = cv2.cvtColor(sub_np[:, :, :3], cv2.COLOR_RGB2BGR)
        sub_a = sub_np[:, :, 3:] / 255.0
        
        sy = h - 280 - total_sub_h
        sx = (w - total_sub_w) // 2
        
        roi_sub = frame_bgr[sy:sy+total_sub_h, sx:sx+total_sub_w]
        frame_bgr[sy:sy+total_sub_h, sx:sx+total_sub_w] = (roi_sub * (1.0 - sub_a) + sub_rgb * sub_a).astype(np.uint8)

    return frame_bgr

# Test at t=2.0s
cap = cv2.VideoCapture(VIDEO_IN)
cap.set(cv2.CAP_PROP_POS_MSEC, 2000.0)
ret, test_frame = cap.read()
cap.release()

if ret:
    out_frame = render_frame_overlay(test_frame.copy(), 2.0)
    cv2.imwrite(TEST_IMG, out_frame)
    print(f"Test frame saved to {TEST_IMG}")
else:
    print("Could not read frame")
