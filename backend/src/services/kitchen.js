import { adminSupabase } from "../config/supabase.js";

// Kitchen Management Service


const ACTIVE_STATUSES = ["RECEIVED", "PREPARING", "READY"];
const HISTORY_STATUSES = ["SERVED", "CANCELLED"];


// Shared: attach dishes, table numbers and menu images

const ITEM_FIELDS =
  "order_item_id, order_id, item_id, item_name, quantity, unit_price, subtotal, special_instruction, status, preparing_at, ready_at, served_at";

// Look up display table numbers for the given table IDs
const getTableNumbers = async (restaurantId, tableIds) => {
  const ids = [...new Set(tableIds)];

  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await adminSupabase
    .from("restaurant_table")
    .select("table_id, table_number")
    .eq("restaurant_id", restaurantId)
    .in("table_id", ids);

  if (error) {
    throw new Error(`Failed to fetch tables: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((table) => [table.table_id, table.table_number])
  );
};

// Look up menu images for the given menu item IDs
const getItemImages = async (restaurantId, itemIds) => {
  const ids = [...new Set(itemIds)];

  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await adminSupabase
    .from("menu_item")
    .select("item_id, image_url")
    .eq("restaurant_id", restaurantId)
    .in("item_id", ids);

  if (error) {
    throw new Error(`Failed to fetch menu images: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((item) => [item.item_id, item.image_url])
  );
};

const attachOrderDetails = async (restaurantId, orders) => {
  if (!orders || orders.length === 0) {
    return [];
  }

  // Step 1: Retrieve items belonging to these orders
  const orderIds = orders.map((order) => order.order_id);

  const { data: items, error: itemsError } = await adminSupabase
    .from("order_item")
    .select(ITEM_FIELDS)
    .eq("restaurant_id", restaurantId)
    .in("order_id", orderIds)
    .order("order_item_id", { ascending: true });

  if (itemsError) {
    throw new Error(
      `Failed to fetch order items: ${itemsError.message}`
    );
  }

  // Step 2: Resolve table numbers and dish images
  const [tableNumbers, images] = await Promise.all([
    getTableNumbers(
      restaurantId,
      orders.map((order) => order.table_id)
    ),
    getItemImages(
      restaurantId,
      (items ?? []).map((item) => item.item_id)
    ),
  ]);

  // Step 3: Group items by order ID
  const itemsByOrder = new Map();

  for (const item of items ?? []) {
    const orderItems = itemsByOrder.get(item.order_id) ?? [];
    orderItems.push({
      ...item,
      image_url: images.get(item.item_id) ?? null,
    });
    itemsByOrder.set(item.order_id, orderItems);
  }

  // Step 4: Attach details to each order
  return orders.map((order) => ({
    ...order,
    table_number: tableNumbers.get(order.table_id) ?? null,
    items: itemsByOrder.get(order.order_id) ?? [],
  }));
};

// 1. Get Active Kitchen Orders

export const getActiveOrders = async (restaurantId) => {
  if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
    throw new Error("Invalid restaurant ID");
  }

  const { data: orders, error: ordersError } = await adminSupabase
    .from("customer_order")
    .select(
      "order_id, order_number, restaurant_id, table_id, status, customer_note, ordered_at"
    )
    .eq("restaurant_id", restaurantId)
    .in("status", ACTIVE_STATUSES)
    .order("ordered_at", { ascending: true });

  if (ordersError) {
    throw new Error(
      `Failed to fetch orders: ${ordersError.message}`
    );
  }

  return attachOrderDetails(restaurantId, orders);
};

// 2. Get Kitchen Order By ID

export const getOrderById = async (restaurantId, orderId) => {
  const { data: order, error: orderError } = await adminSupabase
    .from("customer_order")
    .select(
      "order_id, order_number, restaurant_id, table_id, status, total_amount, customer_note, ordered_at, completed_at"
    )
    .eq("restaurant_id", restaurantId)
    .eq("order_id", orderId)
    .maybeSingle();

  if (orderError) {
    throw new Error(
      `Failed to fetch order: ${orderError.message}`
    );
  }

  if (!order) {
    return null;
  }

  const [detailedOrder] = await attachOrderDetails(restaurantId, [
    order,
  ]);

  return detailedOrder;
};


// 3. Shared Database Status Function

const changeStatus = async (
  restaurantId,
  entity,
  id,
  status
) => {
  if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
    throw new Error("Invalid restaurant ID");
  }

  const { data, error } = await adminSupabase.rpc(
    "kitchen_change_status",
    {
      p_restaurant_id: restaurantId,
      p_entity: entity,
      p_id: id,
      p_new_status: status,
    }
  );

  if (error) {
    throw error;
  }

  return data;
};

// 4. Update Whole Kitchen Order Status

export const changeOrderStatus = async (
  restaurantId,
  orderId,
  status
) => {
  return changeStatus(
    restaurantId,
    "order",
    orderId,
    status
  );
};

// 5. Update Individual Order Item Status

export const changeItemStatus = async (
  restaurantId,
  itemId,
  status
) => {
  return changeStatus(
    restaurantId,
    "item",
    itemId,
    status
  );
};

// 6. Get Kitchen Order History
export const getOrderHistory = async (
  restaurantId,
  { page = 1, limit = 20 } = {}
) => {
  if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
    throw new Error("Invalid restaurant ID");
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await adminSupabase
    .from("customer_order")
    .select(
      "order_id, order_number, restaurant_id, table_id, status, total_amount, ordered_at, completed_at",
      { count: "exact" }
    )
    .eq("restaurant_id", restaurantId)
    .in("status", HISTORY_STATUSES)
    .order("ordered_at", { ascending: false })
    .order("order_id", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(
      `Failed to fetch order history: ${error.message}`
    );
  }

  return {
    orders: await attachOrderDetails(restaurantId, data ?? []),
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
};
