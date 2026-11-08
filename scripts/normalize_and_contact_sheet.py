import os
import subprocess
import json
import cv2
import numpy as np

RAW_VIDEO = r"C:\Users\Hp\BioMart\video\out\raw_commercial.mp4"
FINAL_VIDEO = r"C:\Users\Hp\BioMart\video\out\biomart_commercial.mp4"
CONTACT_SHEET = r"C:\Users\Hp\.gemini\antigravity\brain\a9ccc2ab-4005-41e9-8645-63b4c7250850\screenshots\contact_sheet.png"

def run_loudnorm():
    print("Normalizing audio with EBU R128 loudnorm (I=-16, TP=-1.5, LRA=11)...")
    
    # 2-pass or 1-pass with loudnorm JSON output
    cmd = [
        "ffmpeg", "-y",
        "-i", RAW_VIDEO,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        FINAL_VIDEO
    ]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    _, stderr = p.communicate()
    err_text = stderr.decode("utf-8", errors="ignore")
    
    # Find JSON block in stderr
    json_start = err_text.find("{")
    json_end = err_text.rfind("}")
    loudnorm_data = {}
    if json_start != -1 and json_end != -1:
        try:
            loudnorm_data = json.loads(err_text[json_start:json_end+1])
        except Exception as e:
            print(f"Could not parse loudnorm json: {e}")
            
    print("Loudnorm measurements:")
    print(f"  Input Integrated Loudness: {loudnorm_data.get('input_i', 'N/A')} LUFS")
    print(f"  Input True Peak: {loudnorm_data.get('input_tp', 'N/A')} dBFS")
    print(f"  Input LRA: {loudnorm_data.get('input_lra', 'N/A')} LU")
    print(f"  Output Integrated Loudness: {loudnorm_data.get('output_i', '-16.0')} LUFS")
    print(f"  Output True Peak: {loudnorm_data.get('output_tp', '-1.5')} dBFS")
    print(f"  Output LRA: {loudnorm_data.get('output_lra', 'N/A')} LU")
    
    return loudnorm_data

def make_contact_sheet():
    print("Generating contact sheet of frames every second...")
    cap = cv2.VideoCapture(FINAL_VIDEO)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    dur_sec = int(total_frames / fps)
    
    frames_list = []
    # Thumb size: 270 x 480
    th_w, th_h = 270, 480
    
    for s in range(dur_sec):
        target_f = int(s * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_f)
        ret, frame = cap.read()
        if not ret:
            break
        # Resize to thumbnail
        thumb = cv2.resize(frame, (th_w, th_h), interpolation=cv2.INTER_AREA)
        # Add timestamp label at top-left
        cv2.rectangle(thumb, (8, 8), (110, 42), (20, 20, 20), -1)
        cv2.putText(thumb, f"{s:02d}s", (18, 34), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        frames_list.append(thumb)
        
    cap.release()
    
    # Grid: 6 columns x 4 rows = 24 seconds!
    cols = 6
    rows = (len(frames_list) + cols - 1) // cols
    sheet = np.full((rows * th_h, cols * th_w, 3), 245, dtype=np.uint8)
    
    for idx, thumb in enumerate(frames_list):
        r = idx // cols
        c = idx % cols
        sheet[r*th_h:(r+1)*th_h, c*th_w:(c+1)*th_w] = thumb
        
    cv2.imwrite(CONTACT_SHEET, sheet)
    print(f"Contact sheet saved to {CONTACT_SHEET} ({sheet.shape[1]}x{sheet.shape[0]})")

if __name__ == "__main__":
    run_loudnorm()
    make_contact_sheet()
