import os
import json
import time
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

VIDEO_IN = r"C:\Users\Hp\BioMart\video-hyperframes\assets\master_edit.mp4"
SUBS_JSON = r"C:\Users\Hp\BioMart\video-hyperframes\assets\subtitles.json"

with open(SUBS_JSON, "r", encoding="utf-8") as f:
    subs_data = json.load(f)

cap = cv2.VideoCapture(VIDEO_IN)
fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print(f"Video input: {width}x{height} @ {fps} fps, total {total_frames} frames ({total_frames/fps:.1f}s)")
cap.release()
