import express from "express";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

import {
  // Table Management
  getAllTables,
  getTableById,
  addTable,
  editTable,
  changeTableActiveStatus,

  // Order Management
  getAllAdminOrders,
  getAdminOrderDetails,

  // Dashboard Statistics
  getAdminDashboardStats,
  getAdminDashboardAnalytics,
  getAdminPopularDishes,
} from "../controllers/admin.js";

const router = express.Router();

// ==========================================
// ADMIN ROUTES
// ==========================================

// All routes require a valid staff login.
router.use(authenticate);

// Only Admin can access these routes.
router.use(authorize("ADMIN"));

// ==========================================
// TABLE MANAGEMENT
// ==========================================

// 1. Get all restaurant tables
// GET /admin/tables
router.get("/tables", getAllTables);

// 2. Get a specific table
// GET /admin/tables/:id
router.get("/tables/:id", getTableById);

// 3. Create a new table
// POST /admin/tables
router.post("/tables", addTable);

// 4. Update a table number
// PATCH /admin/tables/:id
router.patch("/tables/:id", editTable);

// 5. Activate or deactivate a table
// PATCH /admin/tables/:id/active
router.patch(
  "/tables/:id/active",
  changeTableActiveStatus
);

// ==========================================
// ADMIN ORDER MANAGEMENT
// ==========================================

// Get all orders, with optional status filters
router.get("/orders", getAllAdminOrders);

// Get one order with its items
router.get("/orders/:id", getAdminOrderDetails);

router.get("/dashboard/stats", getAdminDashboardStats);

router.get("/dashboard/analytics", getAdminDashboardAnalytics);

router.get("/dashboard/popular-dishes", getAdminPopularDishes);

export default router;
