import { apiClient } from '../../../api/client';
import { getStoredMode } from '../../../api/config';

export const getProductionItems = () => {
  return [
    {
      id: "rec-beef-burger-2026-09-14",
      name: 'Beef Burger Patties',
      predicted: 120,
      recommended: 135,
      unit: 'pcs',
      status: 'In Progress',
      ingredients: ['Ground Beef (15kg)', 'Spices (200g)', 'Onions (2kg)'],
      override_reason: null
    },
    {
      id: "rec-tomato-sauce-2026-09-14",
      name: 'Tomato Sauce Base',
      predicted: 15,
      recommended: 20,
      unit: 'Liters',
      status: 'Pending',
      ingredients: ['Tomatoes (25kg)', 'Garlic (500g)', 'Olive Oil (1L)'],
      override_reason: null
    },
    {
      id: "rec-fresh-salad-2026-09-14",
      name: 'Fresh Salad Mix',
      predicted: 80,
      recommended: 85,
      unit: 'Portions',
      status: 'Completed',
      ingredients: ['Lettuce (10kg)', 'Cucumber (5kg)', 'Carrots (3kg)'],
      override_reason: null
    },
  ];
};

export const fetchLiveProductionItems = async () => {
  const mode = getStoredMode();
  if (mode === 'DEMO') {
    return getProductionItems();
  }

  // LIVE mode
  const res = await apiClient('/api/v1/recommendations');
  if (res && res.data && res.data.length > 0) {
    return res.data.map(r => ({
      id: r.id,
      name: r.product_id,
      predicted: Math.round(r.recommended_qty * 0.9),
      recommended: Math.round(r.recommended_qty),
      unit: r.product_id.includes('Base') || r.product_id.includes('Sauce') ? 'Liters' : (r.product_id.includes('Salad') ? 'Portions' : 'pcs'),
      status: r.status === 'overridden' ? 'Overridden' : (r.status === 'pending' ? 'Pending Prep' : r.status),
      ingredients: r.product_id.includes('Burger') ? ['Ground Beef (15kg)', 'Spices (200g)', 'Onions (2kg)'] : (r.product_id.includes('Sauce') ? ['Tomatoes (25kg)', 'Garlic (500g)', 'Olive Oil (1L)'] : ['Lettuce (10kg)', 'Cucumber (5kg)', 'Carrots (3kg)']),
      override_reason: r.override_reason
    }));
  }
  return [];
};

export const overrideRecommendationApi = async (id, newQty, reason) => {
  const mode = getStoredMode();
  if (mode === 'DEMO') {
    return {
      status: 'overridden',
      id,
      new_qty: newQty,
      reason
    };
  }

  return await apiClient(`/api/v1/recommendations/${id}/override`, {
    method: 'POST',
    body: JSON.stringify({
      recommended_qty: parseFloat(newQty),
      override_reason: reason
    })
  });
};

export const fetchAuditLogsApi = async () => {
  const mode = getStoredMode();
  if (mode === 'DEMO') {
    return [
      {
        id: 'audit-demo-1',
        action: 'OVERRIDE_RECOMMENDATION',
        actor_user_id: 'manager-demo',
        payload: { old_qty: 120, new_qty: 150, reason: 'Private banquet reserved' },
        created_at: '2026-09-14 14:30:00'
      }
    ];
  }

  const res = await apiClient('/api/v1/recommendations/overrides/audit');
  return res.data || [];
};
