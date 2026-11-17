-- Scander: enable atomic customer order submission on the existing V1.1 schema.
-- Run this entire file once in the project's Supabase SQL Editor.
-- Existing orders and menu data are preserved. No staff policies are changed.
-- This is a setup script, not a recorded CLI migration (CLI installation was unavailable).
BEGIN;

ALTER TABLE public.customer_order
  ADD COLUMN IF NOT EXISTS request_id UUID,
  ADD COLUMN IF NOT EXISTS request_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS tracking_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2);
CREATE UNIQUE INDEX IF NOT EXISTS customer_order_request_unique
  ON public.customer_order (restaurant_id, request_id);

CREATE OR REPLACE FUNCTION public.scander_submit_order(
  p_restaurant_id BIGINT, p_qr_token UUID, p_request_id UUID,
  p_tracking_hash TEXT, p_fingerprint TEXT, p_items JSONB, p_note TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_existing public.customer_order%ROWTYPE;
  v_table_id BIGINT;
  v_order_id BIGINT;
  v_line RECORD;
  v_price NUMERIC(10,2);
  v_subtotal NUMERIC(10,2) := 0;
  v_tax NUMERIC(10,2);
BEGIN
  IF p_restaurant_id IS NULL OR p_qr_token IS NULL OR p_request_id IS NULL
    OR p_tracking_hash IS NULL OR p_tracking_hash !~ '^[0-9a-f]{64}$'
    OR p_fingerprint IS NULL OR p_fingerprint !~ '^[0-9a-f]{64}$'
    OR char_length(coalesce(p_note, '')) > 500 THEN
    RAISE EXCEPTION 'Invalid order request' USING ERRCODE = '22023';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'Order items must be an array' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION 'Order must contain 1 to 50 items' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_items) AS x(item_id BIGINT, quantity INT, price_cents BIGINT)
    WHERE x.item_id IS NULL OR x.item_id < 1 OR x.quantity IS NULL OR x.quantity NOT BETWEEN 1 AND 20
      OR x.price_cents IS NULL OR x.price_cents NOT BETWEEN 0 AND 100000000
  ) OR (SELECT count(*) FROM jsonb_to_recordset(p_items) AS x(item_id BIGINT)) <>
       (SELECT count(DISTINCT x.item_id) FROM jsonb_to_recordset(p_items) AS x(item_id BIGINT)) THEN
    RAISE EXCEPTION 'Invalid quantities, prices or duplicate items' USING ERRCODE = '22023';
  END IF;

  -- Serialize retries of the same request, so network retries cannot create two orders.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_restaurant_id::TEXT || ':' || p_request_id::TEXT, 0));
  SELECT * INTO v_existing FROM public.customer_order
    WHERE restaurant_id = p_restaurant_id AND request_id = p_request_id;
  IF FOUND THEN
    IF v_existing.request_fingerprint IS DISTINCT FROM p_fingerprint
      OR v_existing.tracking_token_hash IS DISTINCT FROM p_tracking_hash THEN
      RAISE EXCEPTION 'This request was already used for a different order';
    END IF;
    RETURN jsonb_build_object('order_id', v_existing.order_id);
  END IF;

  PERFORM 1 FROM public.restaurant
    WHERE restaurant_id = p_restaurant_id AND is_active = TRUE FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Restaurant is unavailable'; END IF;
  SELECT table_id INTO v_table_id FROM public.restaurant_table
    WHERE restaurant_id = p_restaurant_id AND qr_token = p_qr_token AND is_active = TRUE FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This table QR code is unavailable. Please scan an active table QR.'; END IF;

  -- Keep item/category availability and prices stable until the transaction completes.
  PERFORM m.item_id FROM public.menu_item m
    JOIN public.menu_category c ON c.category_id = m.category_id AND c.restaurant_id = m.restaurant_id
    WHERE m.restaurant_id = p_restaurant_id
      AND m.item_id IN (SELECT x.item_id FROM jsonb_to_recordset(p_items) AS x(item_id BIGINT))
    ORDER BY m.item_id FOR SHARE OF m, c;

  FOR v_line IN SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id BIGINT, quantity INT, price_cents BIGINT)
  LOOP
    SELECT m.price INTO v_price FROM public.menu_item m
      JOIN public.menu_category c ON c.category_id = m.category_id AND c.restaurant_id = m.restaurant_id
      WHERE m.item_id = v_line.item_id AND m.restaurant_id = p_restaurant_id
        AND m.is_active = TRUE AND m.is_available = TRUE AND c.is_active = TRUE;
    IF NOT FOUND THEN RAISE EXCEPTION 'An item is no longer available. Refresh the menu and review your cart.'; END IF;
    IF (v_price * 100)::BIGINT <> v_line.price_cents THEN
      RAISE EXCEPTION 'A menu price has changed. Refresh the menu and review your cart.';
    END IF;
    v_subtotal := v_subtotal + v_price * v_line.quantity;
  END LOOP;
  -- Matches the existing customer UI's estimated 8% tax. Adjust together with UI if restaurant policy changes.
  v_tax := round(v_subtotal * 0.08, 2);
  INSERT INTO public.customer_order (
    restaurant_id, table_id, order_number, status, total_amount, customer_note,
    request_id, request_fingerprint, tracking_token_hash, subtotal_amount, tax_amount
  ) VALUES (
    p_restaurant_id, v_table_id, 'GG-' || substring(replace(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 24),
    'RECEIVED', v_subtotal + v_tax, nullif(p_note, ''),
    p_request_id, p_fingerprint, p_tracking_hash, v_subtotal, v_tax
  ) RETURNING order_id INTO v_order_id;

  INSERT INTO public.order_item (restaurant_id, order_id, item_id, item_name, quantity, unit_price, status)
    SELECT p_restaurant_id, v_order_id, m.item_id, m.name, x.quantity, m.price, 'RECEIVED'
    FROM jsonb_to_recordset(p_items) AS x(item_id BIGINT, quantity INT)
    JOIN public.menu_item m ON m.item_id = x.item_id AND m.restaurant_id = p_restaurant_id;
  RETURN jsonb_build_object('order_id', v_order_id);
END;
$$;

-- Only the trusted Express server may call the write function; it does not bypass RLS itself.
REVOKE ALL ON FUNCTION public.scander_submit_order(BIGINT, UUID, UUID, TEXT, TEXT, JSONB, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.scander_submit_order(BIGINT, UUID, UUID, TEXT, TEXT, JSONB, TEXT)
  TO service_role;
ALTER TABLE public.customer_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item ENABLE ROW LEVEL SECURITY;
NOTIFY pgrst, 'reload schema';
COMMIT;

-- Verify installation:
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'scander_submit_order';
