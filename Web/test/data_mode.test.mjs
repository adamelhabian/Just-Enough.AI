import test from 'node:test';
import assert from 'node:assert/strict';

// Setup mock localStorage on globalThis if not present
if (!globalThis.localStorage) {
  let mem = {};
  globalThis.localStorage = {
    getItem: (k) => mem[k] ?? null,
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: (k) => { delete mem[k]; },
    clear: () => { mem = {}; }
  };
}

import { CONFIG } from '../js/config.js';
import { storage } from '../js/storage.js';
import { api, DEMO_STORE, OfflineError, ServiceUnavailableError } from '../js/api.js';

test('1. CONFIG defaultMode must strictly be LIVE', () => {
  assert.equal(CONFIG.defaultMode, 'LIVE', 'Default mode in CONFIG must be LIVE');
});

test('2. storage.getMode() must return LIVE when no mode has been explicitly selected', () => {
  storage.clearSession();
  globalThis.localStorage.removeItem(CONFIG.storageKeys.mode);
  assert.equal(storage.getMode(), 'LIVE', 'Fresh session must default to LIVE mode');
});

test('3. DEMO mode must only be active when explicitly set by user', () => {
  storage.setMode('DEMO');
  assert.equal(storage.getMode(), 'DEMO');
  
  // Revert back to LIVE
  storage.setMode('LIVE');
  assert.equal(storage.getMode(), 'LIVE');
});

test('4. In LIVE mode, failed fetch must throw ServiceUnavailableError and NEVER return demo data', async () => {
  storage.setMode('LIVE');
  storage.setCachedRealData(CONFIG.storageKeys.cachedBrief, null);
  
  // Mock global fetch to simulate network error
  globalThis.fetch = async () => {
    throw new Error('ECONNREFUSED 127.0.0.1:8000');
  };

  await assert.rejects(
    async () => {
      await api.getMorningBrief();
    },
    (err) => {
      assert(err.name === 'ServiceUnavailableError', `Expected ServiceUnavailableError, got ${err.name}`);
      assert(err.message.includes('SERVICE UNAVAILABLE'), 'Error message must contain SERVICE UNAVAILABLE');
      return true;
    },
    'LIVE mode must reject with SERVICE UNAVAILABLE on network failure'
  );
});

test('5. In LIVE mode with offline network, must throw OfflineError and never return demo data', async () => {
  storage.setMode('LIVE');
  storage.setCachedRealData(CONFIG.storageKeys.cachedBrief, null);
  
  // Mock offline status
  Object.defineProperty(globalThis.navigator, 'onLine', { value: false, configurable: true });

  await assert.rejects(
    async () => {
      await api.getMorningBrief();
    },
    (err) => {
      assert(err.name === 'OfflineError', `Expected OfflineError, got ${err.name}`);
      assert(err.message.includes('OFFLINE'), 'Error message must contain OFFLINE');
      return true;
    }
  );

  // Restore online
  Object.defineProperty(globalThis.navigator, 'onLine', { value: true, configurable: true });
});

test('6. In LIVE mode when live API fails but CACHED REAL DATA exists, return cached real data with indicator', async () => {
  storage.setMode('LIVE');
  const realBriefData = {
    date: '2026-09-13',
    branch_name: 'Downtown Live Flagship',
    kpis: { stock_health_pct: 98.0, pending_prep_count: 1, pending_orders_count: 2, active_alerts_count: 0 },
    to_prepare: [],
    to_order: [],
    to_monitor: [],
    alerts: []
  };
  
  storage.setCachedRealData(CONFIG.storageKeys.cachedBrief, realBriefData);
  
  // Mock failed fetch
  globalThis.fetch = async () => {
    throw new Error('503 Service Unavailable');
  };

  const result = await api.getMorningBrief();
  assert.equal(result._dataSource, 'CACHED_REAL_DATA', 'Data source must indicate CACHED_REAL_DATA');
  assert.equal(result.branch_name, 'Downtown Live Flagship', 'Must match real cached branch');
  assert(result._cachedAt, 'Must include timestamp of cached real data');
});

test('7. In DEMO mode (explicitly selected), data returned must carry DEMO_SYNTHETIC indicator', async () => {
  storage.setMode('DEMO');
  
  const brief = await api.getMorningBrief();
  assert.equal(brief._dataSource, 'DEMO_SYNTHETIC', 'Brief in demo mode must carry DEMO_SYNTHETIC tag');
  
  const inv = await api.getInventory();
  assert.equal(inv._dataSource, 'DEMO_SYNTHETIC', 'Inventory in demo mode must carry DEMO_SYNTHETIC tag');
  
  const alerts = await api.getAlerts();
  assert.equal(alerts._dataSource, 'DEMO_SYNTHETIC', 'Alerts in demo mode must carry DEMO_SYNTHETIC tag');

  const recs = await api.getRecommendations();
  assert.equal(recs._dataSource, 'DEMO_SYNTHETIC', 'Recommendations in demo mode must carry DEMO_SYNTHETIC tag');

  const audit = await api.getAuditLogs();
  assert.equal(audit._dataSource, 'DEMO_SYNTHETIC', 'Audit in demo mode must carry DEMO_SYNTHETIC tag');
});
