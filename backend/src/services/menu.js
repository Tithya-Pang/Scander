
import { adminSupabase } from "../config/supabase.js";

// ==========================================
// MENU CATEGORY SERVICE
// ==========================================

// 1. Get active categories for a restaurant
export const getCategories = async (restaurantId) => {
  const { data, error } = await adminSupabase
    .from("menu_category")
    .select(
      "category_id, restaurant_id, name, description, display_order, is_active"
    )
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("category_id", { ascending: true });

  if (error) throw error;

  return data ?? [];
};

// 2. Create a new category
export const createCategory = async (restaurantId, input) => {
  const name = input.name.trim();

  // Check whether an active category already exists.
  const { data: existing, error: lookupError } = await adminSupabase
    .from("menu_category")
    .select("category_id")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .ilike("name", name)
    .limit(1);

  if (lookupError) throw lookupError;

  if (existing.length > 0) {
    const error = new Error("Category name already exists");
    error.status = 409;
    throw error;
  }

  const { data, error } = await adminSupabase
    .from("menu_category")
    .insert({
      restaurant_id: restaurantId,
      name,
      description: input.description?.trim() || null,
      display_order: input.display_order ?? 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

// 3. Update an existing category
export const updateCategory = async (
  restaurantId,
  categoryId,
  input
) => {
  const updates = {};

  if (input.name !== undefined) {
    updates.name = input.name.trim();

    const { data: duplicates, error: duplicateError } =
      await adminSupabase
        .from("menu_category")
        .select("category_id")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .ilike("name", updates.name)
        .neq("category_id", categoryId)
        .limit(1);

    if (duplicateError) throw duplicateError;

    if (duplicates.length > 0) {
      const error = new Error("Category name already exists");
      error.status = 409;
      throw error;
    }
  }

  if (input.description !== undefined) {
    updates.description = input.description?.trim() || null;
  }

  if (input.display_order !== undefined) {
    updates.display_order = input.display_order;
  }

  const { data, error } = await adminSupabase
    .from("menu_category")
    .update(updates)
    .eq("restaurant_id", restaurantId)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .select()
    .maybeSingle();

  if (error) throw error;

  return data;
};

// 4. Soft-delete a category
export const deleteCategory = async (
  restaurantId,
  categoryId
) => {
  // Don't deactivate a category with active menu items.
  const { data: items, error: itemsError } = await adminSupabase
    .from("menu_item")
    .select("item_id")
    .eq("restaurant_id", restaurantId)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .limit(1);

  if (itemsError) throw itemsError;

  if (items.length > 0) {
    const error = new Error(
      "This category contains menu items. Remove or move them first."
    );
    error.status = 409;
    throw error;
  }

  const { data, error } = await adminSupabase
    .from("menu_category")
    .update({ is_active: false })
    .eq("restaurant_id", restaurantId)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .select("category_id")
    .maybeSingle();

  if (error) throw error;

  return data;
};


/*
==========================================
MENU ITEM SERVICE
Add below the existing category functions.
==========================================
*/

// Helper: Check that a category belongs to this restaurant
// and is active.
const checkActiveCategory = async (
  restaurantId,
  categoryId
) => {
  const { data, error } = await adminSupabase
    .from("menu_category")
    .select("category_id")
    .eq("restaurant_id", restaurantId)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const err = new Error("Category not found or inactive");
    err.status = 400;
    throw err;
  }
};

// 1. Get all active menu items (including sold-out items)
export const getMenuItems = async (restaurantId) => {
  const { data, error } = await adminSupabase
    .from("menu_item")
    .select(
      "item_id, restaurant_id, category_id, name, description, price, image_url, is_available, is_active, created_at, updated_at"
    )
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("item_id", { ascending: true });

  if (error) throw error;

  return data ?? [];
};

// 2. Get one menu item
export const getMenuItemById = async (
  restaurantId,
  itemId
) => {
  const { data, error } = await adminSupabase
    .from("menu_item")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("item_id", itemId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// 3. Create a menu item
export const createMenuItem = async (
  restaurantId,
  input
) => {
  await checkActiveCategory(
    restaurantId,
    input.category_id
  );

  const { data, error } = await adminSupabase
    .from("menu_item")
    .insert({
      restaurant_id: restaurantId,
      category_id: input.category_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      image_url: input.image_url || null,
      is_available: input.is_available ?? true,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

// 4. Update a menu item
export const updateMenuItem = async (
  restaurantId,
  itemId,
  input
) => {
  // Only allow these fields to be changed.
  const allowedFields = [
    "category_id",
    "name",
    "description",
    "price",
    "image_url",
    "is_available",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (input[field] !== undefined) {
      updates[field] = input[field];
    }
  }

  if (updates.name !== undefined) {
    updates.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    updates.description =
      updates.description?.trim() || null;
  }

  if (updates.category_id !== undefined) {
    await checkActiveCategory(
      restaurantId,
      updates.category_id
    );
  }

  const { data, error } = await adminSupabase
    .from("menu_item")
    .update(updates)
    .eq("restaurant_id", restaurantId)
    .eq("item_id", itemId)
    .eq("is_active", true)
    .select()
    .maybeSingle();

  if (error) throw error;

  return data;
};

// 5. Change item availability
export const changeMenuItemAvailability = async (
  restaurantId,
  itemId,
  isAvailable
) => {
  const { data, error } = await adminSupabase
    .from("menu_item")
    .update({ is_available: isAvailable })
    .eq("restaurant_id", restaurantId)
    .eq("item_id", itemId)
    .eq("is_active", true)
    .select()
    .maybeSingle();

  if (error) throw error;

  return data;
};

// 6. Soft-delete an item
export const deleteMenuItem = async (
  restaurantId,
  itemId
) => {
  const { data, error } = await adminSupabase
    .from("menu_item")
    .update({
      is_active: false,
      is_available: false,
    })
    .eq("restaurant_id", restaurantId)
    .eq("item_id", itemId)
    .eq("is_active", true)
    .select("item_id")
    .maybeSingle();

  if (error) throw error;

  return data;
};
