import json

JSON_PATH = r"C:\Users\Hp\BioMart\video-hyperframes\assets\subtitles.json"
SRT_PATH = r"C:\Users\Hp\BioMart\video-hyperframes\assets\subtitles.srt"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

REPLACEMENTS = {
    "дошкин треб": "Tashkent Drip",
    "дошкин трепта": "Tashkent Drip",
    "дошкин": "Tashkent",
    "треб": "Drip",
    "треб,": "Drip,",
    "витрино": "витрина",
    "фонзину": "корзину",
    "в казину": "в корзину",
    "прозвцу": "продавцу",
    "видомле не": "уведомление",
    "видомле": "уведомление",
    "сутновый": "новый заказ",
    "в военных картах": "в Яндекс Картах",
    "военных": "Яндекс",
    "мясо-нахочний": "местоположение",
    "вопрекаться": "принять",
    "логетей": "логотип",
    "пьему арт": "BioMart",
    "пьему": "BioMart",
    "сун": "сум",
    "прор": "PRO",
    "пизлиметаров": "безлимит",
    "искусный телег": "AI-ассистент",
    "искусственный интеллект": "AI-ассистент",
    "добавить товар, или даже": "добавить товары и",
    "мемат": "ссылка",
}

def clean_text(text):
    for k, v in REPLACEMENTS.items():
        text = text.replace(k, v)
        text = text.replace(k.capitalize(), v)
    return text

def format_timestamp(sec):
    hrs = int(sec // 3600)
    mins = int((sec % 3600) // 60)
    secs = int(sec % 60)
    millis = int((sec - int(sec)) * 1000)
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

srt_lines = []
for idx, c in enumerate(data["captions"], 1):
    c["text"] = clean_text(c["text"])
    for w in c["words"]:
        w["word"] = clean_text(w["word"])
    srt_lines.append(f"{idx}\n{format_timestamp(c['start'])} --> {format_timestamp(c['end'])}\n{c['text']}\n")

with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open(SRT_PATH, "w", encoding="utf-8") as f:
    f.write("\n".join(srt_lines))

print("Cleaned all subtitles and updated SRT and JSON.")
