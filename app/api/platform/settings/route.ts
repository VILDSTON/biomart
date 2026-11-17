import { NextRequest, NextResponse } from 'next/server';
import { getAllPlatformSettings, setPlatformSetting, PlatformSettingsMap } from '@/lib/platform-settings';
import { verifyAdminRequest } from '@/lib/seller-auth';
import { logAdminAction } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAllPlatformSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error fetching settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Admin only
    if (!verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { key, value } = body;

    const validKeys: Array<keyof PlatformSettingsMap> = ['payment_requisites', 'pricing_plans', 'global_banner'];
    if (!key || !validKeys.includes(key)) {
      return NextResponse.json({ error: 'Invalid settings key' }, { status: 400 });
    }

    const updated = await setPlatformSetting(key, value);

    // Audit log
    await logAdminAction({
      action: 'update_platform_setting',
      target_type: 'settings',
      target_id: key,
      details: { updated_fields: Object.keys(value || {}) },
    });

    return NextResponse.json({ success: true, key, updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error updating settings' }, { status: 500 });
  }
}
