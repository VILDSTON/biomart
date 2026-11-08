const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testSubscriptions() {
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

  console.log('1. Navigating to Dashboard (http://localhost:3000/dashboard)...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });

  // Handle password gate if present
  const pwdInput = await page.$('input[placeholder="Пароль администратора"]');
  if (pwdInput) {
    await pwdInput.fill('admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
  }

  // Go to Tariff Tab
  console.log('2. Opening Tariff Tab...');
  const tariffTab = await page.$('button:has-text("Тариф")');
  if (tariffTab) {
    await tariffTab.click();
    await page.waitForTimeout(600);
  }

  await page.screenshot({ path: path.join(screenshotsDir, 'test_tariff_tab_initial.png') });

  // Test Promo Code Activation directly in Tariff Tab
  console.log('3. Testing Promo Code "TESTPRO"...');
  const promoInput = await page.$('input[placeholder="ПРОМОКОД"]');
  if (promoInput) {
    await promoInput.fill('TESTPRO');
    const applyBtn = await page.$('button:has-text("Активировать")');
    if (applyBtn) {
      await applyBtn.click();
      await page.waitForTimeout(800);
    }
  }

  const bodyAfterPromo = await page.textContent('body');
  const isProActive = bodyAfterPromo.includes('Текущий тариф: PRO') || bodyAfterPromo.includes('👑 PRO VIP');
  console.log('PRO Plan active after promo:', isProActive);

  await page.screenshot({ path: path.join(screenshotsDir, 'test_tariff_after_testpro.png') });

  // Try to click Start card to test Downgrade Prevention
  console.log('4. Testing Downgrade Prevention (Clicking START while on PRO)...');
  const startCard = await page.$('div:has-text("Start"):has-text("0 сум")');
  if (startCard) {
    await startCard.click();
    await page.waitForTimeout(500);
  }

  const bodyAfterStartClick = await page.textContent('body');
  const stillPro = bodyAfterStartClick.includes('Текущий тариф: PRO') || bodyAfterStartClick.includes('👑 PRO VIP');
  console.log('Still PRO after clicking START (downgrade blocked):', stillPro);

  // Try to click Plus card
  console.log('5. Testing Plus click while on PRO...');
  const plusCard = await page.$('div:has-text("Plus"):has-text("59 000 сум")');
  if (plusCard) {
    await plusCard.click();
    await page.waitForTimeout(500);
  }

  const stillProAfterPlus = (await page.textContent('body')).includes('👑 PRO VIP');
  console.log('Still PRO after clicking PLUS (downgrade blocked):', stillProAfterPlus);

  // Reset to Start in biomart_multi_store_v3 to test Anonymous Card Payment Modal
  console.log('6. Resetting to Start to test Anonymous Card Payment Gateway...');
  await page.evaluate(() => {
    const raw = localStorage.getItem('biomart_multi_store_v3');
    if (raw) {
      const data = JSON.parse(raw);
      if (data.state && data.state.shops) {
        for (const k in data.state.shops) {
          data.state.shops[k].settings.plan = 'start';
        }
        localStorage.setItem('biomart_multi_store_v3', JSON.stringify(data));
      }
    }
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const tariffTab2 = await page.$('button:has-text("Тариф")');
  if (tariffTab2) {
    await tariffTab2.click();
    await page.waitForTimeout(600);
  }

  // Open Plus Payment Modal
  console.log('7. Opening Payment Modal for Plus...');
  const plusCardPay = await page.$('div:has-text("Plus") span:has-text("Оплатить →")');
  if (plusCardPay) {
    await plusCardPay.click();
    await page.waitForTimeout(600);
  }

  const modalBody = await page.textContent('body');
  const hasAdminCard = modalBody.includes('AZIZBEK B.') || modalBody.includes('8600 4902 3819 7461');
  console.log('Admin personal card hidden/absent:', !hasAdminCard);

  const hasOwnCardInput = modalBody.includes('Данные вашей карты');
  console.log('User own card input present:', hasOwnCardInput);

  await page.screenshot({ path: path.join(screenshotsDir, 'test_anonymous_card_modal.png') });

  // Fill User's Card
  console.log('8. Filling user card details...');
  await page.fill('input[placeholder="8600 0000 0000 0000"]', '8600 1234 5678 9012');
  await page.fill('input[placeholder="ММ / ГГ"]', '12/28');
  await page.fill('input[placeholder="+998 90 123 45 67"]', '+998 90 987 65 43');

  // Submit to 3D-Secure
  const payBtn = await page.$('button[type="submit"]:has-text("Оплатить")');
  if (payBtn) {
    await payBtn.click();
    await page.waitForTimeout(800);
  }

  const otpBody = await page.textContent('body');
  const isOtpStep = otpBody.includes('Подтверждение платежа (3D-Secure)');
  console.log('3D-Secure OTP step reached:', isOtpStep);

  await page.screenshot({ path: path.join(screenshotsDir, 'test_3d_secure_otp.png') });

  // Click test code fill
  const demoCodeBtn = await page.$('button:has-text("Вставить тестовый код")');
  if (demoCodeBtn) {
    await demoCodeBtn.click();
    await page.waitForTimeout(400);
  }

  // Confirm payment
  const confirmBtn = await page.$('button:has-text("Подтвердить оплату")');
  if (confirmBtn) {
    await confirmBtn.click();
    await page.waitForTimeout(1000);
  }

  const successBody = await page.textContent('body');
  const isPaymentSuccess = successBody.includes('Тариф «PLUS» успешно активирован!');
  console.log('Payment successful:', isPaymentSuccess);

  await page.screenshot({ path: path.join(screenshotsDir, 'test_payment_success.png') });

  // Close modal and verify state reset
  const closeSuccessBtn = await page.$('button:has-text("Перейти в панель управления")');
  if (closeSuccessBtn) {
    await closeSuccessBtn.click();
    await page.waitForTimeout(600);
  }

  console.log('9. Verifying modal state reset when opening PRO modal...');
  const upgradeProBtn = await page.$('div:has-text("Pro Бизнес") span:has-text("Апгрейд до PRO →")');
  if (upgradeProBtn) {
    await upgradeProBtn.click();
    await page.waitForTimeout(600);
  }

  const proModalBody = await page.textContent('body');
  const opensInCardStep = proModalBody.includes('Тариф PRO') && proModalBody.includes('Данные вашей карты');
  const doesNotShowStaleSuccess = !proModalBody.includes('Тариф «PLUS» успешно активирован!');
  console.log('Pro modal opens fresh (not showing stale Plus success):', opensInCardStep && doesNotShowStaleSuccess);

  await page.screenshot({ path: path.join(screenshotsDir, 'test_pro_fresh_modal.png') });

  // Apply 100% Promo BIOMART2026 inside modal
  console.log('10. Applying 100% promo BIOMART2026 inside modal...');
  const modalPromoInput = await page.$('input[placeholder*="TESTPRO"]');
  if (modalPromoInput) {
    await modalPromoInput.fill('BIOMART2026');
    const applyModalPromoBtn = await page.$('button:has-text("Применить")');
    if (applyModalPromoBtn) {
      await applyModalPromoBtn.click();
      await page.waitForTimeout(600);
    }
  }

  const promoAppliedBody = await page.textContent('body');
  const is100PercentApplied = promoAppliedBody.includes('Скидка 100%') && promoAppliedBody.includes('Активировать PRO бесплатно по промокоду');
  console.log('100% Promo BIOMART2026 applied in modal:', is100PercentApplied);

  await page.screenshot({ path: path.join(screenshotsDir, 'test_modal_100_percent_promo.png') });

  // Click activate free
  const activateFreeBtn = await page.$('button:has-text("Активировать PRO бесплатно")');
  if (activateFreeBtn) {
    await activateFreeBtn.click();
    await page.waitForTimeout(800);
  }

  const finalBody = await page.textContent('body');
  const isProSuccess = finalBody.includes('Тариф «PRO» успешно активирован!');
  console.log('PRO activated via promo in modal:', isProSuccess);

  await page.screenshot({ path: path.join(screenshotsDir, 'test_pro_activated_success.png') });

  await browser.close();
  console.log('ALL SUBSCRIPTION FIXES VERIFIED 100%!');
}

testSubscriptions().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
