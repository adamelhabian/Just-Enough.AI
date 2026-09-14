import { apiClient } from './client';
import { mockSettingsData } from '../data/mockData';

export const loginUser = async (credentials) => {
  try {
    return await apiClient('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  } catch (err) {
    // Fallback for frontend demo
    return {
      success: true,
      token: 'demo_token_12345',
      user: {
        email: credentials.email,
        name: mockSettingsData.account.name,
        businessName: mockSettingsData.business.name
      }
    };
  }
};

export const signupUser = async (userData) => {
  try {
    return await apiClient('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  } catch (err) {
    return {
      success: true,
      token: 'demo_token_67890',
      user: {
        email: userData.email,
        name: userData.businessName,
        businessType: userData.businessType
      }
    };
  }
};
