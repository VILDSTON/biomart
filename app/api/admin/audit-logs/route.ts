import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/seller-auth';
import { getAdminAuditLogs } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    const logs = await getAdminAuditLogs(limit);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error fetching audit logs' }, { status: 500 });
  }
}
