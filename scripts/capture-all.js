const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_BIN = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_SCREENSHOTS = path.resolve(__dirname, '..', 'screenshots');
const ARTIFACT_SCREENSHOTS = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\a9ccc2ab-4005-41e9-8645-63b4c7250850\\screenshots';

for (const dir of [LOCAL_SCREENSHOTS, ARTIFACT_SCREENSHOTS]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function fetchJson(urlStr, method = 'GET') {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: method
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

const ITEMS = [
  // 1. Minimal Charcoal (#111827)
  {
    name: 'storefront_accent1_minimal_mobile_light.png',
    w: 390, h: 844,
    url: 'http://localhost:3000/tashkent_drip?accent=111827&theme=light&preset=minimal',
    isDark: false
  },
  {
    name: 'storefront_accent1_minimal_mobile_dark.png',
    w: 390, h: 844,
    url: 'http://localhost:3000/tashkent_drip?accent=111827&theme=dark&preset=minimal',
    isDark: true
  },
  {
    name: 'storefront_accent1_minimal_desktop_light.png',
    w: 1280, h: 850,
    url: 'http://localhost:3000/tashkent_drip?accent=111827&theme=light&preset=minimal',
    isDark: false
  },
  {
    name: 'storefront_accent1_minimal_desktop_dark.png',
    w: 1280, h: 850,
    url: 'http://localhost:3000/tashkent_drip?accent=111827&theme=dark&preset=minimal',
    isDark: true
  },

  // 2. Streetwear Neon Yellow (#E5FF00) - Light accent with dark text on accent!
  {
    name: 'storefront_accent2_neon_mobile_light.png',
    w: 390, h: 844,
    url: 'http://localhost:3000/tashkent_drip?accent=E5FF00&theme=light&preset=streetwear',
    isDark: false
  },
  {
    name: 'storefront_accent2_neon_mobile_dark.png',
    w: 390, h: 844,
    url: 'http://localhost:3000/tashkent_drip?accent=E5FF00&theme=dark&preset=streetwear',
    isDark: true
  },
  {
    name: 'storefront_accent2_neon_desktop_light.png',
    w: 1280, h: 850,
    url: 'http://localhost:3000/tashkent_drip?accent=E5FF00&theme=light&preset=streetwear',
    isDark: false
  },
  {
    name: 'storefront_accent2_neon_desktop_dark.png',
    w: 1280, h: 850,
    url: 'http://localhost:3000/tashkent_drip?accent=E5FF00&theme=dark&preset=streetwear',
    isDark: true
  },

  // 3. Boutique Ruby (#E11D48)
  {
    name: 'storefront_accent3_ruby_mobile_light.png',
    w: 390, h: 844,
    url: 'http://localhost:3000/tashkent_drip?accent=E11D48&theme=light&preset=boutique',
    isDark: false
  },
  {
    name: 'storefront_accent3_ruby_mobile_dark.png',
    w: 390, h: 844,
    url: 'http://localhost:3000/tashkent_drip?accent=E11D48&theme=dark&preset=boutique',
    isDark: true
  },
  {
    name: 'storefront_accent3_ruby_desktop_light.png',
    w: 1280, h: 850,
    url: 'http://localhost:3000/tashkent_drip?accent=E11D48&theme=light&preset=boutique',
    isDark: false
  },
  {
    name: 'storefront_accent3_ruby_desktop_dark.png',
    w: 1280, h: 850,
    url: 'http://localhost:3000/tashkent_drip?accent=E11D48&theme=dark&preset=boutique',
    isDark: true
  },

  // 4. Design Editor (Dashboard)
  {
    name: 'editor_desktop.png',
    w: 1280, h: 950,
    url: 'http://localhost:3000/dashboard?auth=demo&tab=design',
    isDark: false
  },
  {
    name: 'editor_mobile.png',
    w: 390, h: 844,
    url: 'http://localhost:3000/dashboard?auth=demo&tab=design',
    isDark: false
  },
  {
    name: 'editor_desktop_uz.png',
    w: 1280, h: 950,
    url: 'http://localhost:3000/dashboard?auth=demo&tab=design&lang=uz',
    isDark: false
  },
  {
    name: 'editor_desktop_dark.png',
    w: 1280, h: 950,
    url: 'http://localhost:3000/dashboard?auth=demo&tab=design',
    isDark: true
  },
  {
    name: 'editor_mobile_dark.png',
    w: 390, h: 844,
    url: 'http://localhost:3000/dashboard?auth=demo&tab=design',
    isDark: true
  }
];

async function run() {
  const port = 9334;
  const userDataDir = path.join(__dirname, '..', '.chrome-bulk');
  
  const chromeProc = spawn(CHROME_BIN, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check'
  ], { stdio: 'ignore' });

  let version;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      version = await fetchJson(`http://127.0.0.1:${port}/json/version`);
      if (version && version.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!version) {
    chromeProc.kill();
    throw new Error('Chrome did not start');
  }

  console.log(`Starting captures for ${ITEMS.length} screens...`);

  for (const item of ITEMS) {
    console.log(`\nProcessing ${item.name} (${item.w}x${item.h}, dark=${item.isDark})...`);
    const newTarget = await fetchJson(`http://127.0.0.1:${port}/json/new`, 'PUT');
    const ws = new WebSocket(newTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await new Promise(r => ws.onopen = r);

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: item.w,
      height: item.h,
      deviceScaleFactor: 2, // HiDPI 2x retina crispness
      mobile: item.w < 600
    });

    if (item.isDark) {
      await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: 'dark' }]
      });
    } else {
      await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: 'light' }]
      });
    }

    await send('Page.navigate', { url: item.url });

    // Wait for network idle and React hydration
    await new Promise(r => setTimeout(r, 2200));

    // Force theme class if needed
    if (item.isDark) {
      await send('Runtime.evaluate', {
        expression: `document.documentElement.classList.add('dark'); document.documentElement.style.colorScheme = 'dark';`
      });
    } else {
      await send('Runtime.evaluate', {
        expression: `document.documentElement.classList.remove('dark'); document.documentElement.style.colorScheme = 'light';`
      });
    }
    await new Promise(r => setTimeout(r, 300));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(shot.data, 'base64');

    const p1 = path.join(LOCAL_SCREENSHOTS, item.name);
    const p2 = path.join(ARTIFACT_SCREENSHOTS, item.name);
    fs.writeFileSync(p1, buf);
    fs.writeFileSync(p2, buf);

    console.log(`  -> SUCCESS: ${item.name} (${(buf.length / 1024).toFixed(1)} KB)`);

    ws.close();
    await fetchJson(`http://127.0.0.1:${port}/json/close/${newTarget.id}`);
  }

  chromeProc.kill();
  console.log('\nAll captures completed successfully!');
}

run().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
