import {
  // Table Management
  getRestaurantTables,
  getRestaurantTableById,
  createRestaurantTable,
  updateRestaurantTable,
  setRestaurantTableActive,

  // Order Management
  getAdminOrders,
  getAdminOrderById,

  // Dashboard Statistics
  getDashboardStatistics,
  getDashboardAnalytics,
  getPopularDishes,
} from "../services/admin.js";

// ==========================================
// SHARED HELPERS
// ==========================================

// Check whether an ID is a positive integer.
const parseId = (value) => {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
};

// Get restaurant ID from the authenticated Admin.
const getRestaurantId = (req) => {
  return parseId(req.user?.restaurant_id);
};

// Validate a table number.
const validateTableNumber = (body) => {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    typeof body.table_number !== "string"
  ) {
    return "Table number is required";
  }

  const tableNumber = body.table_number.trim();

  if (!tableNumber || tableNumber.length > 20) {
    return "Table number must contain 1 to 20 characters";
  }

  return null;
};

// Handle database errors.
const handleError = (res, error) => {
  console.error("Admin Table API Error:", error);

  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Table number already exists",
    });
  }

  if (error.status === 409) {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Table operation failed",
  });
};

// ==========================================
// 1. GET ALL TABLES
// GET /admin/tables
// ==========================================

export const getAllTables = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  try {
    const tables = await getRestaurantTables(restaurantId);

    return res.status(200).json({
      success: true,
      message: "Tables retrieved successfully",
      data: tables,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ==========================================
// 2. GET ONE TABLE
// GET /admin/tables/:id
// ==========================================

export const getTableById = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const tableId = parseId(req.params.id);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  if (!tableId) {
    return res.status(400).json({
      success: false,
      message: "Invalid table ID",
    });
  }

  try {
    const table = await getRestaurantTableById(
      restaurantId,
      tableId
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Table retrieved successfully",
      data: table,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ==========================================
// 3. CREATE TABLE
// POST /admin/tables
// ==========================================

export const addTable = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  const validationError = validateTableNumber(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  try {
    const table = await createRestaurantTable(
      restaurantId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: table,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ==========================================
// 4. UPDATE TABLE NUMBER
// PATCH /admin/tables/:id
// ==========================================

export const editTable = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const tableId = parseId(req.params.id);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  if (!tableId) {
    return res.status(400).json({
      success: false,
      message: "Invalid table ID",
    });
  }

  const validationError = validateTableNumber(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  try {
    const table = await updateRestaurantTable(
      restaurantId,
      tableId,
      req.body
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: table,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ==========================================
// 5. ACTIVATE / DEACTIVATE TABLE
// PATCH /admin/tables/:id/active
// ==========================================

export const changeTableActiveStatus = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const tableId = parseId(req.params.id);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  if (!tableId) {
    return res.status(400).json({
      success: false,
      message: "Invalid table ID",
    });
  }

  if (
    !req.body ||
    typeof req.body.is_active !== "boolean"
  ) {
    return res.status(400).json({
      success: false,
      message: "is_active must be true or false",
    });
  }

  try {
    const table = await setRestaurantTableActive(
      restaurantId,
      tableId,
      req.body.is_active
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Table status updated successfully",
      data: table,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


/*
==========================================
ADMIN ORDER MANAGEMENT CONTROLLER
==========================================
*/

const ORDER_STATUSES = [
  "RECEIVED",
  "PREPARING",
  "READY",
  "SERVED",
  "CANCELLED",
];

// ==========================================
// 1. GET ALL ORDERS
// GET /admin/orders
// ==========================================

export const getAllAdminOrders = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  const status = req.query.status;
  const page = req.query.page === undefined
    ? 1
    : parseId(req.query.page);
  const limit = req.query.limit === undefined
    ? 20
    : parseId(req.query.limit);

  // Validate status filter.
  if (
    status !== undefined &&
    (typeof status !== "string" ||
      !ORDER_STATUSES.includes(status))
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  // Validate pagination.
  if (!page || !limit || limit > 100) {
    return res.status(400).json({
      success: false,
      message: "Invalid pagination parameters",
    });
  }

  try {
    const result = await getAdminOrders(
      restaurantId,
      { status, page, limit }
    );

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// ==========================================
// 2. GET ONE ORDER WITH ITEMS
// GET /admin/orders/:id
// ==========================================

export const getAdminOrderDetails = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const orderId = parseId(req.params.id);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID",
    });
  }

  try {
    const order = await getAdminOrderById(
      restaurantId,
      orderId
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


/*
==========================================
ADMIN DASHBOARD STATISTICS CONTROLLER
==========================================
*/

// GET /admin/dashboard/stats

export const getAdminDashboardStats = async (req, res) => {
  // Use the restaurant assigned to the logged-in Admin.
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  try {
    const statistics = await getDashboardStatistics(
      restaurantId
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


/*
==========================================
ADMIN DASHBOARD ANALYTICS CONTROLLER
==========================================
*/

// GET /admin/dashboard/analytics

export const getAdminDashboardAnalytics = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  try {
    const analytics = await getDashboardAnalytics(restaurantId);

    return res.status(200).json({
      success: true,
      message: "Dashboard analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


/*
==========================================
ADMIN POPULAR DISHES CONTROLLER
==========================================
*/

// GET /admin/dashboard/popular-dishes

export const getAdminPopularDishes = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid Admin restaurant assignment",
    });
  }

  try {
    const dishes = await getPopularDishes(restaurantId);

    return res.status(200).json({
      success: true,
      message: "Popular dishes retrieved successfully",
      data: dishes,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

