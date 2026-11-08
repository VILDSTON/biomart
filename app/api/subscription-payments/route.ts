import { NextResponse } from 'next/server';

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

let globalPayments: SubscriptionPaymentOrder[] = [
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

export async function GET() {
  return NextResponse.json({ payments: globalPayments });
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

    globalPayments.unshift(newOrder);

    return NextResponse.json({ success: true, payment: newOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, adminComment } = body;

    globalPayments = globalPayments.map((p) =>
      p.id === id ? { ...p, status, adminComment } : p
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
