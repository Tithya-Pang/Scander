# Import the VS Code menu into Supabase

`menu_items.csv` contains all 20 items in `frontend/src/data/menu.js`, with their current names, descriptions, prices and image paths. It targets Gather Grounds (`restaurant_id = 1`). Existing Supabase menu records are not modified by these files.

## Import order

1. In the correct Scander project's Supabase SQL Editor, run the complete contents of `prepare_menu_categories.sql`.
2. Confirm it returns six active categories (IDs 7–12). The script preserves existing categories and stops on ID/name conflicts.
3. Open Table Editor → `menu_item` → Insert → Import data from CSV, and choose `menu_items.csv`.
4. Review the 20 rows, then import. Do not map the local frontend item IDs to `item_id`; that column and the timestamp columns are intentionally omitted so the database generates them.
5. Refresh the customer menu. It loads available database items through the Express API.

Import this CSV once. Importing again adds duplicate rows because the table does not have a unique constraint on menu names.

## Categories

| category_id | name | items |
|---|---|---|
| 7 | Coffee | 3 |
| 8 | Tea | 3 |
| 9 | Breakfast | 1 |
| 10 | Main Meals | 10 |
| 11 | Snacks | 2 |
| 12 | Desserts | 1 |

Existing inactive `Iced Matcha Latte` (item ID 8, $4.00) remains untouched; the CSV adds a new active version at the local catalog price of $2.95. Existing kitchen test items are also preserved and may remain visible until their owner deactivates them.

## Photos

`image_url` values are frontend-relative paths such as `/images/menu/iced-latte.jpg`. All 20 image files exist in `frontend/public/images/menu`. These work when the customer frontend serves those assets; importing CSV does not upload them to Supabase Storage. For independent image hosting, upload them to Storage separately and replace these paths with their public image URLs.

The CSV was parsed back after generation to check row count, field names, unique catalog names and category references. No database import or category changes were executed as part of generating these files.
