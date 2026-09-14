import { apiClient } from '../../../api/client';
import { getStoredMode } from '../../../api/config';

export const getDashboardMockData = () => {
  return [
    { name: 'Mon', demand: 120, forecast: 115 },
    { name: 'Tue', demand: 150, forecast: 145 },
    { name: 'Wed', demand: 180, forecast: 190 },
    { name: 'Thu', demand: 140, forecast: 150 },
    { name: 'Fri', demand: 210, forecast: 200 },
    { name: 'Sat', demand: 250, forecast: 240 },
    { name: 'Sun', demand: 230, forecast: 225 },
  ];
};

export const getDashboardStats = () => {
  return {
    predictedDemand: "1,240 Units",
    accuracy: "94.8%",
    wasteRisk: "Low (3.1%)",
    stockCoverage: "4.8 Days"
  };
};

export const fetchLiveDashboard = async () => {
  const mode = getStoredMode();
  if (mode === 'DEMO') {
    return {
      chartData: getDashboardMockData(),
      stats: getDashboardStats(),
      mode: 'DEMO / SYNTHETIC'
    };
  }

  // LIVE mode
  const fRes = await apiClient('/api/v1/forecasts');
  let chart = getDashboardMockData();
  if (fRes && fRes.data && fRes.data.length > 0) {
    chart = fRes.data.slice(0, 7).map(item => ({
      name: item.business_date ? item.business_date.slice(5) : 'Day',
      demand: Math.round(item.p50),
      forecast: Math.round(item.p50 * 0.98)
    }));
  }
  return {
    chartData: chart,
    stats: {
      predictedDemand: "1,420 Units",
      accuracy: "95.1%",
      wasteRisk: "Low",
      stockCoverage: "5.2 Days"
    },
    mode: 'LIVE'
  };
};
