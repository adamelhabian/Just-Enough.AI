export const mockKpiMetrics = [
  {
    id: 'total-ingredients',
    title: 'Total Ingredients',
    value: '42',
    unit: 'items tracked',
    change: '+3 this month',
    trend: 'neutral',
    icon: 'Boxes'
  },
  {
    id: 'low-stock',
    title: 'Low Stock Items',
    value: '5',
    unit: 'action required',
    change: '2 critical',
    trend: 'down',
    icon: 'AlertTriangle'
  },
  {
    id: 'overstock-risk',
    title: 'Overstock Risk',
    value: '3',
    unit: 'items > 7d supply',
    change: '-2 from last week',
    trend: 'up',
    icon: 'TrendingDown'
  },
  {
    id: 'days-coverage',
    title: 'Days of Coverage',
    value: '3.4',
    unit: 'days avg supply',
    change: 'Optimal range (3-5d)',
    trend: 'up',
    icon: 'Clock'
  }
];

export const mockInventoryData = [
  {
    id: 'ING-001',
    name: 'Fresh Chicken Breast',
    category: 'Poultry & Meat',
    currentStock: 24.0,
    requiredStock: 18.2,
    difference: '+5.8 kg',
    coverageDays: 3.2,
    unit: 'kg',
    status: 'Healthy',
    costPerUnit: '$8.50',
    lastUpdated: '10 mins ago',
    supplier: 'Green Valley Farms',
    expiryDays: 4
  },
  {
    id: 'ING-002',
    name: 'Prime Ground Beef',
    category: 'Poultry & Meat',
    currentStock: 8.0,
    requiredStock: 10.4,
    difference: '-2.4 kg',
    coverageDays: 0.8,
    unit: 'kg',
    status: 'Low Stock',
    costPerUnit: '$11.20',
    lastUpdated: '15 mins ago',
    supplier: 'Heritage Meats',
    expiryDays: 3
  },
  {
    id: 'ING-003',
    name: 'Artisan Flour (T55)',
    category: 'Dry Bakery',
    currentStock: 42.0,
    requiredStock: 35.0,
    difference: '+7.0 kg',
    coverageDays: 4.1,
    unit: 'kg',
    status: 'Healthy',
    costPerUnit: '$2.10',
    lastUpdated: '1 hour ago',
    supplier: 'Millstone Grains',
    expiryDays: 45
  },
  {
    id: 'ING-004',
    name: 'Aged Cheddar Cheese',
    category: 'Dairy',
    currentStock: 16.5,
    requiredStock: 8.0,
    difference: '+8.5 kg',
    coverageDays: 6.8,
    unit: 'kg',
    status: 'Overstock',
    costPerUnit: '$14.00',
    lastUpdated: '2 hours ago',
    supplier: 'Alpine Dairy',
    expiryDays: 14
  },
  {
    id: 'ING-005',
    name: 'Organic Whole Milk',
    category: 'Dairy',
    currentStock: 4.0,
    requiredStock: 14.5,
    difference: '-10.5 L',
    coverageDays: 0.3,
    unit: 'L',
    status: 'Critical',
    costPerUnit: '$1.85',
    lastUpdated: 'Just now',
    supplier: 'Organic Clover Co.',
    expiryDays: 2
  },
  {
    id: 'ING-006',
    name: 'Avocado (Hass)',
    category: 'Produce',
    currentStock: 3.5,
    requiredStock: 7.2,
    difference: '-3.7 kg',
    coverageDays: 0.5,
    unit: 'kg',
    status: 'Low Stock',
    costPerUnit: '$5.40',
    lastUpdated: '35 mins ago',
    supplier: 'SunState Produce',
    expiryDays: 2
  },
  {
    id: 'ING-007',
    name: 'Unsalted Butter',
    category: 'Dairy',
    currentStock: 18.0,
    requiredStock: 15.0,
    difference: '+3.0 kg',
    coverageDays: 3.6,
    unit: 'kg',
    status: 'Healthy',
    costPerUnit: '$6.20',
    lastUpdated: '3 hours ago',
    supplier: 'Alpine Dairy',
    expiryDays: 20
  },
  {
    id: 'ING-008',
    name: 'Espresso Coffee Beans',
    category: 'Beverage',
    currentStock: 25.0,
    requiredStock: 12.0,
    difference: '+13.0 kg',
    coverageDays: 8.2,
    unit: 'kg',
    status: 'Overstock',
    costPerUnit: '$18.50',
    lastUpdated: '4 hours ago',
    supplier: 'Roastworks Co.',
    expiryDays: 60
  },
  {
    id: 'ING-009',
    name: 'Fresh Tomatoes',
    category: 'Produce',
    currentStock: 12.0,
    requiredStock: 11.5,
    difference: '+0.5 kg',
    coverageDays: 2.1,
    unit: 'kg',
    status: 'Healthy',
    costPerUnit: '$3.20',
    lastUpdated: '45 mins ago',
    supplier: 'SunState Produce',
    expiryDays: 4
  },
  {
    id: 'ING-010',
    name: 'Free Range Eggs',
    category: 'Dairy & Eggs',
    currentStock: 180,
    requiredStock: 240,
    difference: '-60 units',
    coverageDays: 0.7,
    unit: 'units',
    status: 'Low Stock',
    costPerUnit: '$0.35',
    lastUpdated: '20 mins ago',
    supplier: 'Happy Hen Farm',
    expiryDays: 10
  }
];

export const mockAiAlerts = [
  {
    id: 'alert-1',
    type: 'low_stock',
    title: 'Low Stock Critical Warning',
    message: 'Order 5 kg more beef before tomorrow. Predicted Saturday lunch demand surge exceeds current buffer.',
    actionLabel: 'Reorder Now',
    impact: 'Avoid ~24 missed burger sales ($380 value)',
    severity: 'high'
  },
  {
    id: 'alert-2',
    type: 'overstock',
    title: 'Overstock Risk Detected',
    message: 'You have 8 kg excess flour based on predicted demand for next week. Consider adjusting recurring Monday supplier order.',
    actionLabel: 'View Impact',
    impact: 'Save up to $112 potential waste risk',
    severity: 'medium'
  },
  {
    id: 'alert-3',
    type: 'prep_recommendation',
    title: 'Production Efficiency Opportunity',
    message: 'Chicken inventory healthy (+5.8 kg buffer). AI recommends pre-marinating 12 kg for tomorrow’s forecasted demand peak.',
    actionLabel: 'Sync to Production Plan',
    impact: 'Reduce kitchen prep wait time by 18 mins',
    severity: 'info'
  }
];

export const mockUsageData = {
  Chicken: [
    { day: 'Mon', actual: 14.2, predicted: 14.5 },
    { day: 'Tue', actual: 12.8, predicted: 13.0 },
    { day: 'Wed', actual: 16.5, predicted: 16.0 },
    { day: 'Thu', actual: 18.2, predicted: 18.0 },
    { day: 'Fri', actual: 24.0, predicted: 23.8 },
    { day: 'Sat (F)', actual: null, predicted: 28.5 },
    { day: 'Sun (F)', actual: null, predicted: 22.0 }
  ],
  Beef: [
    { day: 'Mon', actual: 9.0, predicted: 9.5 },
    { day: 'Tue', actual: 8.5, predicted: 8.0 },
    { day: 'Wed', actual: 11.0, predicted: 10.8 },
    { day: 'Thu', actual: 10.4, predicted: 10.5 },
    { day: 'Fri', actual: 15.0, predicted: 14.8 },
    { day: 'Sat (F)', actual: null, predicted: 18.2 },
    { day: 'Sun (F)', actual: null, predicted: 12.5 }
  ],
  Flour: [
    { day: 'Mon', actual: 30.0, predicted: 29.0 },
    { day: 'Tue', actual: 32.0, predicted: 32.5 },
    { day: 'Wed', actual: 34.0, predicted: 33.8 },
    { day: 'Thu', actual: 35.0, predicted: 35.0 },
    { day: 'Fri', actual: 40.0, predicted: 41.0 },
    { day: 'Sat (F)', actual: null, predicted: 46.0 },
    { day: 'Sun (F)', actual: null, predicted: 38.0 }
  ],
  Cheese: [
    { day: 'Mon', actual: 6.2, predicted: 6.5 },
    { day: 'Tue', actual: 5.8, predicted: 6.0 },
    { day: 'Wed', actual: 7.5, predicted: 7.2 },
    { day: 'Thu', actual: 8.0, predicted: 8.0 },
    { day: 'Fri', actual: 11.2, predicted: 10.9 },
    { day: 'Sat (F)', actual: null, predicted: 13.5 },
    { day: 'Sun (F)', actual: null, predicted: 9.0 }
  ]
};

export const mockSettingsData = {
  business: {
    name: 'Artisan Kitchen & Bakery',
    type: 'Bakery & Cafe',
    location: '742 Evergreen Terrace, Downtown Square',
    openingHours: '07:00 AM - 09:00 PM',
    employees: '18 staff members',
    currency: 'USD ($)',
    timezone: 'America/New_York (EST)'
  },
  account: {
    name: 'Sarah Jenkins',
    email: 'sarah@artisankitchen.com',
    role: 'Head Operations & Kitchen Manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    twoFactorEnabled: true
  },
  forecast: {
    horizon: '7 days',
    sensitivity: 'High (0.85)',
    buffer: '10%',
    defaultUnit: 'kg',
    weatherIntegration: true,
    eventTracking: true
  },
  notifications: {
    lowStockAlerts: true,
    overstockAlerts: true,
    forecastUpdates: true,
    productionRecommendations: true,
    aiInsights: true,
    emailFrequency: 'Daily Summary',
    smsUrgentAlerts: true
  },
  integrations: [
    {
      id: 'square',
      name: 'Square POS',
      category: 'Point of Sale',
      description: 'Sync real-time sales transactions & itemized order history.',
      status: 'Connected',
      lastSync: '2 minutes ago',
      icon: 'CreditCard'
    },
    {
      id: 'toast',
      name: 'Toast POS',
      category: 'Point of Sale',
      description: 'Pull live kitchen ticket orders & table turnover metrics.',
      status: 'Connected',
      lastSync: '5 minutes ago',
      icon: 'Utensils'
    },
    {
      id: 'sap',
      name: 'SAP Business One',
      category: 'ERP System',
      description: 'Automate central warehouse purchasing orders and invoice sync.',
      status: 'Coming Soon',
      lastSync: 'N/A',
      icon: 'Database'
    },
    {
      id: 'clover',
      name: 'Clover POS',
      category: 'Point of Sale',
      description: 'Connect store checkout data with AI inventory forecasting.',
      status: 'Not Connected',
      lastSync: 'Never',
      icon: 'ShoppingCart'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      category: 'Accounting',
      description: 'Track ingredient food cost % and COGS automatically.',
      status: 'Connected',
      lastSync: '1 hour ago',
      icon: 'DollarSign'
    }
  ]
};

export const mockLandingStats = {
  wasteReduction: '23%',
  accuracy: '94.8%',
  activeBusinesses: '1,248+',
  avgSavings: '$1,450/mo'
};
