
import { useState } from 'react';
import StatCard from '../../components/admin/StatCard';

// Demo data based on the paid orders in Payment Management.
// Later, replace this with records from the backend API.
const sampleSales = [
  {
    orderId: '#1027',
    date: '2026-10-24',
    table: 'Table 01',
    method: 'KHQR',
    items: [
      { name: 'Avocado Toast', quantity: 2, price: 4.75 },
      { name: 'Iced Latte', quantity: 2, price: 3.50 }
    ]
  },
  {
    orderId: '#1028',
    date: '2026-10-24',
    table: 'Table 05',
    method: 'Cash',
    items: [
      { name: 'Cappuccino', quantity: 1, price: 3.75 },
      { name: 'Chocolate Cake', quantity: 1, price: 4.25 }
    ]
  }
];

const money = amount => `$${amount.toFixed(2)}`;

function getOrderTotal(order) {
  return order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

export default function Reports() {
  const [methodFilter, setMethodFilter] = useState('All');

  const filteredSales = sampleSales.filter(sale =>
    methodFilter === 'All' || sale.method === methodFilter
  );

  const revenue = filteredSales.reduce(
    (sum, sale) => sum + getOrderTotal(sale),
    0
  );

  const totalOrders = filteredSales.length;

  const itemsSold = filteredSales.reduce(
    (sum, sale) =>
      sum + sale.items.reduce(
        (count, item) => count + item.quantity, 0
      ),
    0
  );

  const averageOrder = totalOrders > 0
    ? revenue / totalOrders
    : 0;

  // Calculate revenue grouped by payment method.
  const paymentMethods = ['KHQR', 'Cash'].map(method => ({
    name: method,
    amount: filteredSales
      .filter(sale => sale.method === method)
      .reduce((sum, sale) => sum + getOrderTotal(sale), 0)
  }));

  // Combine quantities of matching menu items.
  const productTotals = {};

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productTotals[item.name]) {
        productTotals[item.name] = {
          name: item.name,
          quantity: 0,
          revenue: 0
        };
      }

      productTotals[item.name].quantity += item.quantity;
      productTotals[item.name].revenue +=
        item.quantity * item.price;
    });
  });

  const popularItems = Object.values(productTotals)
    .sort((a, b) =>
      b.quantity - a.quantity ||
      b.revenue - a.revenue
    );

  const maxQuantity = Math.max(
    1,
    ...popularItems.map(item => item.quantity)
  );

  function downloadCSV() {
    const rows = [
      ['Order ID', 'Date', 'Table', 'Method', 'Amount'],
      ...filteredSales.map(sale => [
        sale.orderId,
        sale.date,
        sale.table,
        sale.method,
        getOrderTotal(sale).toFixed(2)
      ])
    ];

    const csv = rows
      .map(row =>
        row.map(value => {
          const cell = String(value).replaceAll('"', '""');
          return `"${cell}"`;
        }).join(',')
      )
      .join('\r\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'scander-sales-demo.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="admin-reports">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">RESTAURANT ANALYTICS</span>
          <h1>Sales Reports</h1>
          <p className="muted">
            Understand revenue, payments, and popular items.
          </p>
          <p className="muted">
            Demo mode — all figures are sample data.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={downloadCSV}
        >
          ↓ Export CSV
        </button>
      </div>

      <div className="admin-report-filter">
        <label htmlFor="report-method">
          Payment Method
        </label>

        <select
          id="report-method"
          value={methodFilter}
          onChange={event => setMethodFilter(event.target.value)}
        >
          <option value="All">All Methods</option>
          <option value="KHQR">KHQR</option>
          <option value="Cash">Cash</option>
        </select>

        <span className="admin-demo-label">
          Oct 24, 2026 · Sample
        </span>
      </div>

      {/* Report Statistics */}
      <div className="stats-grid">
        <StatCard
          label="Total Revenue"
          value={money(revenue)}
          hint="Collected from paid orders"
        />

        <StatCard
          label="Paid Orders"
          value={totalOrders}
          hint="Completed payments"
        />

        <StatCard
          label="Average Order Value"
          value={money(averageOrder)}
          hint="Revenue per paid order"
        />

        <StatCard
          label="Items Sold"
          value={itemsSold}
          hint="Total item quantities"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="admin-report-grid">
        <div className="card">
          <div className="admin-section-heading">
            <h2>Revenue by Payment Method</h2>
          </div>

          {paymentMethods.map(method => (
            <div
              className="admin-report-bar-row"
              key={method.name}
            >
              <div className="admin-report-bar-label">
                <span>{method.name}</span>
                <strong>{money(method.amount)}</strong>
              </div>

              <div className="admin-report-bar-track">
                <div
                  className="admin-report-bar-fill"
                  style={{
                    width: `${revenue > 0
                      ? (method.amount / revenue) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>
          ))}

          <p className="muted admin-report-note">
            Based on sample paid transactions only.
          </p>
        </div>

        {/* Best-Selling Items */}
        <div className="card">
          <div className="admin-section-heading">
            <h2>Best-Selling Items</h2>
          </div>

          {popularItems.length === 0 ? (
            <p className="muted">No sales found.</p>
          ) : (
            popularItems.map((item, index) => (
              <div
                className="admin-report-product"
                key={item.name}
              >
                <div className="admin-report-product-heading">
                  <span>
                    <strong>{index + 1}.</strong> {item.name}
                  </span>
                  <strong>{item.quantity} sold</strong>
                </div>

                <div className="admin-report-bar-track">
                  <div
                    className="admin-report-bar-fill secondary"
                    style={{
                      width: `${
                        (item.quantity / maxQuantity) * 100
                      }%`
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sales Records */}
      <div className="card admin-sales-records">
        <div className="admin-section-heading">
          <h2>Sales Transactions</h2>
          <span className="muted">
            {filteredSales.length} transactions
          </span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Table</th>
                <th>Method</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.orderId}>
                  <td><strong>{sale.orderId}</strong></td>
                  <td>{sale.date}</td>
                  <td>{sale.table}</td>
                  <td>{sale.method}</td>
                  <td>
                    <strong>{money(getOrderTotal(sale))}</strong>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-empty">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
