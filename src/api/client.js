// API Base client configured with environment variable VITE_API_BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = localStorage.getItem('just_enough_token');
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
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API Client Warning] ${endpoint}: using fallback mock data.`, error.message);
    throw error;
  }
};
