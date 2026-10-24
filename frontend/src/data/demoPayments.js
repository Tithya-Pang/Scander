
export const demoPayments = [
  {
    orderId: '#1024',
    table: 'Table 04',
    date: '2026-10-24',
    method: null,
    status: 'Unpaid',
    items: [
      { name: 'Iced Latte', quantity: 1, price: 3.50 },
      { name: 'Fried Rice', quantity: 2, price: 4.50 }
    ]
  },
  {
    orderId: '#1025',
    table: 'Table 02',
    date: '2026-10-24',
    method: null,
    status: 'Unpaid',
    items: [
      { name: 'Chicken Sandwich', quantity: 1, price: 5.25 },
      { name: 'Cappuccino', quantity: 1, price: 3.75 }
    ]
  },
  {
    orderId: '#1026',
    table: 'Table 07',
    date: '2026-10-24',
    method: null,
    status: 'Unpaid',
    items: [
      { name: 'Cappuccino', quantity: 2, price: 3.75 }
    ]
  },
  {
    orderId: '#1027',
    table: 'Table 01',
    date: '2026-10-24',
    method: 'KHQR',
    status: 'Paid',
    items: [
      { name: 'Avocado Toast', quantity: 2, price: 4.75 },
      { name: 'Iced Latte', quantity: 2, price: 3.50 }
    ]
  },
  {
    orderId: '#1028',
    table: 'Table 05',
    date: '2026-10-24',
    method: 'Cash',
    status: 'Paid',
    items: [
      { name: 'Cappuccino', quantity: 1, price: 3.75 },
      { name: 'Chocolate Cake', quantity: 1, price: 4.25 }
    ]
  }
];

export function getDemoPaymentTotal(payment) {
  const cents = payment.items.reduce(
    (sum, item) =>
      sum + Math.round(item.price * 100) * item.quantity,
    0
  );

  return cents / 100;
}
