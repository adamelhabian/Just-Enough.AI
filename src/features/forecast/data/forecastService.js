export const getForecastMockData = () => {
  return [
    { date: '2026-09-07', actual: 45, predicted: 48, confidenceLower: 42, confidenceUpper: 54 },
    { date: '2026-09-08', actual: 52, predicted: 50, confidenceLower: 45, confidenceUpper: 55 },
    { date: '2026-09-09', actual: 48, predicted: 55, confidenceLower: 50, confidenceUpper: 60 },
    { date: '2026-09-10', actual: 61, predicted: 58, confidenceLower: 52, confidenceUpper: 64 },
    { date: '2026-09-11', actual: null, predicted: 75, confidenceLower: 68, confidenceUpper: 82 },
    { date: '2026-09-12', actual: null, predicted: 88, confidenceLower: 80, confidenceUpper: 96 },
    { date: '2026-09-13', actual: null, predicted: 82, confidenceLower: 75, confidenceUpper: 89 },
  ];
};

export const getImpactFactors = () => {
  return [
    { type: 'Weather', val: 'Sunny, 24°C', impact: '+18% Demand', icon: 'sun' },
    { type: 'Holidays', val: 'No active holidays', impact: 'Neutral', icon: 'calendar' },
    { type: 'Local Events', val: 'Concert at Stadium', impact: '+25% Demand', icon: 'users' }
  ];
};
