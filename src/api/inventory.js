import { apiClient } from './client';
import { mockInventoryData, mockKpiMetrics, mockAiAlerts, mockUsageData } from '../data/mockData';

export const fetchInventoryItems = async () => {
  try {
    return await apiClient('/api/v1/inventory');
  } catch (err) {
    return mockInventoryData;
  }
};

export const fetchInventoryKPIs = async () => {
  try {
    return await apiClient('/api/v1/inventory/kpi');
  } catch (err) {
    return mockKpiMetrics;
  }
};

export const fetchInventoryAlerts = async () => {
  try {
    return await apiClient('/api/v1/inventory/alerts');
  } catch (err) {
    return mockAiAlerts;
  }
};

export const fetchUsageTrends = async (ingredientName) => {
  try {
    return await apiClient(`/api/v1/inventory/usage?ingredient=${ingredientName}`);
  } catch (err) {
    return mockUsageData[ingredientName] || mockUsageData.Chicken;
  }
};
