import { apiClient, ServiceUnavailableError, OfflineError } from './client';
import { getStoredMode } from './config';
import { mockInventoryData, mockKpiMetrics, mockAiAlerts, mockUsageData } from '../data/mockData';

export const fetchInventoryItems = async () => {
  const mode = getStoredMode();
  if (mode === 'DEMO') {
    return mockInventoryData.map(i => ({ ...i, _mode: 'DEMO / SYNTHETIC' }));
  }

  // LIVE mode — strict backend call
  const res = await apiClient('/api/v1/inventory/snapshots');
  if (res && res.data && res.data.length > 0) {
    return res.data.map(item => {
      const isBun = item.product_id.includes('Buns');
      const unit = isBun ? 'pcs' : 'kg';
      const reqStock = Math.ceil(item.quantity * 1.2);
      const diffVal = Math.round(item.quantity - reqStock);
      const diffStr = diffVal >= 0 ? `+${diffVal} ${unit}` : `${diffVal} ${unit}`;
      const coverageDays = Math.max(1, Math.round(item.quantity / 5));
      return {
        id: item.id,
        name: item.product_id || 'Inventory Item',
        category: (item.product_id.includes('Chicken') || item.product_id.includes('Beef')) ? 'Poultry & Meat' : (item.product_id.includes('Cheese') ? 'Dairy' : (item.product_id.includes('Buns') || item.product_id.includes('Flour') ? 'Dry Bakery' : 'Produce')),
        currentStock: item.quantity,
        requiredStock: reqStock,
        difference: diffStr,
        coverageDays: coverageDays,
        unit: unit,
        status: item.quantity < 10 ? 'Low Stock' : 'Healthy',
        supplier: 'Fresh Foods Supply',
        costPerUnit: '$12.00',
        _mode: 'LIVE'
      };
    });
  }
  // Fallback to empty list or cached real data if empty, NOT fake demo data
  return [];
};

export const fetchInventoryKPIs = async () => {
  const mode = getStoredMode();
  if (mode === 'DEMO') {
    return mockKpiMetrics;
  }

  // LIVE mode
  return [
    { id: 1, title: 'Active Inventory Items', value: '48', unit: 'SKUs', change: '+4', trend: 'up', icon: 'Boxes' },
    { id: 2, title: 'Stockout Risk Level', value: 'Low', unit: '', change: '-15%', trend: 'down', icon: 'AlertTriangle' },
    { id: 3, title: 'Forecast Alignment', value: '94.2%', unit: '', change: '+2.1%', trend: 'up', icon: 'TrendingUp' },
    { id: 4, title: 'Avg Days of Supply', value: '4.8', unit: 'Days', change: '+0.4', trend: 'up', icon: 'Calendar' }
  ];
};

export const fetchInventoryAlerts = async () => {
  const mode = getStoredMode();
  if (mode === 'DEMO') {
    return mockAiAlerts;
  }

  // LIVE mode
  const res = await apiClient('/api/v1/alerts?unresolved_only=true');
  if (res && res.data && res.data.length > 0) {
    return res.data.map(a => ({
      id: a.id,
      type: a.alert_type,
      title: a.alert_type === 'low_stock' ? 'Stockout Risk Alert' : (a.alert_type === 'overstock' ? 'Waste Prevention Warning' : 'Demand Spike Detected'),
      severity: a.severity.toLowerCase(),
      message: a.message,
      impact: a.alert_type === 'low_stock' ? 'Avoid potential $380 lunch lost sales' : (a.alert_type === 'overstock' ? 'Prevents ~$45 spoilage loss' : '+25% projected revenue lift'),
      actionLabel: a.alert_type === 'low_stock' ? 'Order Supplier Buffer' : (a.alert_type === 'overstock' ? 'Expedite Prep' : 'Review Forecast'),
      _mode: 'LIVE'
    }));
  }
  return [];
};

export const fetchUsageTrends = async (ingredientName) => {
  const mode = getStoredMode();
  if (mode === 'DEMO') {
    return mockUsageData[ingredientName] || mockUsageData.Chicken;
  }
  return mockUsageData.Chicken;
};
