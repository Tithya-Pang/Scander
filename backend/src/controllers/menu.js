
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  changeMenuItemAvailability,
  deleteMenuItem,
} from "../services/menu.js";

// ==========================================
// HELPERS
// ==========================================

// Validate positive integer IDs.
const parseId = (value) => {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
};

// Get the restaurant from authenticated staff.
// Never trust restaurant_id supplied by the frontend.
const getRestaurantId = (req) => {
  return parseId(req.user?.restaurant_id);
};

// Validate category input for create and update.
const validateCategory = (body, isUpdate = false) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Invalid request body";
  }

  if (!isUpdate || body.name !== undefined) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.trim().length > 100
    ) {
      return "Category name must contain 1 to 100 characters";
    }
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    return "Description must be a string";
  }

  if (
    body.display_order !== undefined &&
    (!Number.isSafeInteger(body.display_order) ||
      body.display_order < 0)
  ) {
    return "Display order must be a non-negative integer";
  }

  if (
    isUpdate &&
    !["name", "description", "display_order"].some(
      (field) => body[field] !== undefined
    )
  ) {
    return "At least one field is required";
  }

  return null;
};

// Respond consistently to database errors.
const handleError = (res, error) => {
  console.error("Menu Category API Error:", error);

  if (error.status === 409 || error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Category already exists or conflicts with an existing record",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Category operation failed",
  });
};

// ==========================================
// 1. GET ALL CATEGORIES
// GET /menu/categories
// ==========================================

export const getMenuCategories = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  try {
    const categories = await getCategories(restaurantId);

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ==========================================
// 2. CREATE CATEGORY
// POST /menu/categories
// ==========================================

export const createMenuCategory = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  const validationError = validateCategory(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  try {
    const category = await createCategory(
      restaurantId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ==========================================
// 3. UPDATE CATEGORY
// PATCH /menu/categories/:id
// ==========================================

export const updateMenuCategory = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const categoryId = parseId(req.params.id);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  if (!categoryId) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  const validationError = validateCategory(req.body, true);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  try {
    const category = await updateCategory(
      restaurantId,
      categoryId,
      req.body
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ==========================================
// 4. DELETE CATEGORY (SOFT DELETE)
// DELETE /menu/categories/:id
// ==========================================

export const deleteMenuCategory = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const categoryId = parseId(req.params.id);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  if (!categoryId) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  try {
    const deletedCategory = await deleteCategory(
      restaurantId,
      categoryId
    );

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return handleError(res, error);
  }
};


/*
==========================================
MENU ITEM CONTROLLER
==========================================
*/

// Validate menu item information before saving.
const validateMenuItem = (body, isUpdate = false) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Invalid request body";
  }

  const allowedFields = [
    "category_id",
    "name",
    "description",
    "price",
    "image_url",
    "is_available",
  ];

  // Prevent unexpected fields from being submitted.
  for (const field of Object.keys(body)) {
    if (!allowedFields.includes(field)) {
      return `Unknown field: ${field}`;
    }
  }

  if (isUpdate && Object.keys(body).length === 0) {
    return "At least one field is required";
  }

  // Category ID must be a positive integer.
  if (!isUpdate || body.category_id !== undefined) {
    if (!parseId(body.category_id)) {
      return "Valid category ID is required";
    }
  }

  // Name must be a non-empty string.
  if (!isUpdate || body.name !== undefined) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.trim().length > 150
    ) {
      return "Item name must contain 1 to 150 characters";
    }
  }

  // Price must be a valid number.
  if (!isUpdate || body.price !== undefined) {
    if (
      typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price < 0 ||
      body.price > 99999999.99 ||
      Math.round(body.price * 100) !== body.price * 100
    ) {
      return "Price must be a valid non-negative amount with up to 2 decimal places";
    }
  }

  // Optional description.
  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    return "Description must be a string or null";
  }

  // Optional image URL.
  if (body.image_url !== undefined && body.image_url !== null) {
    if (
      typeof body.image_url !== "string" ||
      body.image_url.length > 2000
    ) {
      return "Image URL must be a valid string or null";
    }

    try {
      const url = new URL(body.image_url);

      if (!["http:", "https:"].includes(url.protocol)) {
        return "Image URL must use HTTP or HTTPS";
      }
    } catch {
      return "Invalid image URL";
    }
  }

  // Availability must be a boolean.
  if (
    body.is_available !== undefined &&
    typeof body.is_available !== "boolean"
  ) {
    return "Availability must be true or false";
  }

  return null;
};

// Handle errors without exposing internal database details.
const handleMenuItemError = (res, error) => {
  console.error("Menu Item API Error:", error);

  if (error.status === 400) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === "23503") {
    return res.status(400).json({
      success: false,
      message: "Invalid category reference",
    });
  }

  if (error.code === "23514" || error.code === "23502") {
    return res.status(400).json({
      success: false,
      message: "Invalid menu item data",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Menu item operation failed",
  });
};

// ==========================================
// 1. GET ALL MENU ITEMS
// GET /menu/items
// ==========================================

export const getAllMenuItems = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  try {
    const items = await getMenuItems(restaurantId);

    return res.status(200).json({
      success: true,
      message: "Menu items retrieved successfully",
      data: items,
    });
  } catch (error) {
    return handleMenuItemError(res, error);
  }
};

// ==========================================
// 2. GET ONE MENU ITEM
// GET /menu/items/:id
// ==========================================

export const getSingleMenuItem = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const itemId = parseId(req.params.id);

  if (!restaurantId || !itemId) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant or item ID",
    });
  }

  try {
    const item = await getMenuItemById(
      restaurantId,
      itemId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu item retrieved successfully",
      data: item,
    });
  } catch (error) {
    return handleMenuItemError(res, error);
  }
};

// ==========================================
// 3. CREATE MENU ITEM
// POST /menu/items
// ==========================================

export const addMenuItem = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  const validationError = validateMenuItem(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  try {
    const item = await createMenuItem(
      restaurantId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: item,
    });
  } catch (error) {
    return handleMenuItemError(res, error);
  }
};

// ==========================================
// 4. UPDATE MENU ITEM
// PATCH /menu/items/:id
// ==========================================

export const editMenuItem = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const itemId = parseId(req.params.id);

  if (!restaurantId || !itemId) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant or item ID",
    });
  }

  const validationError = validateMenuItem(req.body, true);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  try {
    const item = await updateMenuItem(
      restaurantId,
      itemId,
      req.body
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: item,
    });
  } catch (error) {
    return handleMenuItemError(res, error);
  }
};

// ==========================================
// 5. UPDATE MENU ITEM AVAILABILITY
// PATCH /menu/items/:id/availability
// ==========================================

export const updateMenuItemAvailability = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const itemId = parseId(req.params.id);

  if (!restaurantId || !itemId) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant or item ID",
    });
  }

  if (typeof req.body?.is_available !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "is_available must be true or false",
    });
  }

  try {
    const item = await changeMenuItemAvailability(
      restaurantId,
      itemId,
      req.body.is_available
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item availability updated successfully",
      data: item,
    });
  } catch (error) {
    return handleMenuItemError(res, error);
  }
};

// ==========================================
// 6. SOFT DELETE MENU ITEM
// DELETE /menu/items/:id
// ==========================================

export const removeMenuItem = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const itemId = parseId(req.params.id);

  if (!restaurantId || !itemId) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant or item ID",
    });
  }

  try {
    const deletedItem = await deleteMenuItem(
      restaurantId,
      itemId
    );

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    return handleMenuItemError(res, error);
  }
};
