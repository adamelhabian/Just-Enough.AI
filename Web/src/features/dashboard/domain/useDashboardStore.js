import { create } from 'zustand';
import { getDashboardMockData, getDashboardStats } from '../data/dashboardService';

export const useDashboardStore = create((set) => ({
  chartData: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call
      const data = getDashboardMockData();
      const stats = getDashboardStats();
      set({ chartData: data, stats, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to load dashboard data', isLoading: false });
    }
  }
}));
