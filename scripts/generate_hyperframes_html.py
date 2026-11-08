import json
import os

SUBTITLES_PATH = r"C:\Users\Hp\BioMart\video-hyperframes\assets\subtitles.json"
HTML_PATH = r"C:\Users\Hp\BioMart\video-hyperframes\index.html"

with open(SUBTITLES_PATH, "r", encoding="utf-8") as f:
    sub_data = json.load(f)

captions = sub_data.get("captions", [])
duration = round(sub_data.get("duration", 141.4), 1)

# Badge milestones
BADGES = [
    {"start": 0.5, "end": 17.0, "icon": "🛍️", "title": "Витрина Tashkent Drip", "subtitle": "Мультиязычность и контакты в 1 клик"},
    {"start": 17.5, "end": 34.0, "icon": "⚡", "title": "Заказ в 1 клик", "subtitle": "Выбор размера XL и быстрая корзина"},
    {"start": 34.5, "end": 61.5, "icon": "🔔", "title": "Уведомление в Telegram", "subtitle": "Звонок клиенту, чат и Яндекс.Карты"},
    {"start": 62.0, "end": 86.5, "icon": "📊", "title": "Панель управления & Excel", "subtitle": "Аналитика продаж, выручка и экспорт"},
    {"start": 87.0, "end": 108.5, "icon": "🤖", "title": "AI-генератор стиля", "subtitle": "Умная палитра под фото и темная тема"},
    {"start": 109.0, "end": 133.0, "icon": "💰", "title": "Тариф Старт — 0 сум", "subtitle": "15 товаров бесплатно навсегда"},
    {"start": 133.5, "end": duration, "icon": "🚀", "title": "BioMart.uz", "subtitle": "Создайте витрину за 2 минуты!"}
]

# Generate Subtitles HTML & JS Tweens
captions_html = []
captions_js = []

for c in captions:
    c_id = c["id"]
    c_start = c["start"]
    c_end = c["end"]
    c_dur = max(0.2, round(c_end - c_start, 2))
    
    # Word spans
    word_spans = []
    for widx, w in enumerate(c["words"]):
        w_word = w["word"].replace('"', '&quot;')
        word_spans.append(f'<span class="w-item" id="{c_id}_w{widx}">{w_word}</span>')
    
    words_inner = " ".join(word_spans)
    captions_html.append(f'''      <div id="{c_id}" class="clip caption-group" data-start="{c_start}" data-duration="{c_dur}">
        <div class="caption-inner">{words_inner}</div>
      </div>''')
    
    # GSAP tween for caption group enter/exit
    captions_js.append(f'''  tl.fromTo("#{c_id} .caption-inner", {{ opacity: 0, y: 15, scale: 0.95 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.15, ease: "power2.out" }}, {c_start});''')
    if c_dur > 0.2:
        captions_js.append(f'''  tl.to("#{c_id} .caption-inner", {{ opacity: 0, y: -10, duration: 0.12, ease: "power2.in" }}, {round(c_start + c_dur - 0.12, 2)});''')
    
    # Highlighting each word at its timing
    for widx, w in enumerate(c["words"]):
        w_start = w["start"]
        w_end = w["end"]
        w_dur = max(0.1, round(w_end - w_start, 2))
        captions_js.append(f'''  tl.to("#{c_id}_w{widx}", {{ color: "#22C55E", textShadow: "0 0 16px rgba(34,197,94,0.6)", scale: 1.08, duration: 0.08 }}, {w_start});''')
        captions_js.append(f'''  tl.to("#{c_id}_w{widx}", {{ color: "#FFFFFF", textShadow: "none", scale: 1.0, duration: 0.1 }}, {round(w_start + w_dur, 2)});''')

# Generate Badges HTML & JS
badges_html = []
badges_js = []

for bidx, b in enumerate(BADGES):
    b_id = f"badge_{bidx}"
    b_start = b["start"]
    b_dur = round(b["end"] - b["start"], 2)
    
    badges_html.append(f'''      <div id="{b_id}" class="clip floating-badge" data-start="{b_start}" data-duration="{b_dur}">
        <div class="badge-card">
          <div class="badge-icon">{b["icon"]}</div>
          <div class="badge-text">
            <div class="badge-title">{b["title"]}</div>
            <div class="badge-sub">{b["subtitle"]}</div>
          </div>
        </div>
      </div>''')
    
    badges_js.append(f'''  tl.fromTo("#{b_id} .badge-card", {{ opacity: 0, y: -30, scale: 0.85 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.4)" }}, {b_start});''')
    badges_js.append(f'''  tl.to("#{b_id} .badge-card", {{ opacity: 0, y: -20, scale: 0.9, duration: 0.25, ease: "power2.in" }}, {round(b_start + b_dur - 0.25, 2)});''')

html_content = f'''<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>BioMart Video Promo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Onest:wght@500;600;700&display=swap" rel="stylesheet">
    <style>
      :root {{
        --brand-green: #1F7A5A;
        --brand-light: #22C55E;
        --brand-gold: #FACC15;
        --surface: rgba(18, 22, 20, 0.85);
        --border: rgba(255, 255, 255, 0.15);
      }}
      * {{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }}
      html, body {{
        width: 1080px;
        height: 1920px;
        overflow: hidden;
        background: #0B0E0D;
        font-family: 'Montserrat', 'Onest', sans-serif;
        color: #FFFFFF;
      }}
      #root {{
        position: relative;
        width: 1080px;
        height: 1920px;
        overflow: hidden;
      }}

      /* Base Video Layer */
      #bg-video {{
        position: absolute;
        top: 0;
        left: 0;
        width: 1080px;
        height: 1920px;
        object-fit: cover;
        z-index: 1;
      }}

      /* Top Progress Bar */
      #progress-track {{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.15);
        z-index: 50;
      }}
      #progress-fill {{
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #1F7A5A, #22C55E, #FACC15);
        box-shadow: 0 0 12px rgba(34, 197, 94, 0.8);
      }}

      /* Header Brand Header */
      #header-bar {{
        position: absolute;
        top: 40px;
        left: 40px;
        right: 40px;
        z-index: 30;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }}
      .brand-pill {{
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 28px;
        background: rgba(15, 23, 20, 0.88);
        border: 1.5px solid rgba(255, 255, 255, 0.2);
        border-radius: 999px;
        backdrop-filter: blur(16px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }}
      .brand-logo {{
        width: 36px;
        height: 36px;
        color: #22C55E;
      }}
      .brand-title {{
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #FFFFFF;
      }}
      .brand-title span {{
        color: #22C55E;
      }}
      .live-badge {{
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 22px;
        background: rgba(34, 197, 94, 0.18);
        border: 1.5px solid rgba(34, 197, 94, 0.45);
        border-radius: 999px;
        font-size: 28px;
        font-weight: 700;
        color: #22C55E;
      }}
      .live-dot {{
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #22C55E;
        box-shadow: 0 0 10px #22C55E;
      }}

      /* Floating Feature Callout Badges */
      .floating-badge {{
        position: absolute;
        top: 140px;
        left: 40px;
        right: 40px;
        z-index: 35;
        display: flex;
        justify-content: center;
        pointer-events: none;
      }}
      .badge-card {{
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 20px 32px;
        background: rgba(17, 24, 22, 0.94);
        border: 1.5px solid rgba(34, 197, 94, 0.45);
        border-radius: 24px;
        backdrop-filter: blur(20px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        max-width: 960px;
      }}
      .badge-icon {{
        font-size: 44px;
        line-height: 1;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
      }}
      .badge-text {{
        display: flex;
        flex-direction: column;
        gap: 4px;
      }}
      .badge-title {{
        font-size: 34px;
        font-weight: 800;
        color: #FFFFFF;
        letter-spacing: -0.01em;
      }}
      .badge-sub {{
        font-size: 28px;
        font-weight: 600;
        color: #D1D5DB;
      }}

      /* Subtitles Container (Positioned Safely in Lower Third) */
      .captions-track {{
        position: absolute;
        bottom: 240px;
        left: 40px;
        right: 40px;
        z-index: 40;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
      }}
      .caption-group {{
        position: absolute;
        width: 100%;
        display: flex;
        justify-content: center;
      }}
      .caption-inner {{
        padding: 18px 36px;
        background: rgba(10, 14, 12, 0.9);
        border: 1.5px solid rgba(255, 255, 255, 0.18);
        border-radius: 24px;
        backdrop-filter: blur(24px);
        box-shadow: 0 16px 36px rgba(0,0,0,0.6);
        text-align: center;
        font-size: 48px;
        font-weight: 800;
        line-height: 1.35;
        letter-spacing: -0.02em;
        color: #FFFFFF;
        max-width: 980px;
      }}
      .w-item {{
        display: inline-block;
        transition: color 0.08s ease, transform 0.08s ease;
        margin: 0 5px;
      }}

      /* Bottom CTA Watermark */
      #bottom-bar {{
        position: absolute;
        bottom: 50px;
        left: 40px;
        right: 40px;
        z-index: 30;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }}
      .cta-pill {{
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 30px;
        background: linear-gradient(135deg, #1F7A5A 0%, #15803D 100%);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 18px;
        box-shadow: 0 10px 25px rgba(31, 122, 90, 0.5);
        font-size: 30px;
        font-weight: 800;
        color: #FFFFFF;
      }}
      .watermark {{
        font-size: 28px;
        font-weight: 700;
        color: #E5E7EB;
        background: rgba(0,0,0,0.65);
        padding: 10px 20px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
      }}
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="{duration}"
      data-width="1080"
      data-height="1920"
    >
      <!-- Top Animated Progress Bar -->
      <div id="progress-track" class="clip" data-start="0" data-duration="{duration}">
        <div id="progress-fill"></div>
      </div>

      <!-- Background Master Video Track -->
      <video
        id="bg-video"
        class="clip"
        data-start="0"
        data-duration="{duration}"
        src="assets/master_edit.mp4"
        data-has-audio="true"
        playsinline
      ></video>

      <!-- Top Header Brand Overlay -->
      <div id="header-bar" class="clip" data-start="0" data-duration="{duration}" data-track-kind="graphics">
        <div class="brand-pill">
          <svg class="brand-logo" viewBox="0 0 512 512" fill="currentColor">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M256 104C217.34 104 186 135.34 186 174V184H148C138.059 184 130 192.059 130 202V386C130 395.941 138.059 404 148 404H364C373.941 404 382 395.941 382 386V236L354 264V376H158V212H354V228L382 200V198C382 190.268 375.732 184 368 184H326V174C326 135.34 294.66 104 256 104ZM214 184V174C214 150.804 232.804 132 256 132C279.196 132 298 150.804 298 174V184H214Z" />
            <path d="M225 238C225.8 235.6 228 234 230.5 234H260C263.1 234 265.1 237.3 263.6 240L246 273H304C307.3 273 309.2 276.8 307.2 279.4L246.5 362.5C244.2 365.6 239.3 363.6 239.9 359.8L248.5 308H204C200.9 308 198.8 304.9 199.8 302L225 238Z" />
          </svg>
          <div class="brand-title">BioMart<span>.uz</span></div>
        </div>
        <div class="live-badge">
          <div class="live-dot"></div>
          <span>LIVE ДЕМО</span>
        </div>
      </div>

      <!-- Feature Call-Out Badges -->
{chr(10).join(badges_html)}

      <!-- Dynamic Captions Track -->
      <div id="captions-host" class="clip captions-track" data-start="0" data-duration="{duration}" data-track-kind="captions">
{chr(10).join(captions_html)}
      </div>

      <!-- Bottom Floating CTA -->
      <div id="bottom-bar" class="clip" data-start="0" data-duration="{duration}" data-track-kind="graphics">
        <div class="cta-pill">
          <span>🚀 Запустить витрину</span>
        </div>
        <div class="watermark">biomart.uz/tashkent_drip</div>
      </div>
    </div>

    <script>
      const tl = gsap.timeline({{ paused: true }});

      // Progress bar animation
      tl.to("#progress-fill", {{ width: "100%", duration: {duration}, ease: "none" }}, 0);

      // Feature Badge Timings
{chr(10).join(badges_js)}

      // Captions Timings & Karaoke Highlights
{chr(10).join(captions_js)}

      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>'''

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Regenerated HyperFrames HTML with updated font sizes (>=28px): {HTML_PATH}")
