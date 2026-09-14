import { create } from 'zustand';
import { fetchLiveDashboard } from '../data/dashboardService';

export const useDashboardStore = create((set) => ({
  chartData: [],
  stats: null,
  isLoading: false,
  error: null,
  mode: 'LIVE',

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { chartData, stats, mode } = await fetchLiveDashboard();
      set({ chartData, stats, mode, isLoading: false, error: null });
    } catch (err) {
      set({
        error: err.message || 'SERVICE UNAVAILABLE: Backend demand engine offline.',
        isLoading: false
      });
    }
  }
}));
