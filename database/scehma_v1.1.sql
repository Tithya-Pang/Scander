-- ==========================================
-- SCANDER DATABASE SCHEMA — V1.1
-- Gather Grounds QR Self-Ordering System
-- Supabase PostgreSQL | Initial installation
-- ==========================================
-- Run ONCE on a new project in Supabase SQL Editor.
-- Supabase Auth manages auth.users; do not create it here.
-- No payment tables in V1.

BEGIN;

-- 1. Restaurant
CREATE TABLE public.restaurant (
  restaurant_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(30),
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Staff profile (one-to-one with Supabase Auth)
CREATE TABLE public.staff (
  staff_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurant(restaurant_id),
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'KITCHEN_STAFF')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Dining tables / QR codes
CREATE TABLE public.restaurant_table (
  table_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurant(restaurant_id),
  table_number VARCHAR(20) NOT NULL,
  qr_token UUID NOT NULL DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, table_number),
  UNIQUE (qr_token),
  UNIQUE (table_id, restaurant_id)
);

-- 4. Menu categories
CREATE TABLE public.menu_category (
  category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurant(restaurant_id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, restaurant_id)
);

-- 5. Menu items
CREATE TABLE public.menu_item (
  item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurant(restaurant_id),
  category_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_id, restaurant_id),
  FOREIGN KEY (category_id, restaurant_id)
    REFERENCES public.menu_category(category_id, restaurant_id)
);

-- 6. Customer orders
CREATE TABLE public.customer_order (
  order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurant(restaurant_id),
  table_id BIGINT NOT NULL,
  order_number VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED'
    CHECK (status IN ('RECEIVED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED')),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  customer_note TEXT,
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, order_number),
  UNIQUE (order_id, restaurant_id),
  FOREIGN KEY (table_id, restaurant_id)
    REFERENCES public.restaurant_table(table_id, restaurant_id)
);

-- 7. Each dish within an order
CREATE TABLE public.order_item (
  order_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id BIGINT NOT NULL,
  order_id BIGINT NOT NULL,
  item_id BIGINT NOT NULL,
  item_name VARCHAR(150) NOT NULL, -- snapshot of name at ordering time
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  special_instruction TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED'
    CHECK (status IN ('RECEIVED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED')),
  preparing_at TIMESTAMPTZ, -- when preparation STARTS
  ready_at TIMESTAMPTZ,     -- when dish is ready
  served_at TIMESTAMPTZ,    -- when dish is served
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (order_id, restaurant_id)
    REFERENCES public.customer_order(order_id, restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id, restaurant_id)
    REFERENCES public.menu_item(item_id, restaurant_id)
);

-- Indexes
CREATE INDEX idx_staff_restaurant ON public.staff(restaurant_id);
CREATE INDEX idx_menu_category_restaurant ON public.menu_category(restaurant_id);
CREATE INDEX idx_menu_item_category ON public.menu_item(category_id);
CREATE INDEX idx_menu_item_restaurant ON public.menu_item(restaurant_id);
CREATE INDEX idx_order_restaurant_status ON public.customer_order(restaurant_id, status);
CREATE INDEX idx_order_table ON public.customer_order(table_id);
CREATE INDEX idx_order_date ON public.customer_order(ordered_at DESC);
CREATE INDEX idx_order_item_order ON public.order_item(order_id);
CREATE INDEX idx_order_item_status ON public.order_item(status);

-- Automatically refresh updated_at on modifications
CREATE FUNCTION public.scander_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER restaurant_updated_at BEFORE UPDATE ON public.restaurant
FOR EACH ROW EXECUTE FUNCTION public.scander_set_updated_at();
CREATE TRIGGER staff_updated_at BEFORE UPDATE ON public.staff
FOR EACH ROW EXECUTE FUNCTION public.scander_set_updated_at();
CREATE TRIGGER restaurant_table_updated_at BEFORE UPDATE ON public.restaurant_table
FOR EACH ROW EXECUTE FUNCTION public.scander_set_updated_at();
CREATE TRIGGER menu_category_updated_at BEFORE UPDATE ON public.menu_category
FOR EACH ROW EXECUTE FUNCTION public.scander_set_updated_at();
CREATE TRIGGER menu_item_updated_at BEFORE UPDATE ON public.menu_item
FOR EACH ROW EXECUTE FUNCTION public.scander_set_updated_at();
CREATE TRIGGER customer_order_updated_at BEFORE UPDATE ON public.customer_order
FOR EACH ROW EXECUTE FUNCTION public.scander_set_updated_at();
CREATE TRIGGER order_item_updated_at BEFORE UPDATE ON public.order_item
FOR EACH ROW EXECUTE FUNCTION public.scander_set_updated_at();

-- Enable Row Level Security on ALL application tables.
ALTER TABLE public.restaurant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item ENABLE ROW LEVEL SECURITY;

-- Explicitly restrict Data API grants. All private operations go through
-- Express, where JWT, staff role and QR session must be validated first.
REVOKE ALL ON TABLE
  public.restaurant, public.staff, public.restaurant_table,
  public.menu_category, public.menu_item, public.customer_order,
  public.order_item
FROM anon, authenticated;

GRANT SELECT ON public.restaurant, public.menu_category, public.menu_item
TO anon, authenticated;
GRANT SELECT ON public.staff TO authenticated;

-- Public read-only menu policies
CREATE POLICY read_active_restaurant ON public.restaurant
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);

CREATE POLICY read_active_categories ON public.menu_category
  FOR SELECT TO anon, authenticated USING (
    is_active = TRUE AND EXISTS (
      SELECT 1 FROM public.restaurant r
      WHERE r.restaurant_id = menu_category.restaurant_id AND r.is_active = TRUE
    )
  );

CREATE POLICY read_available_items ON public.menu_item
  FOR SELECT TO anon, authenticated USING (
    is_active = TRUE AND is_available = TRUE
    AND EXISTS (
      SELECT 1 FROM public.restaurant r
      WHERE r.restaurant_id = menu_item.restaurant_id AND r.is_active = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM public.menu_category c
      WHERE c.category_id = menu_item.category_id AND c.is_active = TRUE
    )
  );

-- An authenticated staff member may read only their own profile.
CREATE POLICY staff_read_own_profile ON public.staff
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = staff_id);

-- Seed Gather Grounds; safe for a fresh install.
INSERT INTO public.restaurant (name, address)
VALUES ('Gather Grounds', 'Phnom Penh');

COMMIT;

-- Verify after installation:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
-- ORDER BY table_name;