// api.js - API Client with LIVE & DEMO support
import { CONFIG } from './config.js';
import { storage } from './storage.js';

// In-memory demo data for standalone or offline verification
const DEMO_STORE = {
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

export const api = {
  async login(email, password) {
    const mode = storage.getMode();
    if (mode === 'DEMO') {
      const role = email.includes('employee') ? 'employee' : 'manager';
      const res = {
        access_token: 'demo_token_' + Date.now(),
        role: role,
        tenant_id: 'tenant_demo_1',
        user: { email, name: role === 'manager' ? 'Branch Manager' : 'Inventory Specialist', role }
      };
      return res;
    }
    // LIVE mode
    const resp = await fetch(`${CONFIG.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!resp.ok) throw new Error(`Authentication failed with status ${resp.status}`);
    return await resp.json();
  },

  async getMorningBrief() {
    if (storage.getMode() === 'DEMO') return DEMO_STORE.brief;
    const resp = await fetch(`${CONFIG.apiBaseUrl}/brief`, {
      headers: { 'Authorization': `Bearer ${storage.getToken()}` }
    });
    if (!resp.ok) throw new Error('Failed to fetch morning brief');
    return await resp.json();
  },

  async getInventory() {
    if (storage.getMode() === 'DEMO') return DEMO_STORE.inventory;
    const resp = await fetch(`${CONFIG.apiBaseUrl}/inventory`, {
      headers: { 'Authorization': `Bearer ${storage.getToken()}` }
    });
    if (!resp.ok) throw new Error('Failed to fetch inventory');
    return await resp.json();
  },

  async getAlerts() {
    if (storage.getMode() === 'DEMO') return DEMO_STORE.brief.alerts;
    const resp = await fetch(`${CONFIG.apiBaseUrl}/alerts`, {
      headers: { 'Authorization': `Bearer ${storage.getToken()}` }
    });
    if (!resp.ok) throw new Error('Failed to fetch alerts');
    return await resp.json();
  },

  async getRecommendations() {
    if (storage.getMode() === 'DEMO') return DEMO_STORE.recommendations;
    const resp = await fetch(`${CONFIG.apiBaseUrl}/recommendations`, {
      headers: { 'Authorization': `Bearer ${storage.getToken()}` }
    });
    if (!resp.ok) throw new Error('Failed to fetch recommendations');
    return await resp.json();
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
        details: `Overrode ${id} quantity to ${newQty} (Reason: ${reason})`
      });
      return { success: true, updated: rec };
    }
    const resp = await fetch(`${CONFIG.apiBaseUrl}/recommendations/${id}/override`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.getToken()}`
      },
      body: JSON.stringify({ override_qty: Number(newQty), reason: reason.trim() })
    });
    if (!resp.ok) throw new Error('Failed to submit override');
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
          details: `Adjusted ${item.name} (${id}) to ${newCount} ${item.unit} (Delta: ${delta > 0 ? '+' : ''}${delta})`
        });
      }
      return { success: true };
    }
    const resp = await fetch(`${CONFIG.apiBaseUrl}/inventory/${id}/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.getToken()}`
      },
      body: JSON.stringify({ count: Number(newCount), reason })
    });
    if (!resp.ok) throw new Error('Failed to submit inventory adjustment');
    return await resp.json();
  },

  async getAuditLogs() {
    if (storage.getMode() === 'DEMO') return DEMO_STORE.audit;
    const resp = await fetch(`${CONFIG.apiBaseUrl}/audit-logs`, {
      headers: { 'Authorization': `Bearer ${storage.getToken()}` }
    });
    if (!resp.ok) throw new Error('Failed to fetch audit logs');
    return await resp.json();
  }
};
