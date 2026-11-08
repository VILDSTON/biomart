import time
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

VIDEO_IN = r"C:\Users\Hp\BioMart\video-hyperframes\assets\master_edit.mp4"
font_path = r"C:\Windows\Fonts\segoeuib.ttf"
font = ImageFont.truetype(font_path, 42)

cap = cv2.VideoCapture(VIDEO_IN)
ret, frame = cap.read()
cap.release()

# Pre-render text overlay on transparent RGBA
overlay = Image.new("RGBA", (900, 160), (0, 0, 0, 0))
d = ImageDraw.Draw(overlay)
d.rounded_rectangle([0, 0, 900, 160], radius=24, fill=(15, 23, 42, 230))
d.text((40, 50), "Тестовый субтитр для проверки скорости", font=font, fill=(255, 255, 255))
overlay_np = np.array(overlay)
rgb_overlay = cv2.cvtColor(overlay_np[:, :, :3], cv2.COLOR_RGB2BGR)
alpha = overlay_np[:, :, 3:] / 255.0

t0 = time.time()
for i in range(100):
    roi = frame[1450:1610, 90:990]
    blended = (roi * (1.0 - alpha) + rgb_overlay * alpha).astype(np.uint8)
    frame[1450:1610, 90:990] = blended

dt = time.time() - t0
print(f"100 ROI blends took {dt:.4f}s ({100/dt:.1f} fps)")
