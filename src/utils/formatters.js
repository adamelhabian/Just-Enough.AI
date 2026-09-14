export const formatCurrency = (val) => {
  if (typeof val === 'number') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }
  return val;
};

export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'healthy':
      return 'badge-healthy';
    case 'low stock':
      return 'badge-low';
    case 'overstock':
      return 'badge-overstock';
    case 'critical':
      return 'badge-critical';
    default:
      return 'badge-healthy';
  }
};
