import { getMenu } from "../controllers/menu.js";

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

// ===================================