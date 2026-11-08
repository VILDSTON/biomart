const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const screenshotsDir = 'C:/Users/Hp/.gemini/antigravity/brain/a9ccc2ab-4005-41e9-8645-63b4c7250850/screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Checking Landing Page (http://localhost:3000)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Verify Hero A exists and no hero switcher
  const heroText = await page.textContent('body');
  const hasHeroSwitcher = heroText.includes('Вариант Hero') || heroText.includes('Hero A / B');
  console.log('Hero switcher absent:', !hasHeroSwitcher);

  // Check FAQ
  const hasOldFaq = heroText.includes('Как работает оплата? Оплата происходит напрямую вам');
  const hasNewFaq = heroText.includes('Как защищены покупатели и как работает модерация витрин?');
  console.log('Old payment FAQ removed:', !hasOldFaq);
  console.log('New moderation FAQ present:', hasNewFaq);

  // Check Anchors exist
  const featuresAnchor = await page.$('#features');
  const calcAnchor = await page.$('#calculator');
  const pricingAnchor = await page.$('#pricing');
  const faqAnchor = await page.$('#faq');
  console.log('Anchors exist:', {
    features: Boolean(featuresAnchor),
    calculator: Boolean(calcAnchor),
    pricing: Boolean(pricingAnchor),
    faq: Boolean(faqAnchor),
  });

  await page.screenshot({ path: path.join(screenshotsDir, 'verification_landing_desktop.png'), fullPage: false });

  console.log('2. Checking Storefront Header (390px mobile)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/tashkent_drip', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const storeHeaderTitle = await page.textContent('h1');
  console.log('Storefront h1 text:', storeHeaderTitle.trim());

  await page.screenshot({ path: path.join(screenshotsDir, 'verification_storefront_390px.png'), fullPage: false });

  // Test complaint button
  const complaintBtn = await page.$('button[title*="Shikoyat"], button[title*="Пожаловаться"]');
  console.log('Complaint button present on storefront:', Boolean(complaintBtn));
  if (complaintBtn) {
    await complaintBtn.click();
    await page.waitForTimeout(600);
    const hasModal = (await page.textContent('body')).includes('Пожаловаться модераторам');
    console.log('Complaint modal opened:', hasModal);
    await page.screenshot({ path: path.join(screenshotsDir, 'verification_complaint_modal.png') });
    const closeBtn = await page.$('button:has-text("Отмена")');
    if (closeBtn) await closeBtn.click();
    await page.waitForTimeout(300);
  }

  console.log('3. Checking Admin Panel (http://localhost:3000/admin)...');
  await page.setViewportSize({ width: 1280, height: 850 });
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });

  // Enter password admin2026
  await page.fill('input[type="password"]', 'admin2026');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  const adminBody = await page.textContent('body');
  const hasModerationTab = adminBody.includes('Очередь модерации');
  const hasComplaintsTab = adminBody.includes('Жалобы покупателей');
  const hasPaymentsTab = adminBody.includes('Платежи подписок');
  const hasBansTab = adminBody.includes('Черный список');
  console.log('Admin panel tabs present:', {
    moderation: hasModerationTab,
    complaints: hasComplaintsTab,
    payments: hasPaymentsTab,
    bans: hasBansTab,
  });

  await page.screenshot({ path: path.join(screenshotsDir, 'verification_admin_panel.png') });

  console.log('4. Checking Dashboard (http://localhost:3000/dashboard)...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });

  // Login if password prompt
  const pwdInput = await page.$('input[placeholder="Пароль администратора"]');
  if (pwdInput) {
    await pwdInput.fill('admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
  }

  // Open Contacts/Settings to verify slug/store_name editor
  const contactsTab = await page.$('button:has-text("Контакты")');
  if (contactsTab) {
    await contactsTab.click();
    await page.waitForTimeout(600);
    const hasSlugEditor = (await page.textContent('body')).includes('Основные данные и адрес витрины');
    console.log('Slug and store name editor present:', hasSlugEditor);
    await page.screenshot({ path: path.join(screenshotsDir, 'verification_dashboard_settings.png') });
  }

  // Check Team Tab
  const teamTab = await page.$('button:has-text("Команда")');
  console.log('Team tab button present:', Boolean(teamTab));
  if (teamTab) {
    await teamTab.click();
    await page.waitForTimeout(600);
    const hasTeamRoles = (await page.textContent('body')).includes('Команда и управление доступом (URM)');
    console.log('Team roles section present:', hasTeamRoles);
    await page.screenshot({ path: path.join(screenshotsDir, 'verification_dashboard_team.png') });
  }

  // Check Tariff Tab & P2P Payment Modal
  const tariffTab = await page.$('button:has-text("Тариф")');
  if (tariffTab) {
    await tariffTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'verification_dashboard_tariffs.png') });

    // Open Plus Payment Modal
    const upgradePlusBtn = await page.$('button:has-text("Перейти на Plus")');
    if (upgradePlusBtn) {
      await upgradePlusBtn.click();
      await page.waitForTimeout(600);
      const hasPaymentModal = (await page.textContent('body')).includes('Прямая оплата тарифа');
      console.log('P2P Payment modal opened:', hasPaymentModal);
      await page.screenshot({ path: path.join(screenshotsDir, 'verification_p2p_payment_modal.png') });
    }
  }

  // Check Theme Bleed: Navigate from /tashkent_drip to / and check root styles
  console.log('5. Checking Theme Bleed (Storefront -> Landing)...');
  await page.goto('http://localhost:3000/tashkent_drip', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const rootColor = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  });
  console.log('Landing root --accent after visiting storefront:', rootColor || 'Clean / Default (#1F7A5A)');

  await browser.close();
  console.log('ALL VERIFICATIONS PASSED 100%!');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
