// config.js - Application Configuration & Mode
export const CONFIG = {
  appName: 'JustEnough.AI',
  version: '6.0.0-vanilla',
  apiBaseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api/v1'
    : 'https://justenough-api.onrender.com/api/v1',
  defaultMode: 'DEMO', // 'LIVE' or 'DEMO'
  storageKeys: {
    token: 'je_auth_token',
    user: 'je_auth_user',
    mode: 'je_data_mode',
    cachedBrief: 'je_cached_brief',
    cachedInventory: 'je_cached_inventory',
    offlineQueue: 'je_offline_queue'
  }
};
