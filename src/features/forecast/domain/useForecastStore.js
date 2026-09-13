import { create } from 'zustand';
import { getForecastMockData, getImpactFactors } from '../data/forecastService';

export const useForecastStore = create((set) => ({
  forecastData: [],
  impactFactors: [],
  selectedProduct: 'All Products',
  isLoading: false,

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  fetchForecastData: async () => {
    set({ isLoading: true });
    try {
      const data = getForecastMockData();
      const factors = getImpactFactors();
      set({ forecastData: data, impactFactors: factors, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  }
}));
