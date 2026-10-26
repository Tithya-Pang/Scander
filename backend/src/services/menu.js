import supabase from "../config/supabase.js";

// Public menu reads use the publishable client and the database's RLS policies.
export async function getRestaurantMenu(restaurantId) {
  const restaurantResult = await supabase
    .from("restaurant")
    .select("restaurant_id, name")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .maybeSingle();

  if (restaurantResult.error) throw restaurantResult.error;
  if (!restaurantResult.data) return null;

  const [categoryResult, itemResult] = await Promise.all([
    supabase.from("menu_category")
      .select("category_id, name, display_order")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("display_order")
      .order("category_id"),
    supabase.from("menu_item")
      .select("item_id, category_id, name, description, price, image_url")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .eq("is_available", true)
      .order("item_id"),
  ]);

  if (categoryResult.error) throw categoryResult.error;
  if (itemResult.error) throw itemResult.error;

  const categories = categoryResult.data || [];
  const categoryNames = new Map(categories.map(category => [category.category_id, category.name]));
  return {
    restaurant: { id: restaurantResult.data.restaurant_id, name: restaurantResult.data.name },
    categories: categories.map(category => ({ id: category.category_id, name: category.name })),
    items: (itemResult.data || [])
      .filter(item => categoryNames.has(item.category_id))
      .map(item => ({
        id: item.item_id,
        categoryId: item.category_id,
        category: categoryNames.get(item.category_id),
        name: item.name,
        description: item.description || "",
        price: Number(item.price),
        image: item.image_url,
      })),
  };
}
