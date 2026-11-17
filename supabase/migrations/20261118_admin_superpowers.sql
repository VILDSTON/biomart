-- ==============================================================================
-- BioMart: Platform Settings, Audit Logs, and Showcase Growth Features
-- ==============================================================================

-- 1. Add is_featured flag to stores table for landing page showcase
ALTER TABLE stores 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_stores_is_featured 
  ON stores(is_featured) WHERE is_featured = TRUE;

-- 2. Create platform_settings table (dynamic payment requisites, prices, banner)
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT DEFAULT 'admin'
);

-- Seed initial settings
INSERT INTO platform_settings (key, value) VALUES 
  (
    'payment_requisites', 
    '{"card_number":"8600 0410 1234 5678","card_holder":"VILDSTON A.","bank_name":"Kapitalbank / Click / Payme","payment_instructions":"После перевода отправьте скриншот чека боту @BioMartAssistant_bot или загрузите в форме"}'::jsonb
  ),
  (
    'pricing_plans', 
    '{"plus_price":59000,"plus_limit":100,"pro_price":129000,"pro_limit":999999}'::jsonb
  ),
  (
    'global_banner', 
    '{"is_active":false,"text":"🚀 Скидка 20% при оплате тарифа Pro на 3 месяца! Напишите в поддержку для активации.","link":"/dashboard?tab=tariff"}'::jsonb
  )
ON CONFLICT (key) DO NOTHING;

-- 3. Create admin_audit_logs table (audit trail for admin actions)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  performed_by TEXT DEFAULT 'admin',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created 
  ON admin_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target 
  ON admin_audit_logs(target_type, target_id);

-- 4. Row Level Security Policies
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to platform settings (requisites, banners, prices)
DROP POLICY IF EXISTS "Public platform settings read" ON platform_settings;
CREATE POLICY "Public platform settings read" ON platform_settings FOR SELECT USING (true);

-- Disallow direct anon writes to platform_settings (only service_role / verified admin)
REVOKE INSERT, UPDATE, DELETE ON platform_settings FROM anon, authenticated;
REVOKE ALL ON admin_audit_logs FROM anon, authenticated;
