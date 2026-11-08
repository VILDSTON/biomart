import os
import json
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

t0 = time.time()
for i in range(100):
    img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([200, 1500, 880, 1600], radius=16, fill=(15, 23, 42, 220))
    draw.text((220, 1530), "Тестовый субтитр для проверки скорости", font=font, fill=(255, 255, 255))
    res = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

dt = time.time() - t0
print(f"100 frames took {dt:.3f}s ({100/dt:.1f} fps)")
