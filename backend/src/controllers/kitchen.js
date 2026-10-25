import {
  getActiveOrders,
  getOrderById,
  changeOrderStatus,
  changeItemStatus,
  getOrderHistory,
} from "../services/kitchen.js";

// Shared Helpers

// Validate positive integer IDs
const parseId = (value) => {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
};

// Get restaurant ID from authenticated staff
const getRestaurantId = (req) => {
  return parseId(req.user?.restaurant_id);
};

// Handle API errors
const handleError = (res, error) => {
  console.error("Kitchen API Error:", error);

  if (error.code === "P0002") {
    return res.status(404).json({
      success: false,
      message: "Order or item not found",
    });
  }

  if (error.code === "23514") {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === "22023") {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Kitchen operation failed",
  });
};

// 1. Get Active Kitchen Orders
// GET /kitchen/orders

export const getKitchenOrders = async (req, res) => {
  const restaurantId = getRestaurantId(req);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  try {
    const orders = await getActiveOrders(restaurantId);

    return res.status(200).json({
      success: true,
      message: "Kitchen orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// 2. Get Specific Kitchen Order
// GET /kitchen/orders/:id

export const getKitchenOrderById = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const orderId = parseId(req.params.id);

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID",
    });
  }

  try {
    const order = await getOrderById(restaurantId, orderId);

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

// 3. Update Whole Order Status
// PATCH /kitchen/orders/:id/status

export const updateKitchenOrderStatus = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const orderId = parseId(req.params.id);
  const status = req.body?.status;

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID",
    });
  }

  if (!["PREPARING", "READY", "SERVED"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  try {
    await changeOrderStatus(restaurantId, orderId, status);

    const order = await getOrderById(restaurantId, orderId);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// 4. Update Individual Dish Status
// PATCH /kitchen/items/:id/status

export const updateKitchenItemStatus = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const itemId = parseId(req.params.id);
  const status = req.body?.status;

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  if (!itemId) {
    return res.status(400).json({
      success: false,
      message: "Invalid order item ID",
    });
  }

  if (!["PREPARING", "READY", "SERVED"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  try {
    const result = await changeItemStatus(
      restaurantId,
      itemId,
      status
    );

    const order = await getOrderById(
      restaurantId,
      result.order_id
    );

    return res.status(200).json({
      success: true,
      message: "Item status updated successfully",
      data: order,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// 5. Get Kitchen Order History
// GET /kitchen/history

export const getKitchenHistory = async (req, res) => {
  const restaurantId = getRestaurantId(req);
  const page = parseId(req.query.page ?? "1");
  const limit = parseId(req.query.limit ?? "20");

  if (!restaurantId) {
    return res.status(403).json({
      success: false,
      message: "Invalid staff restaurant assignment",
    });
  }

  if (!page || !limit || limit > 100) {
    return res.status(400).json({
      success: false,
      message: "Invalid pagination parameters",
    });
  }

  try {
    const history = await getOrderHistory(restaurantId, {
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Kitchen history retrieved successfully",
      data: history.orders,
      pagination: history.pagination,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
