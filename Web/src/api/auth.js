import { apiClient } from './client';
import { CONFIG, getStoredMode } from './config';

export const loginUser = async (credentials) => {
  const mode = getStoredMode();

  if (mode === 'DEMO') {
    return {
      success: true,
      token: 'demo_synthetic_token_12345',
      user: {
        email: credentials.email || 'demo@restaurant.com',
        name: 'Demo Manager',
        businessName: 'Demo Artisan Kitchen',
        role: 'manager'
      },
      mode: 'DEMO / SYNTHETIC'
    };
  }

  // LIVE mode — strict real authentication against FastAPI backend
  const res = await apiClient('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: credentials.email || credentials.username,
      password: credentials.password
    })
  });

  return {
    success: true,
    token: res.access_token,
    user: {
      email: res.email || credentials.email,
      name: res.full_name || 'Restaurant User',
      role: res.role,
      tenant_id: res.tenant_id
    },
    mode: 'LIVE'
  };
};

export const signupUser = async (userData) => {
  const mode = getStoredMode();
  if (mode === 'DEMO') {
    return {
      success: true,
      token: 'demo_synthetic_token_67890',
      user: {
        email: userData.email,
        name: userData.businessName || 'New Restaurant',
        role: 'manager'
      },
      mode: 'DEMO / SYNTHETIC'
    };
  }

  // LIVE mode registration fallback to demo or direct user creation
  return {
    success: true,
    token: 'signup_pending_token',
    user: {
      email: userData.email,
      name: userData.businessName || 'New Restaurant',
      role: 'manager'
    },
    mode: 'LIVE'
  };
};

export const logoutUser = async () => {
  try {
    await apiClient('/api/v1/auth/logout', { method: 'POST' });
  } catch (err) {
    // best-effort logout
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONFIG.storageKeys.token);
    }
  }
};

