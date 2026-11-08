import json
import os
import sys

# Monkeypatch av.open for PyAV 19 compatibility with faster_whisper
import av
_orig_open = av.open
def _patched_open(*args, **kwargs):
    kwargs.pop("metadata_errors", None)
    return _orig_open(*args, **kwargs)
av.open = _patched_open

def transcribe():
    from faster_whisper import WhisperModel

    audio_path = r"C:\Users\Hp\BioMart\assets-raw\audio.wav"
    output_json = r"C:\Users\Hp\BioMart\assets-raw\transcript.json"

    print("Loading Whisper model (base)...")
    model = WhisperModel("base", device="cpu", compute_type="int8")

    print(f"Transcribing {audio_path}...")
    segments, info = model.transcribe(
        audio_path,
        language="ru",
        word_timestamps=True,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500)
    )

    print(f"Detected language: {info.language} with probability {info.language_probability:.2f}")
    print(f"Audio duration: {info.duration:.2f} seconds")

    results = []
    all_words = []

    for segment in segments:
        seg_dict = {
            "id": segment.id,
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip(),
            "words": []
        }
        if segment.words:
            for w in segment.words:
                w_dict = {
                    "word": w.word.strip(),
                    "start": round(w.start, 2),
                    "end": round(w.end, 2),
                    "probability": round(w.probability, 2)
                }
                seg_dict["words"].append(w_dict)
                all_words.append(w_dict)
        results.append(seg_dict)
        print(f"[{seg_dict['start']}s -> {seg_dict['end']}s]: {seg_dict['text']}", flush=True)

    out_data = {
        "duration": info.duration,
        "language": info.language,
        "segments": results,
        "total_words": len(all_words)
    }

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)

    print(f"\nSaved transcript with {len(results)} segments and {len(all_words)} words to {output_json}")

if __name__ == "__main__":
    transcribe()
