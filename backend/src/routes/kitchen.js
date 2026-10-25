import express from "express";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

import {
  getKitchenOrders,
  getKitchenOrderById,
  updateKitchenOrderStatus,
  updateKitchenItemStatus,
  getKitchenHistory,
} from "../controllers/kitchen.js";

const router = express.Router();

// Authentication and role authorization
router.use(authenticate);
router.use(authorize("KITCHEN_STAFF", "ADMIN"));

// Get all active kitchen orders
router.get("/orders", getKitchenOrders);

// Get kitchen order history
router.get("/history", getKitchenHistory);

// Get a specific order
router.get("/orders/:id", getKitchenOrderById);

// Update entire order status
router.patch("/orders/:id/status", updateKitchenOrderStatus);

// Update individual dish status
router.patch("/items/:id/status", updateKitchenItemStatus);

export default router;
