import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'formapp_admin_token';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setAdmin(data.admin);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setAdmin(data.admin);
    return data.admin;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
