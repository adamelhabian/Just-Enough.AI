// storage.js - Local Storage Abstraction with Cached Real Data
import { CONFIG } from './config.js';

const store = (typeof localStorage !== 'undefined') ? localStorage : (function() {
  let s = {};
  return {
    getItem: (k) => s[k] ?? null,
    setItem: (k, v) => { s[k] = String(v); },
    removeItem: (k) => { delete s[k]; },
    clear: () => { s = {}; }
  };
})();

export const storage = {
  getToken() { return store.getItem(CONFIG.storageKeys.token); },
  setToken(token) {
    if (token) store.setItem(CONFIG.storageKeys.token, token);
    else store.removeItem(CONFIG.storageKeys.token);
  },
  getUser() {
    const raw = store.getItem(CONFIG.storageKeys.user);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  setUser(user) {
    if (user) store.setItem(CONFIG.storageKeys.user, JSON.stringify(user));
    else store.removeItem(CONFIG.storageKeys.user);
  },
  getMode() {
    // DEFAULT IS STRICTLY LIVE. DEMO must be explicitly set by user.
    return store.getItem(CONFIG.storageKeys.mode) || CONFIG.defaultMode;
  },
  setMode(mode) {
    store.setItem(CONFIG.storageKeys.mode, mode);
  },
  getCachedRealData(key) {
    const raw = store.getItem(key);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  setCachedRealData(key, data) {
    if (data) {
      const payload = {
        data,
        cachedAt: new Date().toISOString(),
        _dataSource: 'CACHED_REAL_DATA'
      };
      store.setItem(key, JSON.stringify(payload));
    } else {
      store.removeItem(key);
    }
  },
  getQueue() {
    const raw = store.getItem(CONFIG.storageKeys.offlineQueue);
    try { return raw ? JSON.parse(raw) : []; } catch { return []; }
  },
  saveQueue(q) { store.setItem(CONFIG.storageKeys.offlineQueue, JSON.stringify(q)); },
  clearSession() {
    store.removeItem(CONFIG.storageKeys.token);
    store.removeItem(CONFIG.storageKeys.user);
  }
};
