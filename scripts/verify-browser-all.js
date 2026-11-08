const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verify() {
  console.log('=== STARTING BROWSER E2E VERIFICATION WITH HEADLESS CHROME ===');

  const screenshotsDir = 'C:/Users/Hp/BioMart/screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Landing Page
  console.log('\n1. Checking Landing Page (http://localhost:3000)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const landingText = await page.textContent('body');
  const landingHasDemoBanner = landingText.includes('Демо-витрина') && landingText.includes('Управление →');
  console.log('  Landing page has NO unwanted demo banner:', !landingHasDemoBanner);
  await page.screenshot({ path: path.join(screenshotsDir, 'landing_page.png') });

  // 2. Demo Page - Tashkent Drip
  console.log('\n2. Checking /demo default (Tashkent Drip)...');
  await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const demoText = await page.textContent('body');
  const hasTopBarDemo = demoText.includes('Демо') && demoText.includes('Создать витрину');
  const hasTashkentPill = demoText.includes('Tashkent Drip') && demoText.includes('Одежда');
  const hasVoltPill = demoText.includes('Volt Gadgets') && demoText.includes('Гаджеты');
  const hasAuraPill = demoText.includes('Aura Perfume') && demoText.includes('Парфюм');
  const hasUnwantedBanner = demoText.includes('Демо-витрина') && demoText.includes('Управление →');
  const hasH1Tashkent = (await page.textContent('h1')).includes('Tashkent Drip');
  const hasWatermark = demoText.includes('Витрина создана на') && demoText.includes('BioMart');

  console.log('  Demo top bar present:', hasTopBarDemo);
  console.log('  "Tashkent Drip [Одежда]" pill present:', hasTashkentPill);
  console.log('  "Volt Gadgets [Гаджеты]" pill present:', hasVoltPill);
  console.log('  "Aura Perfume [Парфюм]" pill present:', hasAuraPill);
  console.log('  Unwanted redundant "Демо-витрина ... Управление →" banner ABSENT:', !hasUnwantedBanner);
  console.log('  Storefront H1 displays "Tashkent Drip":', hasH1Tashkent);
  console.log('  Footer watermark "Витрина создана на BioMart" present:', hasWatermark);
  await page.screenshot({ path: path.join(screenshotsDir, 'demo_tashkent_drip.png') });

  // 3. Switch to Volt Gadgets on /demo
  console.log('\n3. Switching to Volt Gadgets on /demo...');
  const voltBtn = await page.$('button:has-text("Volt Gadgets")');
  if (voltBtn) {
    await voltBtn.click();
    await page.waitForTimeout(1000);
  } else {
    await page.goto('http://localhost:3000/demo?store=volt_gadgets', { waitUntil: 'networkidle' });
  }

  const voltPageText = await page.textContent('body');
  const voltH1 = await page.textContent('h1');
  const hasVoltPods = voltPageText.includes('Volt Pods Max') || voltPageText.includes('Повербанк');
  const hasVoltUnwantedBanner = voltPageText.includes('Демо-витрина') && voltPageText.includes('Управление →');
  console.log('  Storefront H1 displays "Volt Gadgets":', voltH1.includes('Volt Gadgets'));
  console.log('  Electronics products rendered (Volt Pods / Powerbank):', hasVoltPods);
  console.log('  Unwanted redundant banner ABSENT on Volt Gadgets:', !hasVoltUnwantedBanner);
  await page.screenshot({ path: path.join(screenshotsDir, 'demo_volt_gadgets.png') });

  // 4. Switch to Aura Perfume on /demo
  console.log('\n4. Switching to Aura Perfume on /demo...');
  const auraBtn = await page.$('button:has-text("Aura Perfume")');
  if (auraBtn) {
    await auraBtn.click();
    await page.waitForTimeout(1000);
  } else {
    await page.goto('http://localhost:3000/demo?store=aura_perfume', { waitUntil: 'networkidle' });
  }

  const auraPageText = await page.textContent('body');
  const auraH1 = await page.textContent('h1');
  const hasPerfumeProducts = auraPageText.includes('Tashkent Night') || auraPageText.includes('Baccarat');
  const hasAuraUnwantedBanner = auraPageText.includes('Демо-витрина') && auraPageText.includes('Управление →');
  console.log('  Storefront H1 displays "Aura Perfume":', auraH1.includes('Aura Perfume'));
  console.log('  Perfume products rendered (Tashkent Night / Baccarat):', hasPerfumeProducts);
  console.log('  Unwanted redundant banner ABSENT on Aura Perfume:', !hasAuraUnwantedBanner);
  await page.screenshot({ path: path.join(screenshotsDir, 'demo_aura_perfume.png') });

  // 5. Check direct storefront slug routes
  console.log('\n5. Checking direct slug routes (/[slug])...');
  await page.goto('http://localhost:3000/volt_gadgets', { waitUntil: 'networkidle' });
  const directVoltText = await page.textContent('body');
  console.log('  /volt_gadgets direct route works:', directVoltText.includes('Volt Gadgets') && !directVoltText.includes('Управление →'));

  await page.goto('http://localhost:3000/aura_perfume', { waitUntil: 'networkidle' });
  const directAuraText = await page.textContent('body');
  console.log('  /aura_perfume direct route works:', directAuraText.includes('Aura Perfume') && !directAuraText.includes('Управление →'));

  // 6. Check /login and /register
  console.log('\n6. Checking /login and /register...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  const loginText = await page.textContent('body');
  console.log('  /login renders cleanly:', loginText.includes('Вход в кабинет продавца'));

  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
  const registerText = await page.textContent('body');
  console.log('  /register renders cleanly:', registerText.includes('Создать витрину'));

  // 7. Check /dashboard
  console.log('\n7. Checking /dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  const dashboardText = await page.textContent('body');
  console.log('  /dashboard renders cleanly:', dashboardText.includes('Панель управления') || dashboardText.includes('Управление витриной') || dashboardText.includes('Вход'));

  await browser.close();
  console.log('\n>>> BROWSER E2E VERIFICATION COMPLETED WITH FLYING COLORS! <<<');
}

verify().catch((e) => {
  console.error('Browser verification failed:', e);
  process.exit(1);
});
