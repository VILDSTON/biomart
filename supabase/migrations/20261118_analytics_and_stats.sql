-- ==============================================================================
-- BioMart: Zero-Waste Daily Aggregated Analytics & Traffic Tracking
-- ==============================================================================

-- 1. Create store_daily_stats table
CREATE TABLE IF NOT EXISTS store_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  product_clicks INTEGER NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  orders_revenue NUMERIC(14, 2) NOT NULL DEFAULT 0,
  source_instagram INTEGER NOT NULL DEFAULT 0,
  source_telegram INTEGER NOT NULL DEFAULT 0,
  source_direct INTEGER NOT NULL DEFAULT 0,
  source_other INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_store_daily_stats UNIQUE (store_id, stat_date)
);

-- Index for fast time-series queries per store
CREATE INDEX IF NOT EXISTS idx_store_daily_stats_lookup
  ON store_daily_stats (store_id, stat_date DESC);

-- 2. Add views_count to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_views_count
  ON products (store_id, views_count DESC);

-- 3. Atomic Postgres RPC for Ingestion
CREATE OR REPLACE FUNCTION record_store_event(
  p_store_id UUID,
  p_event_type TEXT,
  p_source TEXT DEFAULT 'direct',
  p_is_unique BOOLEAN DEFAULT FALSE,
  p_product_id UUID DEFAULT NULL,
  p_order_amount NUMERIC DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_views_delta INTEGER := 0;
  v_unique_delta INTEGER := 0;
  v_clicks_delta INTEGER := 0;
  v_orders_delta INTEGER := 0;
  v_revenue_delta NUMERIC := 0;
  v_ig_delta INTEGER := 0;
  v_tg_delta INTEGER := 0;
  v_direct_delta INTEGER := 0;
  v_other_delta INTEGER := 0;
BEGIN
  -- 1. Calculate event deltas
  IF p_event_type = 'page_view' THEN
    v_views_delta := 1;
    IF p_is_unique THEN
      v_unique_delta := 1;
    END IF;
  ELSIF p_event_type = 'product_view' THEN
    v_views_delta := 1;
    v_clicks_delta := 1;
    -- Increment product-level counter atomically
    IF p_product_id IS NOT NULL THEN
      UPDATE products
      SET views_count = COALESCE(views_count, 0) + 1
      WHERE id = p_product_id AND store_id = p_store_id;
    END IF;
  ELSIF p_event_type = 'order' THEN
    v_orders_delta := 1;
    v_revenue_delta := COALESCE(p_order_amount, 0);
  ELSIF p_event_type = 'click' THEN
    v_clicks_delta := 1;
  END IF;

  -- 2. Calculate source deltas
  IF p_source = 'instagram' THEN
    v_ig_delta := 1;
  ELSIF p_source = 'telegram' THEN
    v_tg_delta := 1;
  ELSIF p_source = 'direct' THEN
    v_direct_delta := 1;
  ELSE
    v_other_delta := 1;
  END IF;

  -- 3. Single atomic upsert into daily aggregated stats
  INSERT INTO store_daily_stats (
    store_id,
    stat_date,
    views,
    unique_visitors,
    product_clicks,
    orders_count,
    orders_revenue,
    source_instagram,
    source_telegram,
    source_direct,
    source_other,
    updated_at
  ) VALUES (
    p_store_id,
    CURRENT_DATE,
    v_views_delta,
    v_unique_delta,
    v_clicks_delta,
    v_orders_delta,
    v_revenue_delta,
    v_ig_delta,
    v_tg_delta,
    v_direct_delta,
    v_other_delta,
    NOW()
  )
  ON CONFLICT (store_id, stat_date) DO UPDATE SET
    views = store_daily_stats.views + EXCLUDED.views,
    unique_visitors = store_daily_stats.unique_visitors + EXCLUDED.unique_visitors,
    product_clicks = store_daily_stats.product_clicks + EXCLUDED.product_clicks,
    orders_count = store_daily_stats.orders_count + EXCLUDED.orders_count,
    orders_revenue = store_daily_stats.orders_revenue + EXCLUDED.orders_revenue,
    source_instagram = store_daily_stats.source_instagram + EXCLUDED.source_instagram,
    source_telegram = store_daily_stats.source_telegram + EXCLUDED.source_telegram,
    source_direct = store_daily_stats.source_direct + EXCLUDED.source_direct,
    source_other = store_daily_stats.source_other + EXCLUDED.source_other,
    updated_at = NOW();
END;
$$;

-- 4. Row Level Security on store_daily_stats
ALTER TABLE store_daily_stats ENABLE ROW LEVEL SECURITY;

-- Block public anon direct writes to stats table
REVOKE INSERT, UPDATE, DELETE ON store_daily_stats FROM anon, authenticated;

-- Allow owners to read their own stats
DROP POLICY IF EXISTS "Owners can view store stats" ON store_daily_stats;
CREATE POLICY "Owners can view store stats" ON store_daily_stats FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_daily_stats.store_id 
        AND stores.owner_id = auth.uid()
    )
  );

-- Grant execute on RPC function
GRANT EXECUTE ON FUNCTION record_store_event TO anon, authenticated, service_role;
