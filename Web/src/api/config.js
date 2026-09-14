export const CONFIG = {
  defaultMode: 'LIVE',
  storageKeys: {
    mode: 'just_enough_mode',
    token: 'just_enough_token',
    user: 'just_enough_user',
    cachedData: 'just_enough_cache'
  },
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
};

export class OfflineError extends Error {
  constructor(message = 'Network offline. Unable to reach live server.') {
    super(message);
    this.name = 'OfflineError';
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message = 'Service Unavailable: Backend API did not respond successfully.') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

export const getStoredMode = () => {
  if (typeof window === 'undefined') return CONFIG.defaultMode;
  return localStorage.getItem(CONFIG.storageKeys.mode) || CONFIG.defaultMode;
};

export const setStoredMode = (mode) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG.storageKeys.mode, mode);
};
