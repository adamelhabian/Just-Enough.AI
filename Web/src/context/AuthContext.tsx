import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, DataMode } from '../types';
import { api, getDataMode, setDataMode as persistDataMode, getAuthToken, setAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  dataMode: DataMode;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  setDataMode: (mode: DataMode) => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dataMode, setModeState] = useState<DataMode>(getDataMode());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const storedRole = (localStorage.getItem('justenough_user_role') as UserRole) || 'manager';
      setUser({
        id: 'user_active_session',
        email: storedRole === 'manager' ? 'manager@justenough.ai' : 'inventory@justenough.ai',
        full_name: storedRole === 'manager' ? 'Karim Mansour (Branch Manager)' : 'Ahmed Zaki (Inventory Clerk)',
        role: storedRole,
        tenant_id: 'tenant_demo_1'
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    const newUser: User = {
      id: res.user_id,
      email: email.trim().toLowerCase(),
      full_name: res.full_name,
      role: res.role,
      tenant_id: res.tenant_id
    };
    setUser(newUser);
    localStorage.setItem('justenough_user_role', res.role);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    localStorage.removeItem('justenough_user_role');
  };

  const setDataMode = (mode: DataMode) => {
    persistDataMode(mode);
    setModeState(mode);
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        role: newRole,
        email: newRole === 'manager' ? 'manager@justenough.ai' : 'inventory@justenough.ai',
        full_name: newRole === 'manager' ? 'Karim Mansour (Branch Manager)' : 'Ahmed Zaki (Inventory Clerk)',
      };
      setUser(updatedUser);
      localStorage.setItem('justenough_user_role', newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'manager',
        dataMode,
        isLoading,
        login,
        logout,
        setDataMode,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
