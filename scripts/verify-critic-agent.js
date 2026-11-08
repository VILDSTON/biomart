const { chromium } = require('playwright');
const http = require('http');

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runCriticVerification() {
  console.log('======================================================');
  console.log('CRITIC & BUG FINDER AGENT: DEEP SYSTEM VERIFICATION');
  console.log('======================================================');

  let passed = true;

  // 1. Check all routes
  const routes = [
    '/',
    '/demo',
    '/demo?store=tashkent_drip',
    '/demo?store=volt_gadgets',
    '/demo?store=aura_perfume',
    '/tashkent_drip',
    '/volt_gadgets',
    '/aura_perfume',
    '/login',
    '/register',
    '/onboarding',
    '/dashboard',
    '/rules',
    '/terms',
    '/privacy',
  ];

  console.log('\n--- 1. VERIFYING ALL 15 HTTP ROUTES ---');
  for (const r of routes) {
    const res = await fetchUrl(r);
    const hasUnwantedBanner = res.data.includes('Демо-витрина') && res.data.includes('Управление →');
    const ok = res.statusCode === 200 && !hasUnwantedBanner;
    if (!ok) {
      console.error(`  FAIL [${r}] => Status: ${res.statusCode}, Unwanted banner: ${hasUnwantedBanner}`);
      passed = false;
    } else {
      console.log(`  PASS [${r}] => Status: 200, Clean banner-free`);
    }
  }

  // 2. Playwright Headless Chrome Verification
  console.log('\n--- 2. RUNNING PLAYWRIGHT E2E BROWSER TESTS ---');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Test 2.1: Landing Page Showcase item counts
  console.log('\n2.1. Verifying Landing Page Showcase counts...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const landingBody = await page.textContent('body');
  const hasAccurateCounts = landingBody.includes('6 товаров');
  console.log('  Showcase displays actual product counts (6 товаров):', hasAccurateCounts);
  if (!hasAccurateCounts) {
    console.error('  FAIL: Showcase section does not display 6 товаров');
    passed = false;
  }

  // Test 2.2: Cart isolation across demo presets
  console.log('\n2.2. Verifying Cart Isolation across demo stores (/demo)...');
  await page.goto('http://localhost:3000/demo?store=tashkent_drip', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click first product card on Tashkent Drip
  const tdCards = await page.$$('div[id^="product-"]');
  await tdCards[0].click();
  await page.waitForTimeout(600);

  // Pick size M
  const mBtn = await page.$('button:text-is("M")');
  if (mBtn) await mBtn.click();
  await page.waitForTimeout(300);

  // Click Add to cart
  const tdAddBtn = await page.$('button:has-text("В корзину •")');
  if (tdAddBtn) await tdAddBtn.click();
  await page.waitForTimeout(1000);

  const tashkentBody = await page.textContent('body');
  const tashkentHasCartItem = tashkentBody.includes('1 шт. в заказе') && tashkentBody.includes('320 000');
  console.log('  Tashkent Drip cart shows added item (1 шт. в заказе • 320 000):', tashkentHasCartItem);
  if (!tashkentHasCartItem) {
    console.error('  FAIL: Tashkent Drip did not register cart item');
    passed = false;
  }

  // Switch to Volt Gadgets via pill
  console.log('  Switching to Volt Gadgets...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const voltPill = await page.$('button:has-text("Volt Gadgets")');
  if (voltPill) {
    await voltPill.click({ force: true });
  } else {
    await page.goto('http://localhost:3000/demo?store=volt_gadgets', { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(1000);

  // Check that Volt Gadgets has NO items in cart (isolated!)
  const voltBody = await page.textContent('body');
  const voltHasLeak = voltBody.includes('1 шт. в заказе') || voltBody.includes('320 000');
  console.log('  Volt Gadgets cart is completely empty and isolated (no leak):', !voltHasLeak);
  if (voltHasLeak) {
    console.error('  FAIL: Volt Gadgets leaked cart items from Tashkent Drip!');
    passed = false;
  }

  // Add item on Volt Gadgets
  const voltCards = await page.$$('div[id^="product-"]');
  await voltCards[0].click();
  await page.waitForTimeout(600);

  const grayBtn = await page.$('button:text-is("Space Gray")');
  if (grayBtn) await grayBtn.click();
  await page.waitForTimeout(300);

  const voltAddBtn = await page.$('button:has-text("В корзину •")');
  if (voltAddBtn) await voltAddBtn.click();
  await page.waitForTimeout(1000);

  const voltBodyAfterAdd = await page.textContent('body');
  const voltHasCartItem = voltBodyAfterAdd.includes('1 шт. в заказе') && voltBodyAfterAdd.includes('420 000');
  console.log('  Volt Gadgets successfully added its own item (1 шт. в заказе • 420 000):', voltHasCartItem);
  if (!voltHasCartItem) {
    console.error('  FAIL: Volt Gadgets failed to add item to its isolated cart');
    passed = false;
  }

  // Switch to Aura Perfume
  console.log('  Switching to Aura Perfume...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const auraPill = await page.$('button:has-text("Aura Perfume")');
  if (auraPill) {
    await auraPill.click({ force: true });
  } else {
    await page.goto('http://localhost:3000/demo?store=aura_perfume', { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(1000);

  // Check that Aura Perfume has NO items in cart
  const auraBody = await page.textContent('body');
  const auraHasLeak = auraBody.includes('1 шт. в заказе') || auraBody.includes('320 000') || auraBody.includes('420 000');
  console.log('  Aura Perfume cart is completely empty and isolated (no leak):', !auraHasLeak);
  if (auraHasLeak) {
    console.error('  FAIL: Aura Perfume leaked cart items from previous stores!');
    passed = false;
  }

  // Switch back to Tashkent Drip and verify original cart item remains!
  console.log('  Switching back to Tashkent Drip...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const tdPill = await page.$('button:has-text("Tashkent Drip")');
  if (tdPill) {
    await tdPill.click({ force: true });
  } else {
    await page.goto('http://localhost:3000/demo?store=tashkent_drip', { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(1000);

  const tdBodyBack = await page.textContent('body');
  const tdCartPreserved = tdBodyBack.includes('1 шт. в заказе') && tdBodyBack.includes('320 000');
  console.log('  Tashkent Drip original cart session preserved (1 шт. в заказе • 320 000):', tdCartPreserved);
  if (!tdCartPreserved) {
    console.error('  FAIL: Tashkent Drip cart was not preserved when switching back!');
    passed = false;
  }

  // Test 2.3: Dashboard tab safety fallback (tab=tariff & tab=ai)
  console.log('\n2.3. Verifying Dashboard fallback on disabled tabs (/dashboard?tab=tariff)...');
  await page.goto('http://localhost:3000/dashboard?auth=demo&tab=tariff', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const dashTariffBody = await page.textContent('body');
  const dashTariffHasContent = dashTariffBody.includes('Заказы') || dashTariffBody.includes('Каталог') || dashTariffBody.includes('Витрина');
  console.log('  /dashboard?tab=tariff safely renders orders/dashboard without blank screen:', dashTariffHasContent);
  if (!dashTariffHasContent) {
    console.error('  FAIL: /dashboard?tab=tariff resulted in blank screen!');
    passed = false;
  }

  console.log('\n2.4. Verifying Dashboard fallback on disabled AI (/dashboard?tab=ai)...');
  await page.goto('http://localhost:3000/dashboard?auth=demo&tab=ai', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const dashAiBody = await page.textContent('body');
  const dashAiHasContent = dashAiBody.includes('Заказы') || dashAiBody.includes('Каталог') || dashAiBody.includes('Витрина');
  console.log('  /dashboard?tab=ai safely renders orders/dashboard without blank screen:', dashAiHasContent);
  if (!dashAiHasContent) {
    console.error('  FAIL: /dashboard?tab=ai resulted in blank screen!');
    passed = false;
  }

  // Test 2.5: Verify /terms and /privacy pages render properly
  console.log('\n2.5. Verifying /terms and /privacy pages...');
  await page.goto('http://localhost:3000/terms', { waitUntil: 'networkidle' });
  const termsTitle = await page.textContent('h1');
  const termsOk = termsTitle.includes('Пользовательское соглашение');
  console.log('  /terms rendered cleanly:', termsOk);

  await page.goto('http://localhost:3000/privacy', { waitUntil: 'networkidle' });
  const privacyTitle = await page.textContent('h1');
  const privacyOk = privacyTitle.includes('Политика конфиденциальности');
  console.log('  /privacy rendered cleanly:', privacyOk);

  await browser.close();

  if (passed) {
    console.log('\n======================================================');
    console.log('>>> ALL CRITIC & BUG FINDER TESTS PASSED 100%! <<<');
    console.log('======================================================');
  } else {
    console.error('\n>>> SOME CRITIC CHECKS FAILED! <<<');
    process.exit(1);
  }
}

runCriticVerification().catch((err) => {
  console.error('CRITIC TEST ERROR:', err);
  process.exit(1);
});
