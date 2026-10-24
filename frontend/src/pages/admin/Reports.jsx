
import { useState } from 'react';
import Icon from '../../components/common/Icon';
import { useAdminMenu } from '../../context/AdminMenuContext';
import {
  demoPayments,
  getDemoPaymentTotal
} from '../../data/demoPayments';

const money = value => `$${value.toFixed(2)}`;

// The demo dataset is dated October 24, 2026.
// Use that date as the reference for the demo chart.
const DEMO_END_DATE = '2026-10-24';

function previousDates(endDate, days) {
  const dates = [];
  const end = new Date(`${endDate}T12:00:00`);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

function SummaryCard({ label, value, hint, icon, tone }) {
  return (
    <article className={`a-report-stat a-report-stat-${tone}`}>
      <div className="a-report-stat-head">
        <span>{label}</span>
        <Icon name={icon} size={22} />
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function DailyRevenueChart({ sales }) {
  const dates = previousDates(DEMO_END_DATE, 7);

  const chartData = dates.map(date => ({
    date,
    amount: sales
      .filter(sale => sale.date === date)
      .reduce((total, sale) =>
        total + getDemoPaymentTotal(sale), 0
      )
  }));

  const maximum = Math.max(
    1,
    ...chartData.map(entry => entry.amount)
  );

  return (
    <div
      className="a-report-chart"
      aria-label="Seven-day sample revenue chart"
    >
      {chartData.map(entry => {
        const height = (entry.amount / maximum) * 100;

        return (
          <div className="a-report-chart-column" key={entry.date}>
            <div
              className="a-report-chart-area"
              title={`${entry.date}: ${money(entry.amount)}`}
            >
              <div
                className={`a-report-chart-bar ${
                  entry.amount > 0 ? 'has-sales' : ''
                }`}
                style={{ height: `${height}%` }}
              />
            </div>

            <span>{entry.date.slice(8)}</span>
          </div>
        );
      })}
    </div>
  );
}

function PopularImage({ item }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="a-report-product-image">
      {item?.image && !failed ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon name="utensils" size={20} />
      )}
    </span>
  );
}

function downloadCSV(sales) {
  const header = [
    'Order ID',
    'Date',
    'Table',
    'Payment Method',
    'Status',
    'Amount'
  ];

  const rows = sales.map(sale => [
    sale.orderId,
    sale.date,
    sale.table,
    sale.method || '',
    sale.status,
    getDemoPaymentTotal(sale).toFixed(2)
  ]);

  // Escape CSV fields. Also prevent spreadsheet programs
  // from interpreting user-entered text as formulas.
  function csvCell(value) {
    let text = String(value ?? '');

    if (/^[\s]*[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replaceAll('"', '""')}"`;
  }

  const csv = [header, ...rows]
    .map(row => row.map(csvCell).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'scander-sales-demo.csv';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Reports() {
  const { items: menuItems } = useAdminMenu();

  const [methodFilter, setMethodFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Only paid demonstration records count as sample sales.
  const paidSales = demoPayments.filter(
    payment => payment.status === 'Paid'
  );

  const validDates = !startDate || !endDate || startDate <= endDate;

  const filteredSales = validDates
    ? paidSales.filter(sale => {
        const methodMatches =
          methodFilter === 'All' ||
          sale.method === methodFilter;

        const startMatches =
          !startDate || sale.date >= startDate;

        const endMatches =
          !endDate || sale.date <= endDate;

        return methodMatches && startMatches && endMatches;
      })
    : [];

  const revenueCents = filteredSales.reduce(
    (sum, sale) =>
      sum + Math.round(getDemoPaymentTotal(sale) * 100),
    0
  );

  const revenue = revenueCents / 100;
  const totalOrders = filteredSales.length;

  const itemsSold = filteredSales.reduce(
    (sum, sale) =>
      sum + sale.items.reduce(
        (count, item) => count + item.quantity,
        0
      ),
    0
  );

  const averageOrder =
    totalOrders > 0 ? revenue / totalOrders : 0;

  const paymentMethods = ['KHQR', 'Cash'].map(method => ({
    name: method,
    amount: filteredSales
      .filter(sale => sale.method === method)
      .reduce(
        (sum, sale) => sum + getDemoPaymentTotal(sale),
        0
      )
  }));

  // Count products sold across all filtered paid orders.
  const productTotals = new Map();

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const current = productTotals.get(item.name) || {
        name: item.name,
        quantity: 0,
        revenue: 0
      };

      current.quantity += item.quantity;
      current.revenue += item.price * item.quantity;

      productTotals.set(item.name, current);
    });
  });

  const popularItems = [...productTotals.values()].sort(
    (a, b) =>
      b.quantity - a.quantity ||
      b.revenue - a.revenue
  );

  const maxQuantity = Math.max(
    1,
    ...popularItems.map(item => item.quantity)
  );

  function resetFilters() {
    setMethodFilter('All');
    setStartDate('');
    setEndDate('');
  }

  return (
    <section className="a-reports-page">
      <header className="a-reports-heading">
        <div>
          <span className="eyebrow">RESTAURANT ANALYTICS</span>
          <h1>Sales Reports</h1>
          <p>
            Understand sample revenue, payments, and bestselling dishes.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => downloadCSV(filteredSales)}
          disabled={!filteredSales.length}
        >
          <Icon name="download" size={18} />
          Export CSV
        </button>
      </header>

      <div className="a-reports-filter-panel">
        <label>
          Payment Method
          <select
            value={methodFilter}
            onChange={event => setMethodFilter(event.target.value)}
          >
            <option value="All">All Methods</option>
            <option value="KHQR">KHQR</option>
            <option value="Cash">Cash</option>
          </select>
        </label>

        <label>
          From
          <input
            type="date"
            value={startDate}
            onChange={event => setStartDate(event.target.value)}
          />
        </label>

        <label>
          To
          <input
            type="date"
            value={endDate}
            onChange={event => setEndDate(event.target.value)}
          />
        </label>

        <button
          type="button"
          className="a-reports-reset"
          onClick={resetFilters}
        >
          <Icon name="refresh" size={17} />
          Reset
        </button>

        <span className="a-reports-demo-label">
          Demo records · Oct 24, 2026
        </span>
      </div>

      {!validDates && (
        <p className="a-reports-error" role="alert">
          The start date must be before or equal to the end date.
        </p>
      )}

      <div className="a-report-stats">
        <SummaryCard
          label="Total Revenue"
          value={money(revenue)}
          hint="Paid demo orders"
          icon="file"
          tone="green"
        />

        <SummaryCard
          label="Paid Orders"
          value={totalOrders}
          hint="Matching transactions"
          icon="checkCircle"
          tone="blue"
        />

        <SummaryCard
          label="Average Order"
          value={money(averageOrder)}
          hint="Revenue per paid order"
          icon="bag"
          tone="amber"
        />

        <SummaryCard
          label="Items Sold"
          value={itemsSold}
          hint="Individual food and drink units"
          icon="utensils"
          tone="purple"
        />
      </div>

      <div className="a-reports-chart-grid">
        <section className="card a-reports-panel">
          <div className="a-reports-panel-head">
            <div>
              <h2>Daily Revenue</h2>
              <p>October 18–24 · Demonstration records</p>
            </div>
            <span className="a-reports-chart-key">Paid sales</span>
          </div>

          <DailyRevenueChart sales={filteredSales} />
          <p className="a-reports-chart-note">
            This chart uses the fixed demo week, not the current week.
            Only records from this seven-day period appear here.
          </p>
        </section>

        <section className="card a-reports-panel">
          <div className="a-reports-panel-head">
            <div>
              <h2>Payment Breakdown</h2>
              <p>Revenue by payment method</p>
            </div>
          </div>

          <div className="a-reports-methods">
            {paymentMethods.map(method => (
              <div className="a-reports-method" key={method.name}>
                <div className="a-reports-method-heading">
                  <strong>{method.name}</strong>
                  <span>{money(method.amount)}</span>
                </div>

                <div className="a-reports-track">
                  <span
                    className={
                      method.name === 'Cash'
                        ? 'is-amber'
                        : 'is-green'
                    }
                    style={{
                      width: `${
                        revenue > 0
                          ? (method.amount / revenue) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="a-reports-method-total">
            <span>Total filtered revenue</span>
            <strong>{money(revenue)}</strong>
          </div>
        </section>
      </div>

      <section className="card a-reports-panel">
        <div className="a-reports-panel-head">
          <div>
            <h2>Best-Selling Menu Items</h2>
            <p>Ranked by quantity sold in the demo transactions</p>
          </div>
        </div>

        {popularItems.length ? (
          <div className="a-reports-products">
            {popularItems.map((product, index) => {
              const item = menuItems.find(
                entry => entry.name === product.name
              );

              return (
                <div className="a-reports-product" key={product.name}>
                  <span className="a-reports-rank">
                    {index + 1}
                  </span>

                  <PopularImage item={item} />

                  <div className="a-reports-product-info">
                    <strong>{product.name}</strong>
                    <small>{product.quantity} sold · {money(product.revenue)}</small>

                    <div className="a-reports-track">
                      <span
                        className="is-green"
                        style={{
                          width: `${product.quantity / maxQuantity * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">
            No paid sales found for the selected filters.
          </p>
        )}
      </section>

      <section className="card a-reports-panel">
        <div className="a-reports-panel-head">
          <div>
            <h2>Sales Transactions</h2>
            <p>{filteredSales.length} paid transactions</p>
          </div>
          <span className="a-reports-demo-label">
            Sample records only
          </span>
        </div>

        <div className="table-scroll">
          <table className="a-reports-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>DATE</th>
                <th>TABLE</th>
                <th>METHOD</th>
                <th>ITEMS</th>
                <th>AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.orderId}>
                  <td><strong>{sale.orderId}</strong></td>
                  <td>{sale.date}</td>
                  <td>{sale.table}</td>
                  <td>
                    <span className={`a-report-method-pill ${
                      sale.method === 'Cash'
                        ? 'is-cash'
                        : 'is-khqr'
                    }`}>
                      {sale.method}
                    </span>
                  </td>
                  <td>
                    {sale.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                  </td>
                  <td><strong>{money(getDemoPaymentTotal(sale))}</strong></td>
                </tr>
              ))}

              {!filteredSales.length && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    No matching paid transactions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
