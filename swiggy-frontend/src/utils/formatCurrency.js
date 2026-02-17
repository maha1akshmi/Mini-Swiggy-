export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const map = {
    PLACED: '#f59e0b',
    CONFIRMED: '#3b82f6',
    PREPARING: '#8b5cf6',
    OUT_FOR_DELIVERY: '#06b6d4',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
  };
  return map[status] || '#6b7280';
};
