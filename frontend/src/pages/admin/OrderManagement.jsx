import { useEffect, useState } from "react";
import Icon from "../../components/common/Icon";

import {
  getAdminOrders,
  getAdminOrderDetails,
} from "../../services/adminOrderService";

import {
  getMenuItems,
} from "../../services/adminMenuService";

// ==========================================
// CONSTANTS
// ==========================================

const PAGE_SIZE = 10;

const statusOptions = [
  ["all", "All Statuses"],
  ["RECEIVED", "Received"],
  ["PREPARING", "Preparing"],
  ["READY", "Ready"],
  ["SERVED", "Served"],
  ["CANCELLED", "Cancelled"],
];

const typeOptions = [
  ["all", "All Order Types"],
  ["dine-in", "Dine-in"],
  ["takeaway", "Takeaway"],
];

const statusLabels = {
  RECEIVED: "Received",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  CANCELLED: "Cancelled",
};

const statusTones = {
  RECEIVED: "received",
  PREPARING: "preparing",
  READY: "ready",
  SERVED: "completed",
  CANCELLED: "cancelled",
};

// ==========================================
// HELPERS
// ==========================================

function money(value) {
  if (value == null) return "—";
  return `$${Number(value).toFixed(2)}`;
}

function normalizeStatus(value) {
  return String(value || "").toUpperCase();
}

function formatDateTime(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-US", {
    timeZone: "Asia/Phnom_Penh",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getOrderType(order) {
  const type = String(
    order.order_type || order.type || ""
  ).toLowerCase();

  if (type === "takeaway") return "takeaway";

  if (
    type === "dine-in" ||
    type === "dine_in" ||
    order.table_id != null
  ) {
    return "dine-in";
  }

  return "unknown";
}

function preparedCount(items) {
  return items.filter(item =>
    ["READY", "SERVED"].includes(
      normalizeStatus(item.status)
    )
  ).length;
}

function totalDishes(items) {
  return items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
}

// ==========================================
// REUSABLE DISH IMAGE
// ==========================================

function DishImage({
  src,
  name,
  size = "small",
}) {
  const [failed, setFailed] = useState(false);

  const className =
    size === "large"
      ? "a-order-detail-thumbnail"
      : "a-orders-dish-thumb";

  return (
    <span
      className={className}
      title={name || "Menu item"}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name || "Menu item"}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon name="utensils" size={size === "large" ? 22 : 16} />
      )}
    </span>
  );
}

// ==========================================
// FIRST THREE ORDER IMAGES
// ==========================================

function OrderImagePreview({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="a-orders-dish-images">
        <DishImage name="No image available" />
      </div>
    );
  }

  const visibleItems = items.slice(0, 3);
  const remaining = Math.max(0, items.length - 3);

  return (
    <div className="a-orders-dish-images">
      {visibleItems.map((item, index) => (
        <DishImage
          key={item.order_item_id ?? index}
          src={item.image_url}
          name={item.item_name}
        />
      ))}

      {remaining > 0 && (
        <span
          className="a-orders-image-more"
          title={`${remaining} more dish lines`}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}

// ==========================================
// ORDER DETAILS POPUP
// ==========================================

function DetailsModal({ order, onClose }) {
  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const status = normalizeStatus(order.status);
  const prepared = preparedCount(items);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="a-order-preview-overlay"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-detail-title"
        className="card a-order-detail"
        onClick={event => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="a-order-detail-header">
          <div>
            <span className="eyebrow">
              ORDER DETAILS
            </span>

            <h2 id="admin-order-detail-title">
              {order.order_number ||
                `#${order.order_id}`}
            </h2>

            <p>
              Placed {formatDateTime(order.ordered_at)}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* ORDER INFORMATION */}
        <div className="a-order-detail-meta">
          <div>
            <small>ORDER STATUS</small>
            <strong>
              {statusLabels[status] ||
                status ||
                "Unknown"}
            </strong>
          </div>

          <div>
            <small>TABLE / TYPE</small>
            <strong>
              {getOrderType(order) === "takeaway"
                ? "Takeaway"
                : order.table_id != null
                  ? `Table ID ${order.table_id}`
                  : "Not specified"}
            </strong>
          </div>

          <div>
            <small>TOTAL AMOUNT</small>
            <strong>
              {money(order.total_amount)}
            </strong>
          </div>
        </div>

        {/* PREPARATION PROGRESS */}
        <div className="a-order-detail-progress">
          <div>
            <strong>Preparation Progress</strong>
            <span>
              {prepared} / {items.length} dish lines
            </span>
          </div>

          <div className="a-orders-progress-track">
            <span
              style={{
                width: `${
                  items.length > 0
                    ? (prepared / items.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* DISHES */}
        <h3 className="a-order-detail-section">
          Ordered Dishes
        </h3>

        <div className="a-order-detail-items">
          {items.length === 0 ? (
            <p className="muted">
              No dishes found for this order.
            </p>
          ) : (
            items.map((item, index) => {
              const itemStatus = normalizeStatus(
                item.status
              );

              return (
                <div
                  className="a-order-detail-item"
                  key={item.order_item_id ?? index}
                >
                  <DishImage
                    key={item.image_url || "no-image"}
                    src={item.image_url}
                    name={item.item_name}
                    size="large"
                  />

                  <div className="a-order-detail-item-info">
                    <strong>
                      {item.item_name ||
                        "Unnamed dish"}
                    </strong>

                    <small>
                      Quantity: {item.quantity}
                    </small>

                    <span
                      className={`a-dish-status ${
                        itemStatus === "RECEIVED"
                          ? "a-dish-pending"
                          : itemStatus === "PREPARING"
                            ? "a-dish-preparing"
                            : itemStatus === "READY"
                              ? "a-dish-ready"
                              : itemStatus === "SERVED"
                                ? "a-dish-served"
                                : "a-dish-pending"
                      }`}
                    >
                      {statusLabels[itemStatus] ||
                        itemStatus ||
                        "Unknown"}
                    </span>

                    {item.special_instruction && (
                      <small>
                        Note: {item.special_instruction}
                      </small>
                    )}
                  </div>

                  <div className="a-order-detail-item-price">
                    <strong>
                      {money(item.subtotal)}
                    </strong>

                    <small>
                      {money(item.unit_price)} each
                    </small>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CUSTOMER NOTE */}
        {order.customer_note && (
          <div className="admin-order-note">
            <strong>Customer Note</strong>
            <p>{order.customer_note}</p>
          </div>
        )}

        {/* TOTAL */}
        <div className="a-order-detail-totals">
          <div>
            <span>Total dishes</span>
            <strong>{totalDishes(items)}</strong>
          </div>

          <div className="a-order-detail-grand">
            <span>Order Total</span>
            <strong>
              {money(order.total_amount)}
            </strong>
          </div>
        </div>

        <div className="a-order-detail-footer">
          <span>
            <Icon name="checkCircle" size={16} />
            Order information from Scander
          </span>

          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={onClose}
          >
            Close Details
          </button>
        </div>
      </section>
    </div>
  );
}

// ==========================================
// ORDER MANAGEMENT PAGE
// ==========================================

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [typeFilter, setTypeFilter] =
    useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  // ==========================================
  // LOAD ORDERS AND MENU IMAGES
  // ==========================================

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        // Get orders from the backend.
        const result = await getAdminOrders(
          page,
          PAGE_SIZE
        );

        // Get order details and the menu catalog.
        // Menu images are optional: failure to load
        // images should not hide the orders.
        const [detailsResult, menuResult] =
          await Promise.all([
            Promise.allSettled(
              result.orders.map(order =>
                getAdminOrderDetails(order.order_id)
              )
            ),
            Promise.allSettled([
              getMenuItems(),
            ]),
          ]);

        if (ignore) return;

        // Create lookup: menu item ID -> image URL
        const imageByItemId = new Map();

        const menuResponse = menuResult[0];

        if (
          menuResponse.status === "fulfilled" &&
          Array.isArray(menuResponse.value)
        ) {
          menuResponse.value.forEach(item => {
            if (
              item.item_id != null &&
              item.image_url
            ) {
              imageByItemId.set(
                String(item.item_id),
                item.image_url
              );
            }
          });
        } else {
          console.warn(
            "Menu images could not be loaded."
          );
        }

        // Combine orders, dishes and images.
        const enrichedOrders = result.orders.map(
          (order, index) => {
            const detailResult = detailsResult[index];

            const detailAvailable =
              detailResult.status === "fulfilled";

            const detailItems = detailAvailable
              ? detailResult.value.items
              : null;

            const enrichedItems = Array.isArray(
              detailItems
            )
              ? detailItems.map(item => ({
                  ...item,

                  image_url:
                    item.image_url ||
                    imageByItemId.get(
                      String(item.item_id)
                    ) ||
                    null,
                }))
              : null;

            return {
              ...order,
              items: enrichedItems,
              detailAvailable,
            };
          }
        );

        setOrders(enrichedOrders);
        setPagination(result.pagination);
      } catch (err) {
        if (!ignore) {
          console.error(
            "Failed to load Admin Orders:",
            err
          );

          setOrders([]);
          setPagination(null);

          setError(
            err.message || "Unable to load orders."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [page, refresh]);

  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const counts = {
    received: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
  };

  orders.forEach(order => {
    const status = normalizeStatus(order.status);

    if (status === "RECEIVED") {
      counts.received++;
    } else if (status === "PREPARING") {
      counts.preparing++;
    } else if (status === "READY") {
      counts.ready++;
    } else if (status === "SERVED") {
      counts.completed++;
    }
  });

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  // Filters affect the current loaded page.
  const filteredOrders = orders.filter(order => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      String(
        order.order_number || order.order_id
      )
        .toLowerCase()
        .includes(query) ||
      `table ${order.table_id ?? ""}`.includes(
        query
      ) ||
      (order.items || []).some(item =>
        String(item.item_name || "")
          .toLowerCase()
          .includes(query)
      );

    const matchesStatus =
      statusFilter === "all" ||
      normalizeStatus(order.status) ===
        statusFilter;

    const matchesType =
      typeFilter === "all" ||
      getOrderType(order) === typeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType
    );
  });

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalOrders = Number(
    pagination?.total ?? 0
  );

  const totalPages = Math.max(
    1,
    Number(
      pagination?.totalPages ||
        Math.ceil(totalOrders / PAGE_SIZE) ||
        1
    )
  );

  function refreshOrders() {
    setSelectedOrder(null);
    setRefresh(previous => previous + 1);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <section className="a-orders-page">
      {/* HEADER */}
      <header className="a-orders-heading">
        <div>
          <span className="eyebrow">
            RESTAURANT OPERATIONS
          </span>

          <h1>Order Management</h1>

          <p>
            Monitor incoming orders and follow
            kitchen preparation progress.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-small"
          disabled={loading}
          onClick={refreshOrders}
        >
          <Icon name="refresh" size={16} />
          Refresh Orders
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <div className="a-orders-stats">
        {[
          {
            label: "Orders on Page",
            value: orders.length,
            icon: "bag",
            tone: "slate",
          },
          {
            label: "Received",
            value: counts.received,
            icon: "inbox",
            tone: "blue",
          },
          {
            label: "Preparing",
            value: counts.preparing,
            icon: "flame",
            tone: "amber",
          },
          {
            label: "Ready to Serve",
            value: counts.ready,
            icon: "cloche",
            tone: "green",
          },
          {
            label: "Completed",
            value: counts.completed,
            icon: "checkCircle",
            tone: "purple",
          },
        ].map(stat => (
          <article
            className={`a-orders-stat a-orders-stat-${stat.tone}`}
            key={stat.label}
          >
            <div>
              <span>{stat.label}</span>
              <Icon name={stat.icon} size={21} />
            </div>

            <strong>
              {loading
                ? "..."
                : error
                  ? "—"
                  : stat.value}
            </strong>
          </article>
        ))}
      </div>

      {/* ORDER TABLE PANEL */}
      <section className="card a-orders-panel">
        <div className="a-orders-panel-heading">
          <div>
            <h2>All Orders</h2>
            <p>
              {loading
                ? "Loading orders..."
                : `${filteredOrders.length} matching orders on this page`}
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <p
            role="alert"
            className="admin-image-error"
          >
            {error}

            <button
              type="button"
              className="btn btn-outline btn-small"
              onClick={refreshOrders}
            >
              Try Again
            </button>
          </p>
        )}

        {/* FILTERS */}
        <div className="a-orders-filters">
          <label className="a-orders-search">
            <Icon name="search" size={19} />

            <input
              type="search"
              placeholder="Search order, table, or dish..."
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
            />
          </label>

          <select
            aria-label="Filter order status"
            value={statusFilter}
            onChange={event =>
              setStatusFilter(event.target.value)
            }
          >
            {statusOptions.map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>

          <select
            aria-label="Filter order type"
            value={typeFilter}
            onChange={event =>
              setTypeFilter(event.target.value)
            }
          >
            {typeOptions.map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            className="a-orders-reset"
            onClick={resetFilters}
            title="Reset filters"
            aria-label="Reset filters"
          >
            <Icon name="refresh" size={19} />
          </button>
        </div>

        {/* TABLE */}
        <div className="table-scroll">
          <table className="a-orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Table / Type</th>
                <th>Items</th>
                <th>Progress</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                !error &&
                filteredOrders.map(order => {
                  const items = order.items;

                  const prepared = items
                    ? preparedCount(items)
                    : 0;

                  const lines = items?.length || 0;

                  const percent = lines
                    ? (prepared / lines) * 100
                    : 0;

                  const status = normalizeStatus(
                    order.status
                  );

                  return (
                    <tr key={order.order_id}>
                      {/* ORDER NUMBER */}
                      <td>
                        <div className="a-orders-id">
                          <strong>
                            {order.order_number ||
                              `#${order.order_id}`}
                          </strong>

                          <small>
                            {formatDateTime(
                              order.ordered_at
                            )}
                          </small>
                        </div>
                      </td>

                      {/* TABLE */}
                      <td>
                        <div className="a-orders-table-info">
                          <strong>
                            {getOrderType(order) ===
                            "takeaway"
                              ? "Takeaway"
                              : order.table_id == null
                                ? "Not specified"
                                : `Table ID ${order.table_id}`}
                          </strong>

                          <small>
                            {getOrderType(order) ===
                            "unknown"
                              ? "Type not specified"
                              : getOrderType(order) ===
                                  "takeaway"
                                ? "Pickup order"
                                : "Dine-in"}
                          </small>
                        </div>
                      </td>

                      {/* FOOD IMAGES */}
                      <td>
                        <div className="a-orders-dishes">
                          <OrderImagePreview
                            items={items}
                          />

                          <small>
                            {items
                              ? `${totalDishes(items)} dishes`
                              : "Items unavailable"}
                          </small>
                        </div>
                      </td>

                      {/* PREPARATION */}
                      <td>
                        <div className="a-orders-progress">
                          {items ? (
                            <>
                              <div
                                className="a-orders-progress-track"
                                role="progressbar"
                                aria-label={`Order ${order.order_id} preparation progress`}
                                aria-valuemin={0}
                                aria-valuemax={lines}
                                aria-valuenow={prepared}
                              >
                                <span
                                  style={{
                                    width: `${percent}%`,
                                  }}
                                />
                              </div>

                              <small>
                                {prepared}/{lines} dish
                                lines ready or served
                              </small>
                            </>
                          ) : (
                            <small>
                              Progress unavailable
                            </small>
                          )}
                        </div>
                      </td>

                      {/* AMOUNT */}
                      <td>
                        <strong className="a-orders-price">
                          {money(order.total_amount)}
                        </strong>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`a-order-status a-order-${
                            statusTones[status] ||
                            "received"
                          }`}
                        >
                          {statusLabels[status] ||
                            status ||
                            "Unknown"}
                        </span>
                      </td>

                      {/* DETAILS */}
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          disabled={
                            !order.detailAvailable
                          }
                          title={
                            !order.detailAvailable
                              ? "Could not load order details."
                              : undefined
                          }
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                        >
                          Details
                          <Icon
                            name="chevronRight"
                            size={15}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {/* LOADING */}
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="admin-empty"
                  >
                    Loading orders and dishes...
                  </td>
                </tr>
              )}

              {/* EMPTY */}
              {!loading &&
                !error &&
                filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="admin-empty"
                    >
                      No orders match your filters
                      on this page.
                    </td>
                  </tr>
                )}

              {/* ERROR */}
              {!loading && error && (
                <tr>
                  <td
                    colSpan={7}
                    className="admin-empty"
                  >
                    Orders could not be loaded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="a-orders-pagination">
          <span>
            Showing{" "}
            {totalOrders
              ? (page - 1) * PAGE_SIZE + 1
              : 0}
            {"–"}
            {Math.min(
              page * PAGE_SIZE,
              totalOrders
            )}{" "}
            of {totalOrders}
          </span>

          <div>
            <button
              type="button"
              disabled={loading || page === 1}
              aria-label="Previous page"
              onClick={() =>
                setPage(previous => previous - 1)
              }
            >
              <Icon name="chevronLeft" size={18} />
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={
                loading || page >= totalPages
              }
              aria-label="Next page"
              onClick={() =>
                setPage(previous => previous + 1)
              }
            >
              <Icon name="chevronRight" size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ORDER DETAILS POPUP */}
      {selectedOrder && (
        <DetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}

