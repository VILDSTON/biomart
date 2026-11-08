const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_BIN = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const SHOTS = [
  // 1. Accent 1: Minimal Charcoal (#111827)
  {
    name: 'storefront_accent1_minimal_mobile_light.png',
    size: '390,844',
    url: 'http://localhost:3000/tashkent_drip?accent=111827&theme=light&preset=minimal'
  },
  {
    name: 'storefront_accent1_minimal_mobile_dark.png',
    size: '390,844',
    url: 'http://localhost:3000/tashkent_drip?accent=111827&theme=dark&preset=minimal'
  },
  {
    name: 'storefront_accent1_minimal_desktop_light.png',
    size: '1280,800',
    url: 'http://localhost:3000/tashkent_drip?accent=111827&theme=light&preset=minimal'
  },
  {
    name: 'storefront_accent1_minimal_desktop_dark.png',
    size: '1280,800',
    url: 'http://localhost:3000/tashkent_drip?accent=111827&theme=dark&preset=minimal'
  },

  // 2. Accent 2: Streetwear Neon Yellow (#E5FF00) - Light Accent with Dark On-Accent Text
  {
    name: 'storefront_accent2_neon_mobile_light.png',
    size: '390,844',
    url: 'http://localhost:3000/tashkent_drip?accent=E5FF00&theme=light&preset=streetwear'
  },
  {
    name: 'storefront_accent2_neon_mobile_dark.png',
    size: '390,844',
    url: 'http://localhost:3000/tashkent_drip?accent=E5FF00&theme=dark&preset=streetwear'
  },
  {
    name: 'storefront_accent2_neon_desktop_light.png',
    size: '1280,800',
    url: 'http://localhost:3000/tashkent_drip?accent=E5FF00&theme=light&preset=streetwear'
  },
  {
    name: 'storefront_accent2_neon_desktop_dark.png',
    size: '1280,800',
    url: 'http://localhost:3000/tashkent_drip?accent=E5FF00&theme=dark&preset=streetwear'
  },

  // 3. Accent 3: Ruby Rose (#E11D48) - Boutique Vibrant Accent
  {
    name: 'storefront_accent3_ruby_mobile_light.png',
    size: '390,844',
    url: 'http://localhost:3000/tashkent_drip?accent=E11D48&theme=light&preset=boutique'
  },
  {
    name: 'storefront_accent3_ruby_mobile_dark.png',
    size: '390,844',
    url: 'http://localhost:3000/tashkent_drip?accent=E11D48&theme=dark&preset=boutique'
  },
  {
    name: 'storefront_accent3_ruby_desktop_light.png',
    size: '1280,800',
    url: 'http://localhost:3000/tashkent_drip?accent=E11D48&theme=light&preset=boutique'
  },
  {
    name: 'storefront_accent3_ruby_desktop_dark.png',
    size: '1280,800',
    url: 'http://localhost:3000/tashkent_drip?accent=E11D48&theme=dark&preset=boutique'
  },

  // 4. Design Editor in Dashboard
  {
    name: 'editor_desktop.png',
    size: '1280,950',
    url: 'http://localhost:3000/dashboard?auth=demo&tab=design'
  },
  {
    name: 'editor_mobile.png',
    size: '390,844',
    url: 'http://localhost:3000/dashboard?auth=demo&tab=design'
  },
  {
    name: 'editor_desktop_uz.png',
    size: '1280,950',
    url: 'http://localhost:3000/dashboard?auth=demo&tab=design&lang=uz'
  }
];

console.log(`Starting ${SHOTS.length} screenshot captures...`);
for (const item of SHOTS) {
  const outPath = path.join(SCREENSHOTS_DIR, item.name);
  console.log(`Capturing: ${item.name} (${item.size})...`);
  const args = [
    '--headless',
    '--disable-gpu',
    '--virtual-time-budget=2000',
    `--window-size=${item.size}`,
    `--screenshot=${outPath}`,
    item.url
  ];
  try {
    const res = spawnSync(CHROME_BIN, args, { stdio: 'pipe', encoding: 'utf-8' });
    if (fs.existsSync(outPath)) {
      const stats = fs.statSync(outPath);
      console.log(`  -> SUCCESS: ${item.name} (${stats.size} bytes)`);
    } else {
      console.error(`  -> ERROR: file not created for ${item.name}`, res.stderr);
    }
  } catch (err) {
    console.error(`  -> FAILED: ${item.name}`, err.message);
  }
}
console.log('All screenshots completed successfully!');
