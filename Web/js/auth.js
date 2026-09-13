// auth.js - Authentication & Session Management
import { storage } from './storage.js';

export const auth = {
  isAuthenticated() {
    return !!storage.getToken();
  },
  getUser() {
    return storage.getUser();
  },
  getRole() {
    const u = storage.getUser();
    return u ? u.role : null;
  },
  login(token, user) {
    storage.setToken(token);
    storage.setUser(user);
  },
  logout() {
    storage.clearSession();
    window.location.href = 'login.html';
  },
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};
