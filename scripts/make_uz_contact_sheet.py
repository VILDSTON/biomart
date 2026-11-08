import cv2
import numpy as np

FINAL_VIDEO = r"C:\Users\Hp\BioMart\video\out\biomart_commercial_uz.mp4"
CONTACT_SHEET = r"C:\Users\Hp\.gemini\antigravity\brain\a9ccc2ab-4005-41e9-8645-63b4c7250850\screenshots\uz_contact_sheet.png"

def make_contact_sheet():
    print("Generating Uzbek contact sheet of frames every second...")
    cap = cv2.VideoCapture(FINAL_VIDEO)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    dur_sec = int(total_frames / fps)
    
    frames_list = []
    th_w, th_h = 270, 480
    
    for s in range(dur_sec):
        target_f = int(s * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_f)
        ret, frame = cap.read()
        if not ret:
            break
        thumb = cv2.resize(frame, (th_w, th_h), interpolation=cv2.INTER_AREA)
        # Add timestamp overlay
        cv2.putText(thumb, f"{s:02d}s", (16, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 3)
        cv2.putText(thumb, f"{s:02d}s", (16, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 1)
        frames_list.append(thumb)
        
    cap.release()
    
    cols = 6
    rows = (len(frames_list) + cols - 1) // cols
    sheet = np.zeros((rows * th_h, cols * th_w, 3), dtype=np.uint8)
    
    for idx, f in enumerate(frames_list):
        r = idx // cols
        c = idx % cols
        sheet[r*th_h:(r+1)*th_h, c*th_w:(c+1)*th_w] = f
        
    cv2.imwrite(CONTACT_SHEET, sheet)
    print(f"Contact sheet saved to {CONTACT_SHEET} ({rows}x{cols} tiles)")

if __name__ == "__main__":
    make_contact_sheet()
