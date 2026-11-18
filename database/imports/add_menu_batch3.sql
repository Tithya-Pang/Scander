-- Batch 3 menu items for Gather Grounds (restaurant_id = 1).
-- Run the whole file once in the Supabase SQL Editor.
-- Safe to re-run: it creates the Drinks category only if missing and skips items whose name already exists.
BEGIN;

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.menu_category
      WHERE restaurant_id = 1 AND is_active AND name IN ('Main Meals', 'Snacks')) <> 2 THEN
    RAISE EXCEPTION 'Expected active Main Meals and Snacks categories. Run prepare_menu_categories.sql first.';
  END IF;
END;
$$;

INSERT INTO public.menu_category (restaurant_id, name, display_order, is_active)
SELECT 1, 'Drinks', 7, TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.menu_category WHERE restaurant_id = 1 AND name = 'Drinks');

INSERT INTO public.menu_item (restaurant_id, category_id, name, description, price, image_url, is_available, is_active)
SELECT 1, c.category_id, v.name, v.description, v.price, v.image_url, TRUE, TRUE
FROM (VALUES
  ('Drinks'      , 'Iced Cacao', 'Rich chocolatey cacao with milk over ice', 2.75, '/images/menu/iced-cacao.jpg'),
  ('Drinks'      , 'Lychee Rose Jasmine Tea', 'Iced jasmine tea with lychee and a hint of rose', 2.55, '/images/menu/lychee-rose-jasmine-tea.jpg'),
  ('Drinks'      , 'Chia Cacao Coconut Smoothie (M)', 'Creamy coconut smoothie with cacao, chia and toasted coconut flakes', 3.25, '/images/menu/chia-cacao-coconut-smoothie.jpg'),
  ('Drinks'      , 'Rambutan Pineapple Jasmine Tea', 'Iced jasmine tea with rambutan, pineapple and pandan', 2.55, '/images/menu/rambutan-pineapple-jasmine-tea.jpg'),
  ('Main Meals'  , 'Lot Cha', 'Stir-fried short rice noodles with beef, chives, bean sprouts and a soft egg', 3.80, '/images/menu/lot-cha.jpg'),
  ('Main Meals'  , 'Seafood Noodle Soup', 'Rice noodle soup with prawns, fish, fresh herbs, lime and chilli on the side', 4.50, '/images/menu/seafood-noodle-soup.jpg'),
  ('Drinks'      , 'Witch Gaze', 'Layered charcoal, mango and red fruit drink topped with lychee', 3.55, '/images/menu/witch-gaze.jpg'),
  ('Snacks'      , 'Crispy Shrimp Toast Bites', 'Golden toast topped with shrimp paste and prawns, served with sweet chilli sauce', 4.50, '/images/menu/crispy-shrimp-toast-bites.jpg'),
  ('Snacks'      , 'Loaded Cheesy Fries', 'Fries topped with melted cheese, chilli and crispy bits', 4.00, '/images/menu/loaded-cheesy-fries.jpg'),
  ('Main Meals'  , 'Beef Lasagna', 'Layered pasta with rich beef ragù, parmesan and crispy basil', 6.00, '/images/menu/beef-lasagna.jpg'),
  ('Drinks'      , 'Palm Latte', 'Iced latte sweetened with palm sugar and topped with golden jelly', 3.55, '/images/menu/palm-latte.jpg'),
  ('Drinks'      , 'Mango Passion Glow', 'Blended mango smoothie topped with fresh passion fruit', 3.55, '/images/menu/mango-passion-glow.jpg')
) AS v(category, name, description, price, image_url)
JOIN public.menu_category c ON c.restaurant_id = 1 AND c.name = v.category
WHERE NOT EXISTS (SELECT 1 FROM public.menu_item m WHERE m.restaurant_id = 1 AND m.name = v.name);

COMMIT;

-- Check the result: should list 12 rows.
SELECT m.item_id, c.name AS category, m.name, m.price
FROM public.menu_item m JOIN public.menu_category c ON c.category_id = m.category_id
WHERE m.restaurant_id = 1 AND m.image_url IN (
  '/images/menu/iced-cacao.jpg',
  '/images/menu/lychee-rose-jasmine-tea.jpg',
  '/images/menu/chia-cacao-coconut-smoothie.jpg',
  '/images/menu/rambutan-pineapple-jasmine-tea.jpg',
  '/images/menu/lot-cha.jpg',
  '/images/menu/seafood-noodle-soup.jpg',
  '/images/menu/witch-gaze.jpg',
  '/images/menu/crispy-shrimp-toast-bites.jpg',
  '/images/menu/loaded-cheesy-fries.jpg',
  '/images/menu/beef-lasagna.jpg',
  '/images/menu/palm-latte.jpg',
  '/images/menu/mango-passion-glow.jpg')
ORDER BY c.display_order, m.name;
