export const orderStages = [
  { status: 'RECEIVED', label: 'Received', icon: 'inbox', description: 'Your order has been received.' },
  { status: 'PREPARING', label: 'Preparing', icon: 'flame', description: 'The kitchen is preparing your food.' },
  { status: 'READY', label: 'Ready', icon: 'cloche', description: 'Your food is ready to be served.' },
  { status: 'SERVED', label: 'Served', icon: 'checkCircle', description: 'Enjoy your meal. Thank you for dining with us!' },
];

export function getTableContext(search) {
  const params = new URLSearchParams(search);
  return params.get('table') || params.get('tableId') || params.get('table_id') || '';
}

