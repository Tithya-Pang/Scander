
import express from 'express';

import {
  authenticate,
  authorize,
} from '../middleware/auth.js';

import {
  getMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  getAllMenuItems,
  getSingleMenuItem,
  addMenuItem,
  editMenuItem,
  updateMenuItemAvailability,
  removeMenuItem,
} from '../controllers/menu.js';

import { uploadMenuImage } from '../controllers/menuImage.js';

import {
  receiveMenuImage,
} from '../middleware/menuImageUpload.js';

const router = express.Router();

// All routes require staff authentication.
router.use(authenticate);

// ==========================================
// CATEGORY ROUTES
// ==========================================

router.get(
  '/categories',
  authorize('ADMIN', 'KITCHEN_STAFF'),
  getMenuCategories
);

router.post(
  '/categories',
  authorize('ADMIN'),
  createMenuCategory
);

router.patch(
  '/categories/:id',
  authorize('ADMIN'),
  updateMenuCategory
);

router.delete(
  '/categories/:id',
  authorize('ADMIN'),
  deleteMenuCategory
);

// ==========================================
// IMAGE UPLOAD
// ==========================================

// POST /menu/images
// Only ADMIN can upload menu pictures.
router.post(
  '/images',
  authorize('ADMIN'),
  receiveMenuImage,
  uploadMenuImage
);

// ==========================================
// MENU ITEM ROUTES
// ==========================================

router.get(
  '/items',
  authorize('ADMIN', 'KITCHEN_STAFF'),
  getAllMenuItems
);

router.get(
  '/items/:id',
  authorize('ADMIN', 'KITCHEN_STAFF'),
  getSingleMenuItem
);

router.post(
  '/items',
  authorize('ADMIN'),
  addMenuItem
);

router.patch(
  '/items/:id',
  authorize('ADMIN'),
  editMenuItem
);

router.patch(
  '/items/:id/availability',
  authorize('ADMIN'),
  updateMenuItemAvailability
);

router.delete(
  '/items/:id',
  authorize('ADMIN'),
  removeMenuItem
);

export default router;

