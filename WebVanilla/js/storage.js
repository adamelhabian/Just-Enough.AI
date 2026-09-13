// storage.js - Local Storage Abstraction
import { CONFIG } from './config.js';

export const storage = {
  getToken() { return localStorage.getItem(CONFIG.storageKeys.token); },
  setToken(token) {
    if (token) localStorage.setItem(CONFIG.storageKeys.token, token);
    else localStorage.removeItem(CONFIG.storageKeys.token);
  },
  getUser() {
    const raw = localStorage.getItem(CONFIG.storageKeys.user);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  setUser(user) {
    if (user) localStorage.setItem(CONFIG.storageKeys.user, JSON.stringify(user));
    else localStorage.removeItem(CONFIG.storageKeys.user);
  },
  getMode() { return localStorage.getItem(CONFIG.storageKeys.mode) || CONFIG.defaultMode; },
  setMode(mode) { localStorage.setItem(CONFIG.storageKeys.mode, mode); },
  getQueue() {
    const raw = localStorage.getItem(CONFIG.storageKeys.offlineQueue);
    try { return raw ? JSON.parse(raw) : []; } catch { return []; }
  },
  saveQueue(q) { localStorage.setItem(CONFIG.storageKeys.offlineQueue, JSON.stringify(q)); },
  clearSession() {
    localStorage.removeItem(CONFIG.storageKeys.token);
    localStorage.removeItem(CONFIG.storageKeys.user);
  }
};
