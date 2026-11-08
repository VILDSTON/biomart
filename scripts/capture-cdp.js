const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_BIN = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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
        try { resolve(JSON.parse(data)); } catch (e) {
          console.error('fetchJson error on', urlStr, 'raw data:', data);
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function capture(url, outPath, width = 1280, height = 950) {
  const port = 9333;
  const userDataDir = path.join(__dirname, '..', '.chrome-tmp');
  
  const chromeProc = spawn(CHROME_BIN, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check'
  ], { stdio: 'ignore' });

  // Wait for Chrome to be ready
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
    throw new Error('Chrome did not start in time');
  }

  // Create new target
  const newTarget = await fetchJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, 'PUT');
  const wsUrl = newTarget.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
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
  await send('Log.enable');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('BROWSER CONSOLE:', data.params.type, data.params.args.map(a => a.value || a.description).join(' '));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('BROWSER EXCEPTION:', data.params.exceptionDetails.text, data.params.exceptionDetails.exception?.description);
    }
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600
  });

  console.log('Navigating to', url);
  await send('Page.navigate', { url });

  // Wait for load
  await new Promise(r => setTimeout(r, 3000));

  // Check DOM text
  const evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText.slice(0, 300)'
  });
  console.log('Page innerText preview:', evalRes.result?.value);

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
  console.log(`Saved screenshot to ${outPath} (${screenshot.data.length} b64 chars)`);

  ws.close();
  chromeProc.kill();
}

const targetUrl = process.argv[2] || 'http://localhost:3000/dashboard?auth=demo&tab=design';
const out = process.argv[3] || path.join(__dirname, '..', 'screenshots', 'editor_desktop.png');
const w = parseInt(process.argv[4] || '1280', 10);
const h = parseInt(process.argv[5] || '950', 10);

capture(targetUrl, out, w, h)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
