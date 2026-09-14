import { CONFIG, OfflineError, ServiceUnavailableError, getStoredMode } from './config';

export { OfflineError, ServiceUnavailableError };

/**
 * Zero-fabrication law: synthetic demo data is NEVER automatically displayed.
 * Default is LIVE mode. DEMO mode must be explicitly selected by user.
 * Failed LIVE requests fail deterministically with ServiceUnavailableError or OfflineError.
 */
export const apiClient = async (endpoint, options = {}) => {
  const currentMode = getStoredMode();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem(CONFIG.storageKeys.token) : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const url = `${CONFIG.apiBaseUrl}${endpoint}`;
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.detail || errorData.message || `API Error: ${response.status}`;
      throw new ServiceUnavailableError(msg);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      throw new OfflineError('Network offline. Backend is unreachable.');
    }
    if (error instanceof ServiceUnavailableError || error instanceof OfflineError) {
      throw error;
    }
    throw new ServiceUnavailableError(`SERVICE UNAVAILABLE: ${error.message || 'Cannot reach API backend.'}`);
  }
};
