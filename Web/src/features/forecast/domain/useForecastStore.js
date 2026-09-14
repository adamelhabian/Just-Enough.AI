import { create } from 'zustand';
import { getForecastMockData, getImpactFactors, fetchRealForecast } from '../data/forecastService';
import { getStoredMode } from '../../../api/config';

export const useForecastStore = create((set, get) => ({
  forecastData: [],
  impactFactors: [],
  selectedProduct: 'All Products',
  isLoading: false,
  mode: 'LIVE',

  setSelectedProduct: (product) => {
    set({ selectedProduct: product });
    get().fetchForecastData(product);
  },

  fetchForecastData: async (overrideProduct) => {
    set({ isLoading: true });
    try {
      const prod = overrideProduct || get().selectedProduct;
      const mode = getStoredMode();
      if (mode === 'DEMO') {
        set({
          forecastData: getForecastMockData(),
          impactFactors: getImpactFactors(),
          mode: 'DEMO / SYNTHETIC',
          isLoading: false
        });
      } else {
        const result = await fetchRealForecast(prod);
        set({
          forecastData: result.forecastData,
          impactFactors: result.impactFactors,
          mode: result.mode,
          isLoading: false
        });
      }
    } catch (err) {
      set({
        forecastData: getForecastMockData(),
        impactFactors: getImpactFactors(),
        isLoading: false
      });
    }
  }
}));

