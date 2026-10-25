
import { adminSupabase } from "../config/supabase.js";

// ==========================================
// ADMIN TABLE MANAGEMENT SERVICE
// ==========================================

// Fields returned to Admin
const TABLE_FIELDS = [
  "table_id",
  "restaurant_id",
  "table_number",
  "qr_token",
  "is_active",
  "created_at",
  "updated_at",
].join(", ");

// 1. Get all tables for a restaurant
export const getRestaurantTables = async (restaurantId) => {
  const { data, error } = await adminSupabase
    .from("restaurant_table")
    .select(TABLE_FIELDS)
    .eq("restaurant_id", restaurantId)
    .order("table_id", { ascending: true });

  if (error) throw error;

  return data ?? [];
};

// 2. Get one specific table
export const getRestaurantTableById = async (
  restaurantId,
  tableId
) => {
  const { data, error } = await adminSupabase
    .from("restaurant_table")
    .select(TABLE_FIELDS)
    .eq("restaurant_id", restaurantId)
    .eq("table_id", tableId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// 3. Create a restaurant table
export const createRestaurantTable = async (
  restaurantId,
  input
) => {
  const { data, error } = await adminSupabase
    .from("restaurant_table")
    .insert({
      restaurant_id: restaurantId,
      table_number: input.table_number.trim(),
    })
    .select(TABLE_FIELDS)
    .single();

  if (error) throw error;

  return data;
};

// 4. Update a table number
export const updateRestaurantTable = async (
  restaurantId,
  tableId,
  input
) => {
  const { data, error } = await adminSupabase
    .from("restaurant_table")
    .update({
      table_number: input.table_number.trim(),
    })
    .eq("restaurant_id", restaurantId)
    .eq("table_id", tableId)
    .select(TABLE_FIELDS)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// 5. Activate or deactivate a table

export const setRestaurantTableActive = async (
  restaurantId,
  tableId,
  isActive
) => {
  // Prevent deactivating tables with unfinished orders.
  if (isActive === false) {
    const { data: activeOrders, error: ordersError } =
      await adminSupabase
        .from("customer_order")
        .select("order_id")
        .eq("restaurant_id", restaurantId)
        .eq("table_id", tableId)
        .in("status", ["RECEIVED", "PREPARING", "READY"])
        .limit(1);

    if (ordersError) throw ordersError;

    if (activeOrders.length > 0) {
      const error = new Error(
        "Cannot deactivate a table with unfinished orders"
      );
      error.status = 409;
      throw error;
    }
  }

  const { data, error } = await adminSupabase
    .from("restaurant_table")
    .update({
      is_active: isActive,
    })
    .eq("restaurant_id", restaurantId)
    .eq("table_id", tableId)
    .select(TABLE_FIELDS)
    .maybeSingle();

  if (error) throw error;

  return data;
};


/*
==========================================
ADMIN ORDER MANAGEMENT SERVICE
==========================================
*/

// 1. Get restaurant orders with optional filters
export const getAdminOrders = async (
  restaurantId,
  { status, page = 1, limit = 20 } = {}
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = adminSupabase
    .from("customer_order")
    .select(
      "order_id, order_number, restaurant_id, table_id, status, total_amount, customer_note, ordered_at, completed_at",
      { count: "exact" }
    )
    .eq("restaurant_id", restaurantId);

  // Filter by status when requested.
  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query
    .order("ordered_at", { ascending: false })
    .order("order_id", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    orders: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
};

// 2. Get one order and its individual dishes
export const getAdminOrderById = async (
  restaurantId,
  orderId
) => {
  // Retrieve the order.
  const { data: order, error: orderError } =
    await adminSupabase
      .from("customer_order")
      .select(
        "order_id, order_number, restaurant_id, table_id, status, total_amount, customer_note, ordered_at, completed_at"
      )
      .eq("restaurant_id", restaurantId)
      .eq("order_id", orderId)
      .maybeSingle();

  if (orderError) throw orderError;

  if (!order) {
    return null;
  }

  // Retrieve dishes belonging to this order.
  const { data: items, error: itemsError } =
    await adminSupabase
      .from("order_item")
      .select(
        "order_item_id, item_id, item_name, quantity, unit_price, subtotal, special_instruction, status, preparing_at, ready_at, served_at"
      )
      .eq("restaurant_id", restaurantId)
      .eq("order_id", orderId)
      .order("order_item_id", { ascending: true });

  if (itemsError) throw itemsError;

  return {
    ...order,
    items: items ?? [],
  };
};


/*
==========================================
ADMIN DASHBOARD STATISTICS SERVICE
==========================================
*/

export const getDashboardStatistics = async (restaurantId) => {
  // 1. Calculate today's date in Cambodia time (UTC+7).
  const cambodiaNow = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Phnom_Penh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type) =>
    Number(cambodiaNow.find((part) => part.type === type).value);

  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");

  const startMs =
    Date.UTC(year, month - 1, day) - 7 * 60 * 60 * 1000;

  const startOfToday = new Date(startMs).toISOString();
  const startOfTomorrow = new Date(
    startMs + 24 * 60 * 60 * 1000
  ).toISOString();

  // 2. Count all orders for this restaurant.
  const { count: totalOrders, error: totalError } =
    await adminSupabase
      .from("customer_order")
      .select("order_id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId);

  if (totalError) throw totalError;

  // 3. Read today's orders in batches.
  // Using batches prevents Supabase's row limit
  // from silently truncating the results.
  const todayOrders = [];
  const batchSize = 500;

  for (let from = 0; ; from += batchSize) {
    const { data, error } = await adminSupabase
      .from("customer_order")
      .select("order_id, status, total_amount, ordered_at")
      .eq("restaurant_id", restaurantId)
      .gte("ordered_at", startOfToday)
      .lt("ordered_at", startOfTomorrow)
      .order("order_id", { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) throw error;

    todayOrders.push(...(data ?? []));

    if (!data || data.length < batchSize) {
      break;
    }
  }

  // 4. Calculate today's statistics.
  const ordersToday = todayOrders.length;

  const preparingOrders = todayOrders.filter(
    (order) => order.status === "PREPARING"
  ).length;

  const cancelledOrders = todayOrders.filter(
    (order) => order.status === "CANCELLED"
  ).length;

  // This is order value, NOT confirmed payment revenue.
  // Exclude cancelled orders.
  const todayOrderValue = todayOrders
    .filter((order) => order.status !== "CANCELLED")
    .reduce(
      (sum, order) => sum + Number(order.total_amount ?? 0),
      0
    );

  return {
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    timezone: "Asia/Phnom_Penh",
    total_orders: totalOrders ?? 0,
    orders_today: ordersToday,
    preparing_orders_today: preparingOrders,
    cancelled_orders_today: cancelledOrders,
    today_order_value: Math.round(todayOrderValue * 100) / 100,
  };
};


/*
==========================================
ADMIN DASHBOARD ANALYTICS SERVICE
==========================================
*/

// Get the last 7 days of order activity.
export const getDashboardAnalytics = async (restaurantId) => {
  const TIMEZONE = "Asia/Phnom_Penh";
  const DAY_MS = 24 * 60 * 60 * 1000;
  const CAMBODIA_OFFSET = 7 * 60 * 60 * 1000;

  // Find today's local date in Cambodia.
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type) =>
    Number(dateParts.find((part) => part.type === type).value);

  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");

  // Start of today in UTC.
  const todayStart =
    Date.UTC(year, month - 1, day) - CAMBODIA_OFFSET;

  // Start of the 7-day window (including today).
  const periodStart = todayStart - 6 * DAY_MS;
  const periodEnd = todayStart + DAY_MS;

  // Create seven dates, initially with zero orders.
  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      periodStart + index * DAY_MS + CAMBODIA_OFFSET
    ).toISOString().slice(0, 10);

    return {
      date,
      orders: 0,
    };
  });

  // Retrieve orders in batches.
  const orders = [];
  const batchSize = 500;

  for (let from = 0; ; from += batchSize) {
    const { data, error } = await adminSupabase
      .from("customer_order")
      .select("order_id, ordered_at, status")
      .eq("restaurant_id", restaurantId)
      .gte("ordered_at", new Date(periodStart).toISOString())
      .lt("ordered_at", new Date(periodEnd).toISOString())
      .order("order_id", { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) throw error;

    orders.push(...(data ?? []));

    if (!data || data.length < batchSize) {
      break;
    }
  }

  // Count orders by date.
  const trendMap = new Map(
    trend.map((item) => [item.date, item])
  );

  // Count orders by status.
  const statusCounts = {};

  for (const order of orders) {
    const localDate = new Date(
      new Date(order.ordered_at).getTime() +
      CAMBODIA_OFFSET
    ).toISOString().slice(0, 10);

    const trendDay = trendMap.get(localDate);

    if (trendDay) {
      trendDay.orders += 1;
    }

    const status = order.status ?? "UNKNOWN";

    statusCounts[status] =
      (statusCounts[status] ?? 0) + 1;
  }

  const statusDistribution = Object.entries(
    statusCounts
  ).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    timezone: TIMEZONE,
    period: "last_7_days",
    total_orders: orders.length,
    order_trend: trend,
    status_distribution: statusDistribution,
  };
};


/*
==========================================
ADMIN POPULAR DISHES SERVICE
==========================================
*/

export const getPopularDishes = async (restaurantId) => {
  // Calculate the beginning of the 7-day period
  // using Cambodia's timezone (UTC+7).
  const DAY_MS = 24 * 60 * 60 * 1000;
  const OFFSET_MS = 7 * 60 * 60 * 1000;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Phnom_Penh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const part = (type) =>
    Number(parts.find((p) => p.type === type).value);

  const todayStart =
    Date.UTC(
      part("year"),
      part("month") - 1,
      part("day")
    ) - OFFSET_MS;

  const fromDate = new Date(
    todayStart - 6 * DAY_MS
  ).toISOString();

  const toDate = new Date(
    todayStart + DAY_MS
  ).toISOString();

  // 1. Retrieve non-cancelled orders from the last 7 days.
  const orderIds = [];
  const batchSize = 500;

  for (let from = 0; ; from += batchSize) {
    const { data, error } = await adminSupabase
      .from("customer_order")
      .select("order_id")
      .eq("restaurant_id", restaurantId)
      .neq("status", "CANCELLED")
      .gte("ordered_at", fromDate)
      .lt("ordered_at", toDate)
      .order("order_id", { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) throw error;

    orderIds.push(...(data ?? []).map(
      (order) => order.order_id
    ));

    if (!data || data.length < batchSize) break;
  }

  if (orderIds.length === 0) {
    return [];
  }

  // 2. Get items from those orders.
  const quantities = new Map();
  const orderCounts = new Map();

  // Query smaller groups to avoid oversized filters.
  for (let i = 0; i < orderIds.length; i += 100) {
    const ids = orderIds.slice(i, i + 100);

    for (let from = 0; ; from += batchSize) {
      const { data, error } = await adminSupabase
        .from("order_item")
        .select("order_item_id, order_id, item_id, quantity")
        .eq("restaurant_id", restaurantId)
        .in("order_id", ids)
        .order("order_item_id", { ascending: true })
        .range(from, from + batchSize - 1);

      if (error) throw error;

      for (const item of data ?? []) {
        if (item.item_id == null) continue;

        const key = String(item.item_id);
        const quantity = Number(item.quantity ?? 0);

        quantities.set(
          key,
          (quantities.get(key) ?? 0) + quantity
        );

        if (!orderCounts.has(key)) {
          orderCounts.set(key, new Set());
        }

        orderCounts.get(key).add(item.order_id);
      }

      if (!data || data.length < batchSize) break;
    }
  }

  if (quantities.size === 0) {
    return [];
  }

  // 3. Get the names of those menu items.
  const itemIds = [...quantities.keys()];
  const names = new Map();

  for (let i = 0; i < itemIds.length; i += 100) {
    const { data, error } = await adminSupabase
      .from("menu_item")
      .select("item_id, name")
      .eq("restaurant_id", restaurantId)
      .in("item_id", itemIds.slice(i, i + 100));

    if (error) throw error;

    for (const item of data ?? []) {
      names.set(String(item.item_id), item.name);
    }
  }

  // 4. Sort by quantity sold.
  const popularDishes = itemIds.map((itemId) => ({
    item_id: Number(itemId),
    name: names.get(itemId) ?? "Unknown Item",
    quantity_sold: quantities.get(itemId),
    order_count: orderCounts.get(itemId).size,
  }));

  popularDishes.sort(
    (a, b) => b.quantity_sold - a.quantity_sold
  );

  // Return the top 5 items.
  return popularDishes.slice(0, 5);
};
