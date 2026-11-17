-- Run this in the Scander Supabase SQL Editor BEFORE importing menu_items.csv.
-- Category IDs 7–12 were unused when this export was generated.
-- This script stops if those IDs or category names now conflict; it never overwrites existing categories.
BEGIN;
LOCK TABLE public.menu_category IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.restaurant WHERE restaurant_id = 1 AND is_active) THEN
    RAISE EXCEPTION 'Active restaurant 1 is missing. Check restaurant IDs before importing.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM (VALUES (7,'Coffee'), (8,'Tea'), (9,'Breakfast'),
      (10,'Main Meals'), (11,'Snacks'), (12,'Desserts')) AS expected(id,name)
    JOIN public.menu_category actual ON actual.category_id = expected.id
    WHERE actual.restaurant_id <> 1 OR actual.name <> expected.name OR NOT actual.is_active
  ) OR EXISTS (
    SELECT 1 FROM (VALUES (7,'Coffee'), (8,'Tea'), (9,'Breakfast'),
      (10,'Main Meals'), (11,'Snacks'), (12,'Desserts')) AS expected(id,name)
    JOIN public.menu_category actual ON actual.restaurant_id = 1 AND actual.name = expected.name
    WHERE actual.category_id <> expected.id
  ) THEN
    RAISE EXCEPTION 'Categories changed since CSV export. Regenerate category mapping before importing; no data was changed.';
  END IF;
END;
$$;

INSERT INTO public.menu_category (category_id, restaurant_id, name, display_order, is_active)
OVERRIDING SYSTEM VALUE
VALUES
  (7,1,'Coffee',1,TRUE), (8,1,'Tea',2,TRUE), (9,1,'Breakfast',3,TRUE),
  (10,1,'Main Meals',4,TRUE), (11,1,'Snacks',5,TRUE), (12,1,'Desserts',6,TRUE)
ON CONFLICT (category_id) DO NOTHING;

-- Explicit category IDs must also advance the identity sequence so future admin inserts remain safe.
SELECT setval(pg_get_serial_sequence('public.menu_category','category_id'),
  GREATEST(MAX(category_id), nextval(pg_get_serial_sequence('public.menu_category','category_id'))), TRUE)
FROM public.menu_category;
COMMIT;

SELECT category_id, name, is_active FROM public.menu_category
WHERE restaurant_id = 1 AND category_id BETWEEN 7 AND 12 ORDER BY category_id;
