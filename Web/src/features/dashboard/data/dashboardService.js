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
    accuracy: "94.2%",
    wasteRisk: "Low",
    stockCoverage: "4.2 Days"
  };
};
