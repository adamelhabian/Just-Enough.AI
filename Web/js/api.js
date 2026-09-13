// api.js - API Client with Strict DEFAULT = LIVE & No Silent Demo Fallback
import { CONFIG } from './config.js';
import { storage } from './storage.js';

export class OfflineError extends Error {
  constructor(message = 'Network connection offline.') {
    super(message);
    this.name = 'OfflineError';
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message = 'Live backend service unreachable.') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

// In-memory demo data for EXPLICIT demo mode only
export const DEMO_STORE = {
  brief: {
    date: '2026-09-13',
    branch_name: 'Downtown Flagship (R01)',
    kpis: {
      stock_health_pct: 94.2,
      pending_prep_count: 3,
      pending_orders_count: 4,
      active_alerts_count: 2
    },
    to_prepare: [
      { id: 'PREP-01', item_name: 'Marinated Chicken Shawarma', target_qty: 45, unit: 'kg', priority: 'HIGH', recipe_summary: 'BOM: 45kg Chicken, 1.2kg Spice Blend, 3L Olive Oil' },
      { id: 'PREP-02', item_name: 'Fresh Garlic Dip (Toum)', target_qty: 25, unit: 'liters', priority: 'MEDIUM', recipe_summary: 'BOM: 6kg Garlic, 18L Vegetable Oil, 1L Lemon Juice' },
      { id: 'PREP-03', item_name: 'Tahini Sesame Sauce', target_qty: 18, unit: 'liters', priority: 'LOW', recipe_summary: 'BOM: 10kg Raw Sesame Paste, 8L Warm Water, Cumin' }
    ],
    to_order: [
      { id: 'ORD-01', ingredient: 'Fresh Boneless Chicken Thighs', recommended_qty: 120, unit: 'kg', supplier: 'Al-Watania Poultry', lead_time_days: 1, moq: 50 },
      { id: 'ORD-02', ingredient: 'High-Oleic Frying Oil', recommended_qty: 80, unit: 'liters', supplier: 'Delta Oils & Grains', lead_time_days: 2, moq: 40 },
      { id: 'ORD-03', ingredient: 'Fresh Unbleached Flatbread', recommended_qty: 400, unit: 'pieces', supplier: 'Mansoura Bakery Co', lead_time_days: 1, moq: 200 },
      { id: 'ORD-04', ingredient: 'Pickled Cucumber Spears', recommended_qty: 30, unit: 'kg', supplier: 'Nile Harvest Foods', lead_time_days: 3, moq: 15 }
    ],
    to_monitor: [
      { id: 'MON-01', item_name: 'Mozzarella Shredded Cheese', risk_factor: 'Perishable expiration approaching in 48 hours', current_stock: 22, unit: 'kg' },
      { id: 'MON-02', item_name: 'Fresh Mint Leaves', risk_factor: 'High daily consumption variance observed (+35%)', current_stock: 4, unit: 'kg' }
    ],
    alerts: [
      { id: 'ALT-01', title: 'Critical Stockout Risk', severity: 'CRITICAL', category: 'SUPPLY', message: 'Chicken Thigh inventory projected to hit 0 kg before tomorrow 2:00 PM lunch service.', suggested_action: 'Place expedited purchase order with Al-Watania before 6:00 PM cutoff.' },
      { id: 'ALT-02', title: 'Lead Time Variance Alert', severity: 'WARNING', category: 'SUPPLIER', message: 'Delta Oils delivery lead time extended from 1 to 2 business days.', suggested_action: 'Increase buffer threshold by 15% for all cooking oil SKUs.' }
    ]
  },
  inventory: [
    { id: 'INV-101', name: 'Boneless Chicken Thighs', category: 'Meat & Poultry', current_stock: 14.5, unit: 'kg', safety_stock: 30.0, status: 'CRITICAL', last_counted: '2026-09-13 14:00' },
    { id: 'INV-102', name: 'High-Oleic Frying Oil', category: 'Oils & Fats', current_stock: 35.0, unit: 'liters', safety_stock: 40.0, status: 'WARNING', last_counted: '2026-09-13 12:30' },
    { id: 'INV-103', name: 'Fresh Garlic Bulbs', category: 'Produce', current_stock: 18.0, unit: 'kg', safety_stock: 10.0, status: 'HEALTHY', last_counted: '2026-09-13 09:15' },
    { id: 'INV-104', name: 'Fresh Flatbread Packs', category: 'Bakery', current_stock: 120, unit: 'packs', safety_stock: 150, status: 'WARNING', last_counted: '2026-09-13 15:30' },
    { id: 'INV-105', name: 'Mozzarella Shredded Cheese', category: 'Dairy', current_stock: 22.0, unit: 'kg', safety_stock: 15.0, status: 'HEALTHY', last_counted: '2026-09-13 08:45' }
  ],
  recommendations: [
    { id: 'REC-2026-001', item_name: 'Boneless Chicken Thighs', current_stock: 14.5, recommended_qty: 120, unit: 'kg', confidence: 0.94, explanation: 'LightGBM model forecasted 78kg consumption over next 48h; existing stock below safety buffer.', supplier: 'Al-Watania Poultry', lead_time_days: 1, status: 'PENDING', override_qty: null, override_reason: null, overridden_by: null },
    { id: 'REC-2026-002', item_name: 'High-Oleic Frying Oil', current_stock: 35.0, recommended_qty: 80, unit: 'liters', confidence: 0.88, explanation: 'Safety stock replenishment triggered based on 2-day lead time.', supplier: 'Delta Oils', lead_time_days: 2, status: 'PENDING', override_qty: null, override_reason: null, overridden_by: null }
  ],
  audit: [
    { id: 'AUD-8801', timestamp: '2026-09-13 18:22:10', user_email: 'manager@justenough.ai', action: 'RECOMMENDATION_OVERRIDE', details: 'Overrode Chicken Thigh order from 100kg to 120kg (Reason: Friday dinner rush)' },
    { id: 'AUD-8802', timestamp: '2026-09-13 15:35:40', user_email: 'employee@justenough.ai', action: 'INVENTORY_COUNT_RECONCILE', details: 'Adjusted Flatbread count from 115 to 120 packs after delivery unpack.' }
  ]
};

async function executeLiveRequest(endpoint, cacheKey, options = {}) {
  // Check browser offline status
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const cached = storage.getCachedRealData(cacheKey);
    if (cached) {
      return { ...cached.data, _dataSource: 'CACHED_REAL_DATA', _cachedAt: cached.cachedAt };
    }
    throw new OfflineError('OFFLINE: Internet connection unavailable and no cached real data present.');
  }

  const token = storage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const resp = await fetch(`${CONFIG.apiBaseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!resp.ok) {
      // 503 or server failure
      const cached = storage.getCachedRealData(cacheKey);
      if (cached) {
        return { ...cached.data, _dataSource: 'CACHED_REAL_DATA', _cachedAt: cached.cachedAt };
      }
      throw new ServiceUnavailableError(`SERVICE UNAVAILABLE: Live API returned status ${resp.status}`);
    }

    const data = await resp.json();
    storage.setCachedRealData(cacheKey, data);
    return { ...data, _dataSource: 'LIVE' };
  } catch (err) {
    // Check if network failed
    if (err instanceof OfflineError || err instanceof ServiceUnavailableError) {
      throw err;
    }
    const cached = storage.getCachedRealData(cacheKey);
    if (cached) {
      return { ...cached.data, _dataSource: 'CACHED_REAL_DATA', _cachedAt: cached.cachedAt };
    }
    throw new ServiceUnavailableError(`SERVICE UNAVAILABLE: Failed to reach live backend at ${CONFIG.apiBaseUrl}${endpoint} (${err.message}). Zero-fabrication law: synthetic demo data is NEVER automatically displayed.`);
  }
}

export const api = {
  async login(email, password) {
    const mode = storage.getMode();
    if (mode === 'DEMO') {
      const role = email.includes('employee') ? 'employee' : 'manager';
      return {
        access_token: 'demo_token_' + Date.now(),
        role: role,
        tenant_id: 'tenant_demo_1',
        user: { email, name: role === 'manager' ? 'Branch Manager' : 'Inventory Specialist', role },
        _dataSource: 'DEMO_SYNTHETIC'
      };
    }

    // LIVE mode authentication
    try {
      const resp = await fetch(`${CONFIG.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!resp.ok) {
        throw new Error(`Authentication failed with status ${resp.status}`);
      }
      const data = await resp.json();
      return { ...data, _dataSource: 'LIVE' };
    } catch (err) {
      throw new ServiceUnavailableError(`SERVICE UNAVAILABLE: Live authentication service is currently unreachable (${err.message}).`);
    }
  },

  async getMorningBrief() {
    if (storage.getMode() === 'DEMO') {
      return { ...DEMO_STORE.brief, _dataSource: 'DEMO_SYNTHETIC' };
    }
    return await executeLiveRequest('/brief', CONFIG.storageKeys.cachedBrief);
  },

  async getInventory() {
    if (storage.getMode() === 'DEMO') {
      return { items: DEMO_STORE.inventory, _dataSource: 'DEMO_SYNTHETIC' };
    }
    return await executeLiveRequest('/inventory', CONFIG.storageKeys.cachedInventory);
  },

  async getAlerts() {
    if (storage.getMode() === 'DEMO') {
      return { alerts: DEMO_STORE.brief.alerts, _dataSource: 'DEMO_SYNTHETIC' };
    }
    return await executeLiveRequest('/alerts', CONFIG.storageKeys.cachedAlerts);
  },

  async getRecommendations() {
    if (storage.getMode() === 'DEMO') {
      return { recommendations: DEMO_STORE.recommendations, _dataSource: 'DEMO_SYNTHETIC' };
    }
    return await executeLiveRequest('/recommendations', CONFIG.storageKeys.cachedRecommendations);
  },

  async overrideRecommendation(id, newQty, reason, userEmail) {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Mandatory override reason must be at least 5 characters long.');
    }
    if (storage.getMode() === 'DEMO') {
      const rec = DEMO_STORE.recommendations.find(r => r.id === id);
      if (rec) {
        rec.override_qty = Number(newQty);
        rec.override_reason = reason.trim();
        rec.overridden_by = userEmail;
        rec.status = 'OVERRIDDEN';
      }
      DEMO_STORE.audit.unshift({
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user_email: userEmail,
        action: 'RECOMMENDATION_OVERRIDE',
        details: `[DEMO] Overrode ${id} quantity to ${newQty} (Reason: ${reason})`
      });
      return { success: true, updated: rec, _dataSource: 'DEMO_SYNTHETIC' };
    }

    const token = storage.getToken();
    const resp = await fetch(`${CONFIG.apiBaseUrl}/recommendations/${id}/override`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ override_qty: Number(newQty), reason: reason.trim() })
    });
    if (!resp.ok) throw new ServiceUnavailableError(`SERVICE UNAVAILABLE: Failed to submit override to live backend (Status ${resp.status})`);
    return await resp.json();
  },

  async adjustInventory(id, newCount, reason, userEmail) {
    if (storage.getMode() === 'DEMO') {
      const item = DEMO_STORE.inventory.find(i => i.id === id);
      if (item) {
        const delta = Number(newCount) - item.current_stock;
        item.current_stock = Number(newCount);
        item.last_counted = new Date().toISOString().replace('T', ' ').slice(0, 16);
        DEMO_STORE.audit.unshift({
          id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          user_email: userEmail,
          action: 'INVENTORY_ADJUSTMENT',
          details: `[DEMO] Adjusted ${item.name} (${id}) to ${newCount} ${item.unit} (Delta: ${delta > 0 ? '+' : ''}${delta})`
        });
      }
      return { success: true, _dataSource: 'DEMO_SYNTHETIC' };
    }

    const token = storage.getToken();
    const resp = await fetch(`${CONFIG.apiBaseUrl}/inventory/${id}/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ count: Number(newCount), reason })
    });
    if (!resp.ok) throw new ServiceUnavailableError(`SERVICE UNAVAILABLE: Failed to submit inventory adjustment (Status ${resp.status})`);
    return await resp.json();
  },

  async getAuditLogs() {
    if (storage.getMode() === 'DEMO') {
      return { logs: DEMO_STORE.audit, _dataSource: 'DEMO_SYNTHETIC' };
    }
    return await executeLiveRequest('/audit-logs', CONFIG.storageKeys.cachedAudit);
  }
};
