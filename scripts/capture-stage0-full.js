const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\a9ccc2ab-4005-41e9-8645-63b4c7250850\\screenshots';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: 'mobile_390px', width: 390, height: 844 },
  { name: 'tablet_768px', width: 768, height: 1024 },
  { name: 'desktop_1440px', width: 1440, height: 900 },
];

async function capture() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  for (const vp of viewports) {
    // 1. Light Mode Full Page
    const contextLight = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: 'light',
    });
    const pageLight = await contextLight.newPage();
    await pageLight.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await pageLight.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('biomart_theme', 'light');
    });
    await pageLight.waitForTimeout(600);

    const lightPath = path.join(ARTIFACT_DIR, `stage0_full_${vp.name}_light.png`);
    await pageLight.screenshot({ path: lightPath, fullPage: true });
    console.log(`Saved: ${lightPath}`);
    await contextLight.close();

    // 2. Dark Mode Full Page
    const contextDark = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: 'dark',
    });
    const pageDark = await contextDark.newPage();
    await pageDark.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await pageDark.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('biomart_theme', 'dark');
    });
    await pageDark.waitForTimeout(600);

    const darkPath = path.join(ARTIFACT_DIR, `stage0_full_${vp.name}_dark.png`);
    await pageDark.screenshot({ path: darkPath, fullPage: true });
    console.log(`Saved: ${darkPath}`);
    await contextDark.close();
  }

  await browser.close();
  console.log('Full-page screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
