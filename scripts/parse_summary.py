import json

with open(r'C:\Users\Hp\BioMart\assets-raw\transcript.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

with open(r'C:\Users\Hp\BioMart\assets-raw\transcript_summary.txt', 'w', encoding='utf-8') as out:
    for s in d['segments']:
        out.write(f"[{s['start']}s -> {s['end']}s]: {s['text']}\n")

print("Done. Total segments:", len(d['segments']))
