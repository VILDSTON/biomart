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

const SHOTS = [
  {
    name: 'landing_emerald_desktop.png',
    url: 'http://localhost:3000/',
    w: 1280, h: 850,
  },
  {
    name: 'landing_emerald_mobile.png',
    url: 'http://localhost:3000/',
    w: 390, h: 844,
  },
  {
    name: 'login_emerald.png',
    url: 'http://localhost:3000/login',
    w: 1280, h: 850,
  },
  {
    name: 'register_emerald.png',
    url: 'http://localhost:3000/register',
    w: 1280, h: 850,
  }
];

async function capture() {
  const port = 9338;
  const userDataDir = path.join(__dirname, '..', '.chrome-emerald');
  
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
    throw new Error('Chrome start failed');
  }

  for (const item of SHOTS) {
    console.log(`Capturing ${item.name}...`);
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
      deviceScaleFactor: 2,
      mobile: item.w < 600
    });

    await send('Page.navigate', { url: item.url });
    await new Promise(r => setTimeout(r, 2200));

    // Light mode strictly
    await send('Runtime.evaluate', {
      expression: `document.documentElement.classList.remove('dark'); document.documentElement.style.colorScheme = 'light';`
    });
    await new Promise(r => setTimeout(r, 300));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(shot.data, 'base64');

    fs.writeFileSync(path.join(LOCAL_SCREENSHOTS, item.name), buf);
    fs.writeFileSync(path.join(ARTIFACT_SCREENSHOTS, item.name), buf);
    console.log(`  -> SUCCESS: ${item.name} (${(buf.length / 1024).toFixed(1)} KB)`);

    ws.close();
  }

  chromeProc.kill();
  console.log('All Emerald captures completed!');
}

capture().catch(console.error);
