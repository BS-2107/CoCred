import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, UserRole } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfileState: (updatedProfile: Partial<StudentProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('cocred_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
      } else {
        api.removeToken();
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.warn('Session check failed:', err);
      api.removeToken();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.token) {
        api.setToken(res.token);
        setUser(res.user);
        setProfile(res.profile || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      if (res.token) {
        api.setToken(res.token);
        setUser(res.user);
        setProfile(res.profile || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.removeToken();
    setUser(null);
    setProfile(null);
  };

  const quickDemoLogin = async (role: UserRole) => {
    const demoAccounts: Record<UserRole, { email: string; pass: string }> = {
      student: { email: 'student@cocred.edu', pass: 'password123' },
      faculty: { email: 'faculty@cocred.edu', pass: 'password123' },
      placement_officer: { email: 'placement@cocred.edu', pass: 'password123' },
      admin: { email: 'admin@cocred.edu', pass: 'password123' }
    };

    const target = demoAccounts[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
      }
    } catch (e) {
      console.error('Refresh user error:', e);
    }
  };

  const updateProfileState = (updated: Partial<StudentProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updated } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser,
        updateProfileState
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
