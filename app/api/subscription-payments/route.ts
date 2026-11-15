import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
  // 1. Check globalThis cache
  const globalRef = globalThis as unknown as { __biomart_subscription_payments?: SubscriptionPaymentOrder[] };
  if (globalRef.__biomart_subscription_payments && globalRef.__biomart_subscription_payments.length > 0) {
    return globalRef.__biomart_subscription_payments;
  }

  // 2. Check disk /tmp
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

export async function GET() {
  const payments = loadPayments();
  return NextResponse.json({ payments });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeSlug, storeName, plan, amountUzs, paymentMethod, senderPhoneOrTg, receiptUrl, transactionRef } = body;

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

    return NextResponse.json({ success: true, payment: newOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, adminComment } = body;

    let payments = loadPayments();
    payments = payments.map((p) =>
      p.id === id ? { ...p, status, adminComment } : p
    );
    savePayments(payments);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
