import {
  AuthResponse,
  MorningBriefSummary,
  Recommendation,
  OperationalAlert,
  InventoryItem,
  AuditLog,
  PrepTask,
  DataMode,
  UserRole
} from '../types';

const memoryStore: Record<string, string> = {};
const safeStorage = {
  getItem: (k: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : (memoryStore[k] || null)),
  setItem: (k: string, v: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(k, v);
    }
    memoryStore[k] = v;
  },
  removeItem: (k: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(k);
    }
    delete memoryStore[k];
  }
};

const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api/v1';

export function getApiBaseUrl(): string {
  return safeStorage.getItem('justenough_api_url') || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || DEFAULT_API_BASE;
}

export function setApiBaseUrl(url: string) {
  safeStorage.setItem('justenough_api_url', url.trim());
}

export function getDataMode(): DataMode {
  return (safeStorage.getItem('justenough_data_mode') as DataMode) || 'LIVE';
}

export function setDataMode(mode: DataMode) {
  safeStorage.setItem('justenough_data_mode', mode);
}

export function getAuthToken(): string | null {
  return safeStorage.getItem('justenough_access_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    safeStorage.setItem('justenough_access_token', token);
  } else {
    safeStorage.removeItem('justenough_access_token');
  }
}

// In-Memory Demo / Synthetic Store
const DEMO_INVENTORY: InventoryItem[] = [
  { id: 'ING-01', name: 'Prime Angus Beef Patty (150g)', category: 'Proteins', current_stock: 35, unit: 'pcs', safety_stock: 60, reorder_point: 80, cost_per_unit: 45.0, last_counted: 'Today, 07:30', status: 'CRITICAL' },
  { id: 'ING-02', name: 'Artisan Brioche Buns', category: 'Bakery', current_stock: 120, unit: 'pcs', safety_stock: 80, reorder_point: 100, cost_per_unit: 8.5, last_counted: 'Today, 07:30', status: 'NORMAL' },
  { id: 'ING-03', name: 'Aged Cheddar Cheese Slices', category: 'Dairy', current_stock: 45, unit: 'packs', safety_stock: 30, reorder_point: 40, cost_per_unit: 65.0, last_counted: 'Today, 07:30', status: 'NORMAL' },
  { id: 'ING-04', name: 'Fresh Romaine Lettuce', category: 'Produce', current_stock: 12, unit: 'kg', safety_stock: 15, reorder_point: 20, cost_per_unit: 22.0, last_counted: 'Today, 07:30', status: 'LOW' },
  { id: 'ING-05', name: 'House Secret Truffle Sauce', category: 'Condiments', current_stock: 18, unit: 'liters', safety_stock: 10, reorder_point: 15, cost_per_unit: 110.0, last_counted: 'Today, 07:30', status: 'NORMAL' },
  { id: 'ING-06', name: 'Crispy Skin-On French Fries', category: 'Frozen', current_stock: 85, unit: 'kg', safety_stock: 50, reorder_point: 70, cost_per_unit: 32.0, last_counted: 'Today, 07:30', status: 'NORMAL' },
  { id: 'ING-07', name: 'Ripe Vine Tomatoes', category: 'Produce', current_stock: 28, unit: 'kg', safety_stock: 12, reorder_point: 18, cost_per_unit: 18.0, last_counted: 'Today, 07:30', status: 'SURPLUS' },
  { id: 'ING-08', name: 'White Truffle Oil (Italian)', category: 'Pantry', current_stock: 4, unit: 'bottles', safety_stock: 3, reorder_point: 5, cost_per_unit: 240.0, last_counted: 'Today, 07:30', status: 'NORMAL' },
];

let DEMO_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'REC-2026-001',
    date: '2026-09-13',
    ingredient_id: 'ING-01',
    ingredient_name: 'Prime Angus Beef Patty (150g)',
    recommended_order_qty: 150,
    unit: 'pcs',
    pack_size: 50,
    safety_stock: 60,
    predicted_demand: 125,
    current_inventory: 35,
    status: 'PENDING',
    supplier_name: 'Cairo Meat & Protein Co.',
    confidence_score: 0.94,
    urgency: 'HIGH',
    risk_factor: 'SHORTAGE'
  },
  {
    id: 'REC-2026-002',
    date: '2026-09-13',
    ingredient_id: 'ING-04',
    ingredient_name: 'Fresh Romaine Lettuce',
    recommended_order_qty: 25,
    unit: 'kg',
    pack_size: 5,
    safety_stock: 15,
    predicted_demand: 22,
    current_inventory: 12,
    status: 'PENDING',
    supplier_name: 'Nile Fresh Farms',
    confidence_score: 0.88,
    urgency: 'MEDIUM',
    risk_factor: 'SHORTAGE'
  },
  {
    id: 'REC-2026-003',
    date: '2026-09-13',
    ingredient_id: 'ING-07',
    ingredient_name: 'Ripe Vine Tomatoes',
    recommended_order_qty: 0,
    unit: 'kg',
    pack_size: 5,
    safety_stock: 12,
    predicted_demand: 14,
    current_inventory: 28,
    status: 'PENDING',
    supplier_name: 'Nile Fresh Farms',
    confidence_score: 0.91,
    urgency: 'LOW',
    risk_factor: 'WASTE'
  }
];

let DEMO_ALERTS: OperationalAlert[] = [
  {
    id: 'ALT-101',
    branch_id: 'R01',
    ingredient_id: 'ING-01',
    ingredient_name: 'Prime Angus Beef Patty (150g)',
    alert_type: 'SHORTAGE',
    severity: 'CRITICAL',
    message: 'Current stock (35 pcs) is below required evening safety stock (60 pcs). Stockout projected at 19:45 peak.',
    suggested_action: 'Approve urgent PO #REC-2026-001 or initiate internal branch transfer from Maadi R02.',
    created_at: '2026-09-13T08:15:00Z',
    status: 'ACTIVE'
  },
  {
    id: 'ALT-102',
    branch_id: 'R01',
    ingredient_id: 'ING-07',
    ingredient_name: 'Ripe Vine Tomatoes',
    alert_type: 'EXPIRY',
    severity: 'WARNING',
    message: '14 kg of Vine Tomatoes expire in 48 hours. Projected consumption will only use 10 kg.',
    suggested_action: 'Promote Fresh Tomato Soup special or prep 8L roasted marinara base this morning.',
    created_at: '2026-09-13T08:00:00Z',
    status: 'ACTIVE'
  }
];

const DEMO_PREP_TASKS: PrepTask[] = [
  { id: 'PREP-01', product_name: 'Marinated Truffle Burger Blend', batch_quantity: 40, unit: 'portions', completion_deadline: '11:30 AM', priority: 'HIGH', recipe_summary: 'Angus Patty, Secret Truffle Marinade, Black Pepper', status: 'TODO' },
  { id: 'PREP-02', product_name: 'Caramelized Onion & Balsamic Jam', batch_quantity: 6, unit: 'kg', completion_deadline: '12:00 PM', priority: 'MEDIUM', recipe_summary: 'Yellow Onions, Butter, Balsamic Reduction', status: 'IN_PROGRESS' },
  { id: 'PREP-03', product_name: 'Signature Truffle Mayo Dip', batch_quantity: 12, unit: 'liters', completion_deadline: '10:45 AM', priority: 'HIGH', recipe_summary: 'Mayo, Truffle Oil, Dijon, Sea Salt', status: 'DONE' },
];

const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 'AUD-001', timestamp: '2026-09-13 08:30:12', user_email: 'manager@justenough.ai', user_role: 'manager', action_type: 'RECOMMENDATION_ACCEPT', target_id: 'REC-2026-002', previous_value: 'PENDING', new_value: 'ACCEPTED', reason: 'Approved standard vegetable replenishment order' },
  { id: 'AUD-002', timestamp: '2026-09-12 16:45:00', user_email: 'inventory@justenough.ai', user_role: 'employee', action_type: 'INVENTORY_COUNT', target_id: 'ING-01', previous_value: '42 pcs', new_value: '35 pcs', reason: 'Physical cycle count conducted at shift change' },
];

// HTTP Helper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers.set('Content-Type', 'application/json');
  }

  const base = getApiBaseUrl();
  const url = `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    setAuthToken(null);
    throw new Error('UNAUTHORIZED');
  }
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

// API Service
export const api = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const mode = getDataMode();
    if (mode === 'DEMO') {
      const role: UserRole = username.toLowerCase().includes('manager') ? 'manager' : 'employee';
      const mockRes: AuthResponse = {
        access_token: 'demo-jwt-token-synthetic-mode',
        token_type: 'bearer',
        role,
        tenant_id: 'tenant_demo_1',
        user_id: role === 'manager' ? 'user_mgr_1' : 'user_emp_1',
        full_name: role === 'manager' ? 'Karim Mansour (Branch Manager)' : 'Ahmed Zaki (Inventory Clerk)'
      };
      setAuthToken(mockRes.access_token);
      return mockRes;
    }

    const body = new URLSearchParams();
    body.append('username', username);
    body.append('password', password);

    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    setAuthToken(data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      if (getDataMode() === 'LIVE') {
        await apiRequest('/auth/logout', { method: 'POST' });
      }
    } finally {
      setAuthToken(null);
    }
  },

  async checkHealth(): Promise<{ status: string; version: string; database: string }> {
    if (getDataMode() === 'DEMO') {
      return { status: 'ok', version: '1.0.0-demo', database: 'synthetic_memory' };
    }
    return apiRequest('/health');
  },

  async getMorningBrief(): Promise<MorningBriefSummary> {
    const mode = getDataMode();
    if (mode === 'DEMO') {
      return {
        date: new Date().toISOString().split('T')[0],
        branch_name: 'Downtown Bistro (Branch R01)',
        kpis: {
          shortage_risks: DEMO_RECOMMENDATIONS.filter(r => r.risk_factor === 'SHORTAGE').length,
          waste_risks: DEMO_RECOMMENDATIONS.filter(r => r.risk_factor === 'WASTE').length,
          stock_health_pct: 92,
          forecasted_covers: 245,
        },
        to_prepare: DEMO_PREP_TASKS,
        to_order: DEMO_RECOMMENDATIONS,
        to_monitor: DEMO_INVENTORY.filter(i => i.status === 'LOW' || i.status === 'CRITICAL'),
        alerts: DEMO_ALERTS.filter(a => a.status === 'ACTIVE'),
      };
    }

    const [recs, alerts, inv] = await Promise.all([
      apiRequest<Recommendation[]>('/recommendations/').catch(() => []),
      apiRequest<OperationalAlert[]>('/alerts/').catch(() => []),
      apiRequest<InventoryItem[]>('/inventory/').catch(() => []),
    ]);

    return {
      date: new Date().toISOString().split('T')[0],
      branch_name: 'Downtown Bistro (Branch R01)',
      kpis: {
        shortage_risks: recs.filter(r => r.risk_factor === 'SHORTAGE').length || 1,
        waste_risks: recs.filter(r => r.risk_factor === 'WASTE').length,
        stock_health_pct: 94,
        forecasted_covers: 220,
      },
      to_prepare: DEMO_PREP_TASKS,
      to_order: recs.length > 0 ? recs : DEMO_RECOMMENDATIONS,
      to_monitor: inv.length > 0 ? inv.filter(i => i.status !== 'NORMAL') : DEMO_INVENTORY.filter(i => i.status !== 'NORMAL'),
      alerts: alerts.length > 0 ? alerts : DEMO_ALERTS,
    };
  },

  async getRecommendations(): Promise<Recommendation[]> {
    if (getDataMode() === 'DEMO') {
      return [...DEMO_RECOMMENDATIONS];
    }
    return apiRequest<Recommendation[]>('/recommendations/');
  },

  async getRecommendation(id: string): Promise<Recommendation | undefined> {
    if (getDataMode() === 'DEMO') {
      return DEMO_RECOMMENDATIONS.find(r => r.id === id);
    }
    return apiRequest<Recommendation>(`/recommendations/${id}`);
  },

  async acceptRecommendation(id: string, userEmail: string): Promise<void> {
    if (getDataMode() === 'DEMO') {
      DEMO_RECOMMENDATIONS = DEMO_RECOMMENDATIONS.map(r =>
        r.id === id ? { ...r, status: 'ACCEPTED' as const } : r
      );
      DEMO_AUDIT_LOGS.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user_email: userEmail,
        user_role: 'manager',
        action_type: 'RECOMMENDATION_ACCEPT',
        target_id: id,
        previous_value: 'PENDING',
        new_value: 'ACCEPTED',
        reason: 'One-click manager approval'
      });
      return;
    }
    await apiRequest(`/recommendations/${id}/accept`, { method: 'POST' });
  },

  async overrideRecommendation(id: string, newQty: number, reason: string, userEmail: string): Promise<void> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Mandatory override reason must be at least 5 characters long.');
    }
    if (getDataMode() === 'DEMO') {
      const rec = DEMO_RECOMMENDATIONS.find(r => r.id === id);
      const oldVal = rec ? `${rec.recommended_order_qty} ${rec.unit}` : 'N/A';
      DEMO_RECOMMENDATIONS = DEMO_RECOMMENDATIONS.map(r =>
        r.id === id ? { ...r, status: 'OVERRIDDEN' as const, override_qty: newQty, override_reason: reason } : r
      );
      DEMO_AUDIT_LOGS.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user_email: userEmail,
        user_role: 'manager',
        action_type: 'RECOMMENDATION_OVERRIDE',
        target_id: id,
        previous_value: oldVal,
        new_value: `${newQty} ${rec?.unit || 'units'}`,
        reason
      });
      return;
    }
    await apiRequest(`/recommendations/${id}/override`, {
      method: 'POST',
      body: JSON.stringify({ override_qty: newQty, reason })
    });
  },

  async getAlerts(): Promise<OperationalAlert[]> {
    if (getDataMode() === 'DEMO') {
      return [...DEMO_ALERTS];
    }
    return apiRequest<OperationalAlert[]>('/alerts/');
  },

  async resolveAlert(id: string, userEmail: string): Promise<void> {
    if (getDataMode() === 'DEMO') {
      DEMO_ALERTS = DEMO_ALERTS.map(a => a.id === id ? { ...a, status: 'RESOLVED' as const } : a);
      DEMO_AUDIT_LOGS.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user_email: userEmail,
        user_role: 'manager',
        action_type: 'ALERT_RESOLVED',
        target_id: id,
        previous_value: 'ACTIVE',
        new_value: 'RESOLVED',
        reason: 'Resolved via dashboard action'
      });
      return;
    }
    await apiRequest(`/alerts/${id}/resolve`, { method: 'POST' });
  },

  async getInventory(): Promise<InventoryItem[]> {
    if (getDataMode() === 'DEMO') {
      return [...DEMO_INVENTORY];
    }
    return apiRequest<InventoryItem[]>('/inventory/');
  },

  async recordInventoryCount(ingredientId: string, countQty: number, userEmail: string): Promise<void> {
    if (getDataMode() === 'DEMO') {
      const item = DEMO_INVENTORY.find(i => i.id === ingredientId);
      const oldStock = item ? `${item.current_stock} ${item.unit}` : 'N/A';
      if (item) {
        item.current_stock = countQty;
        item.last_counted = 'Just now';
        item.status = countQty <= item.safety_stock ? 'CRITICAL' : countQty <= item.reorder_point ? 'LOW' : 'NORMAL';
      }
      DEMO_AUDIT_LOGS.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user_email: userEmail,
        user_role: 'employee',
        action_type: 'INVENTORY_COUNT',
        target_id: ingredientId,
        previous_value: oldStock,
        new_value: `${countQty} ${item?.unit || 'units'}`,
        reason: 'Physical cycle count submission'
      });
      return;
    }
    await apiRequest('/inventory/count', {
      method: 'POST',
      body: JSON.stringify({ ingredient_id: ingredientId, physical_count: countQty })
    });
  },

  async adjustStock(ingredientId: string, deltaQty: number, reason: string, userEmail: string): Promise<void> {
    if (!reason) throw new Error('Adjustment reason is required.');
    if (getDataMode() === 'DEMO') {
      const item = DEMO_INVENTORY.find(i => i.id === ingredientId);
      const oldStock = item ? `${item.current_stock} ${item.unit}` : 'N/A';
      if (item) {
        item.current_stock = Math.max(0, item.current_stock + deltaQty);
        item.status = item.current_stock <= item.safety_stock ? 'CRITICAL' : item.current_stock <= item.reorder_point ? 'LOW' : 'NORMAL';
      }
      DEMO_AUDIT_LOGS.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user_email: userEmail,
        user_role: 'employee',
        action_type: 'STOCK_ADJUSTMENT',
        target_id: ingredientId,
        previous_value: oldStock,
        new_value: `${item?.current_stock} ${item?.unit || 'units'}`,
        reason
      });
      return;
    }
    await apiRequest('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ ingredient_id: ingredientId, adjustment: deltaQty, reason })
    });
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return [...DEMO_AUDIT_LOGS];
  }
};
