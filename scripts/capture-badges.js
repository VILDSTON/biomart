const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/a9ccc2ab-4005-41e9-8645-63b4c7250850/screenshots';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const themes = ['light', 'dark'];
  for (const theme of themes) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });

    await page.goto('http://localhost:3000/tashkent_drip', { waitUntil: 'networkidle' });

    await page.evaluate((th) => {
      if (th === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }, theme);

    await page.waitForTimeout(500);

    const outPath = path.join(OUT_DIR, `storefront_badges_${theme}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved: ${outPath}`);
    await page.close();
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
