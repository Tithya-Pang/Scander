-- Scander: record how each customer order is paid.
-- Run this entire file once in the Supabase SQL Editor, after customer-order-setup.sql.
-- Safe to re-run. Existing orders are kept and default to "pay at counter" / unpaid.
--
-- DEMO card payments: no card is charged. Only the card brand and the last 4 digits
-- are stored; full card numbers, expiry dates and CVCs never reach the server.
BEGIN;

ALTER TABLE public.customer_order
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'COUNTER',
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN IF NOT EXISTS card_brand VARCHAR(20),
  ADD COLUMN IF NOT EXISTS card_last4 CHAR(4),
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_order_payment_method_check') THEN
    ALTER TABLE public.customer_order ADD CONSTRAINT customer_order_payment_method_check
      CHECK (payment_method IN ('COUNTER', 'CARD'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_order_payment_status_check') THEN
    ALTER TABLE public.customer_order ADD CONSTRAINT customer_order_payment_status_check
      CHECK (payment_status IN ('UNPAID', 'PAID', 'REFUNDED'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_order_card_last4_check') THEN
    ALTER TABLE public.customer_order ADD CONSTRAINT customer_order_card_last4_check
      CHECK (card_last4 IS NULL OR card_last4 ~ '^[0-9]{4}$');
  END IF;
END;
$$;

COMMIT;

-- Make the Supabase API see the new columns immediately.
NOTIFY pgrst, 'reload schema';

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customer_order'
  AND column_name IN ('payment_method', 'payment_status', 'card_brand', 'card_last4', 'paid_at')
ORDER BY column_name;
