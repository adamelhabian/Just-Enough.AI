import { create } from 'zustand';
import { getProductionItems } from '../data/productionService';

export const useProductionStore = create((set) => ({
  items: [],
  isLoading: false,

  fetchProductionItems: async () => {
    set({ isLoading: true });
    try {
      const data = getProductionItems();
      set({ items: data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  updateItemStatus: (id, status) => set((state) => ({
    items: state.items.map(item => item.id === id ? { ...item, status } : item)
  }))
}));
