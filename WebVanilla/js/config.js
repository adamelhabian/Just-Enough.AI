// config.js - Application Configuration & Mode (V6.2 Truth Lock)
export const CONFIG = {
  appName: 'JustEnough.AI',
  version: '6.2.0-vanilla',
  apiBaseUrl: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://127.0.0.1:8000/api/v1'
    : 'https://justenough-api.onrender.com/api/v1',
  defaultMode: 'LIVE', // DEFAULT IS STRICTLY LIVE PER V6.2 DIRECTIVE
  storageKeys: {
    token: 'je_auth_token',
    user: 'je_auth_user',
    mode: 'je_data_mode',
    cachedBrief: 'je_cached_brief',
    cachedInventory: 'je_cached_inventory',
    cachedAlerts: 'je_cached_alerts',
    cachedRecommendations: 'je_cached_recommendations',
    cachedAudit: 'je_cached_audit',
    offlineQueue: 'je_offline_queue'
  }
};
