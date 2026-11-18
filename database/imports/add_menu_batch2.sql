-- Batch 2 menu items for Gather Grounds (restaurant_id = 1).
-- Run the whole file once in the Supabase SQL Editor.
-- Safe to re-run: it creates the Drinks category only if missing and skips items whose name already exists.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.restaurant WHERE restaurant_id = 1 AND is_active) THEN
    RAISE EXCEPTION 'Active restaurant 1 is missing. Check restaurant IDs before importing.';
  END IF;
  IF (SELECT COUNT(*) FROM public.menu_category
      WHERE restaurant_id = 1 AND is_active AND name IN ('Tea', 'Breakfast', 'Main Meals')) <> 3 THEN
    RAISE EXCEPTION 'Expected active Tea, Breakfast and Main Meals categories. Run prepare_menu_categories.sql first.';
  END IF;
END;
$$;

-- New Drinks category, shown after Desserts.
INSERT INTO public.menu_category (restaurant_id, name, display_order, is_active)
SELECT 1, 'Drinks', 7, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.menu_category WHERE restaurant_id = 1 AND name = 'Drinks'
);

INSERT INTO public.menu_item (restaurant_id, category_id, name, description, price, image_url, is_available, is_active)
SELECT 1, c.category_id, v.name, v.description, v.price, v.image_url, TRUE, TRUE
FROM (VALUES
  ('Main Meals', 'Korean Spicy Fried Chicken', 'Fried chicken glazed in sweet and spicy Korean sauce, topped with sesame', 4.25, '/images/menu/korean-spicy-fried-chicken.jpg'),
  ('Main Meals', 'Crispy Chicken Karaage', 'Japanese-style crispy fried chicken with chilli, lime and dipping sauce', 4.25, '/images/menu/crispy-chicken-karaage.jpg'),
  ('Main Meals', 'Crispy Almond-Crusted Prawns', 'Prawns coated in sliced almonds, fried golden and served with sweet chilli sauce', 5.00, '/images/menu/almond-crusted-prawns.jpg'),
  ('Main Meals', 'Hokkien Mee', 'Stir-fried yellow noodles with prawns, squid, egg and lime', 5.20, '/images/menu/hokkien-mee.jpg'),
  ('Breakfast',  'Salmon Avocado Toast', 'Toasted bread with salmon, avocado, pickled onion and a creamy dressing', 6.50, '/images/menu/salmon-avocado-toast.jpg'),
  ('Drinks',     'Strawberry Soda (M)', 'Sparkling strawberry soda over ice with fresh strawberry and mint', 2.85, '/images/menu/strawberry-soda.jpg'),
  ('Tea',        'Peach Orange Black Tea', 'Iced black tea with peach, fresh orange and mint', 2.55, '/images/menu/peach-orange-black-tea.jpg')
) AS v(category, name, description, price, image_url)
JOIN public.menu_category c ON c.restaurant_id = 1 AND c.name = v.category
WHERE NOT EXISTS (
  SELECT 1 FROM public.menu_item m WHERE m.restaurant_id = 1 AND m.name = v.name
);

COMMIT;

-- Check the result.
SELECT m.item_id, c.name AS category, m.name, m.price
FROM public.menu_item m JOIN public.menu_category c ON c.category_id = m.category_id
WHERE m.restaurant_id = 1 AND m.image_url IN (
  '/images/menu/korean-spicy-fried-chicken.jpg', '/images/menu/crispy-chicken-karaage.jpg',
  '/images/menu/almond-crusted-prawns.jpg', '/images/menu/hokkien-mee.jpg',
  '/images/menu/salmon-avocado-toast.jpg', '/images/menu/strawberry-soda.jpg',
  '/images/menu/peach-orange-black-tea.jpg')
ORDER BY c.display_order, m.name;
