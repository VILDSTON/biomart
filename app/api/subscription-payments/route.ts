import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { FOUNDER_TELEGRAM_ID } from '@/lib/constants';

export interface SubscriptionPaymentOrder {
  id: string;
  storeSlug: string;
  storeName: string;
  plan: 'plus' | 'pro';
  amountUzs: number;
  paymentMethod: 'card' | 'click' | 'payme';
  senderPhoneOrTg: string;
  receiptUrl?: string;
  transactionRef?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  createdAt: string;
}

const INITIAL_PAYMENTS: SubscriptionPaymentOrder[] = [
  {
    id: 'pay-1',
    storeSlug: 'tashkent_drip',
    storeName: 'Tashkent Drip',
    plan: 'plus',
    amountUzs: 59000,
    paymentMethod: 'click',
    senderPhoneOrTg: '+998901234567',
    transactionRef: 'CLK-9081234',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
];

function getStoragePath(): string {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, 'subscription_payments.json');
  } catch {
    const tmpDir = path.join('/tmp', 'biomart_data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {}
    return path.join(tmpDir, 'subscription_payments.json');
  }
}

function loadPayments(): SubscriptionPaymentOrder[] {
  const globalRef = globalThis as unknown as { __biomart_subscription_payments?: SubscriptionPaymentOrder[] };
  if (globalRef.__biomart_subscription_payments && globalRef.__biomart_subscription_payments.length > 0) {
    return globalRef.__biomart_subscription_payments;
  }

  try {
    const filePath = getStoragePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalRef.__biomart_subscription_payments = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Subscription Payments] Could not read storage file:', err);
  }

  globalRef.__biomart_subscription_payments = [...INITIAL_PAYMENTS];
  return globalRef.__biomart_subscription_payments;
}

function savePayments(payments: SubscriptionPaymentOrder[]) {
  const globalRef = globalThis as unknown as { __biomart_subscription_payments?: SubscriptionPaymentOrder[] };
  globalRef.__biomart_subscription_payments = payments;

  try {
    const filePath = getStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(payments, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Subscription Payments] Could not write to disk storage:', err);
  }
}

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get('biomart_admin_super')?.value;
  if (cookieVal === 'true') return true;

  const headerKey = req.headers.get('x-admin-key')?.trim();
  const expectedKey = (process.env.ADMIN_PASSKEY || process.env.ADMIN_SECRET_KEY || 'admin2026').trim();
  if (headerKey && headerKey === expectedKey) return true;

  return false;
}

async function notifyFounderNewPayment(payment: SubscriptionPaymentOrder) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || process.env.TG_BOT_TOKEN?.trim();
  if (!botToken || !FOUNDER_TELEGRAM_ID) return;

  const planTitle = payment.plan === 'pro' ? '🚀 PRO ($8 / ~99 000 сум)' : '⭐ PLUS ($4 / ~59 000 сум)';
  const formattedAmount = `${new Intl.NumberFormat('ru-RU').format(payment.amountUzs)} сум`;
  const cleanSender = payment.senderPhoneOrTg.replace(/[^\d+]/g, '');

  const text = `💰 <b>НОВАЯ ОПЛАТА ТАРИФА BIOMART</b>
━━━━━━━━━━━━━━━━━━━━━
🏪 <b>Магазин:</b> ${payment.storeName} (<code>/${payment.storeSlug}</code>)
📦 <b>Тариф:</b> ${planTitle}
💵 <b>Сумма:</b> <b>${formattedAmount}</b>
💳 <b>Метод:</b> ${payment.paymentMethod.toUpperCase()}
${payment.transactionRef ? `🔢 <b>Номер перевода / чек:</b> <code>${payment.transactionRef}</code>\n` : ''}👤 <b>Контакт отправителя:</b> <code>${payment.senderPhoneOrTg}</code>
━━━━━━━━━━━━━━━━━━━━━
⏳ <i>Статус: ожидает проверки в админ-панели</i>`;

  const inlineKeyboard: Array<Array<{ text: string; url: string }>> = [
    [
      { text: '🛡 Открыть в Admin', url: `https://biomart.vercel.app/admin` },
      { text: '🏪 Витрина магазина', url: `https://biomart.vercel.app/${payment.storeSlug}` },
    ],
  ];

  if (cleanSender.length >= 9) {
    inlineKeyboard.push([
      { text: '📞 Позвонить продавцу', url: `tel:${cleanSender}` },
      { text: '💬 Чат в WhatsApp', url: `https://wa.me/${cleanSender.replace('+', '')}` },
    ]);
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: FOUNDER_TELEGRAM_ID,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }),
    });
  } catch (e) {
    console.warn('[Subscription Payments] Telegram notify error:', e);
  }
}

export async function GET() {
  const payments = loadPayments();
  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`sub_pay_${clientIp}`, 5, 60 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Пожалуйста, подождите перед повторной отправкой.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { storeSlug, storeName, plan, amountUzs, paymentMethod, senderPhoneOrTg, receiptUrl, transactionRef } = body;

    if (!storeSlug) {
      return NextResponse.json({ error: 'Идентификатор магазина обязателен' }, { status: 400 });
    }

    const newOrder: SubscriptionPaymentOrder = {
      id: `pay-${Date.now()}`,
      storeSlug,
      storeName: storeName || storeSlug,
      plan: plan || 'plus',
      amountUzs: Number(amountUzs) || 59000,
      paymentMethod: paymentMethod || 'card',
      senderPhoneOrTg: senderPhoneOrTg || '',
      receiptUrl: receiptUrl || '',
      transactionRef: transactionRef || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const payments = loadPayments();
    payments.unshift(newOrder);
    savePayments(payments);

    // Notify founder in Telegram
    notifyFounderNewPayment(newOrder).catch((e) =>
      console.warn('[Subscription Payments] Notify exception:', e)
    );

    return NextResponse.json({ success: true, payment: newOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Ошибка обработки платежа' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Strictly verify admin authority before updating payment statuses
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ error: 'Доступ запрещён: требуется авторизация администратора' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, adminComment } = body;

    let payments = loadPayments();
    payments = payments.map((p) =>
      p.id === id ? { ...p, status, adminComment } : p
    );
    savePayments(payments);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Ошибка обновления статуса' }, { status: 500 });
  }
}
