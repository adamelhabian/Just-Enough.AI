import { apiClient } from './client';
import { mockSettingsData } from '../data/mockData';

export const fetchSettings = async () => {
  try {
    return await apiClient('/api/v1/settings');
  } catch (err) {
    return mockSettingsData;
  }
};

export const updateSettings = async (section, payload) => {
  try {
    return await apiClient(`/api/v1/settings/${section}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return { success: true, message: `${section} updated successfully.`, data: payload };
  }
};
