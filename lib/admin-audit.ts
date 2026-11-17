import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export interface AdminAuditEntry {
  id?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, any>;
  performed_by?: string;
  ip_address?: string;
  created_at?: string;
}

const AUDIT_FILE = path.join(process.cwd(), 'data', 'admin_audit_logs.json');

export async function logAdminAction(entry: AdminAuditEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  const record: AdminAuditEntry = {
    ...entry,
    created_at: timestamp,
    performed_by: entry.performed_by || 'admin',
    details: entry.details || {},
  };

  // 1. Persist to Supabase if configured
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      await supabaseAdmin.from('admin_audit_logs').insert(record);
    } catch (err) {
      console.warn('[Audit Log] Supabase insert warning:', err);
    }
  }

  // 2. Persist to local JSON file for dev / fallback
  try {
    const dir = path.dirname(AUDIT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let existing: AdminAuditEntry[] = [];
    if (fs.existsSync(AUDIT_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
      } catch {}
    }
    existing.unshift({
      ...record,
      id: record.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    });
    if (existing.length > 500) existing = existing.slice(0, 500);
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Audit Log] File write warning:', err);
  }
}

export async function getAdminAuditLogs(limit: number = 100): Promise<AdminAuditEntry[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {}
  }

  // Fallback to local file
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
      if (Array.isArray(parsed)) return parsed.slice(0, limit);
    }
  } catch {}

  return [];
}
