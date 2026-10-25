
import express from "express";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

import {
  // Category controllers
  getMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,

  // Menu Item controllers
  getAllMenuItems,
  getSingleMenuItem,
  addMenuItem,
  editMenuItem,
  updateMenuItemAvailability,
  removeMenuItem,
} from "../controllers/menu.js";

const router = express.Router();

// ==========================================
// MENU CATEGORY ROUTES
// ==========================================

// All category routes currently require staff login.
// Customer-facing public menu routes will be added separately.
router.use(authenticate);

// 1. Get categories
// GET /menu/categories
// ADMIN and KITCHEN_STAFF can view categories.
router.get(
  "/categories",
  authorize("ADMIN", "KITCHEN_STAFF"),
  getMenuCategories
);

// All remaining category operations require ADMIN.

// 2. Create a category
// POST /menu/categories
router.post(
  "/categories",
  authorize("ADMIN"),
  createMenuCategory
);

// 3. Update a category
// PATCH /menu/categories/:id
router.patch(
  "/categories/:id",
  authorize("ADMIN"),
  updateMenuCategory
);

// 4. Soft-delete a category
// DELETE /menu/categories/:id
router.delete(
  "/categories/:id",
  authorize("ADMIN"),
  deleteMenuCategory
);


/*
==========================================
MENU ITEM ROUTES
==========================================
*/

// 1. Get all menu items
// GET /menu/items
router.get(
  "/items",
  authorize("ADMIN", "KITCHEN_STAFF"),
  getAllMenuItems
);

// 2. Get a single menu item
// GET /menu/items/:id
router.get(
  "/items/:id",
  authorize("ADMIN", "KITCHEN_STAFF"),
  getSingleMenuItem
);

// 3. Create a menu item
// POST /menu/items
router.post(
  "/items",
  authorize("ADMIN"),
  addMenuItem
);

// 4. Update a menu item
// PATCH /menu/items/:id
router.patch(
  "/items/:id",
  authorize("ADMIN"),
  editMenuItem
);

// 5. Update availability (Available / Sold Out)
// PATCH /menu/items/:id/availability
router.patch(
  "/items/:id/availability",
  authorize("ADMIN"),
  updateMenuItemAvailability
);

// 6. Soft-delete a menu item
// DELETE /menu/items/:id
router.delete(
  "/items/:id",
  authorize("ADMIN"),
  removeMenuItem
);


export default router;
