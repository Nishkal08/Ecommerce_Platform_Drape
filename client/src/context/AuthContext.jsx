import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    setUser(res.data.data);
    toast.success('Welcome back!');
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    setUser(res.data.data);
    toast.success('Account created!');
    return res.data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
