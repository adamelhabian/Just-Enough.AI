import { create } from 'zustand';
import { fetchLiveProductionItems, overrideRecommendationApi, fetchAuditLogsApi } from '../data/productionService';

export const useProductionStore = create((set, get) => ({
  items: [],
  auditLogs: [],
  isLoading: false,
  error: null,

  fetchProductionItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await fetchLiveProductionItems();
      const auditLogs = await fetchAuditLogsApi().catch(() => []);
      set({ items, auditLogs, isLoading: false });
    } catch (err) {
      set({
        error: err.message || 'SERVICE UNAVAILABLE: Failed to fetch production recommendations.',
        isLoading: false
      });
    }
  },

  overrideItem: async (id, newQty, reason) => {
    try {
      await overrideRecommendationApi(id, newQty, reason);
      // Reload recommendation state and audit logs directly from backend
      const items = await fetchLiveProductionItems();
      const auditLogs = await fetchAuditLogsApi().catch(() => []);
      set({ items, auditLogs });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}));
