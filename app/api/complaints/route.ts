import { NextResponse } from 'next/server';
import { Complaint } from '@/lib/moderation';

// In-memory persistent queue across hot-reloads
let globalComplaints: Complaint[] = [
  {
    id: 'comp-1',
    storeSlug: 'tashkent_drip',
    storeName: 'Tashkent Drip',
    reason: 'other',
    comment: 'Тестовая жалоба проверки модерации',
    reporterContact: '+998901234567',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ complaints: globalComplaints });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeSlug, storeName, productId, productTitle, reason, comment, reporterContact } = body;

    if (!storeSlug || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newComplaint: Complaint = {
      id: `comp-${Date.now()}`,
      storeSlug,
      storeName: storeName || storeSlug,
      productId,
      productTitle,
      reason,
      comment: comment || '',
      reporterContact: reporterContact || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    globalComplaints.unshift(newComplaint);

    return NextResponse.json({ success: true, complaint: newComplaint });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    globalComplaints = globalComplaints.map((c) =>
      c.id === id ? { ...c, status } : c
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
