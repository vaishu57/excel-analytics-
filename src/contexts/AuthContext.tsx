'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  signup: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('datavis-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from sessionStorage", e);
      sessionStorage.removeItem('datavis-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string) => {
    const mockUser = { email };
    sessionStorage.setItem('datavis-user', JSON.stringify(mockUser));
    setUser(mockUser);
    router.push('/');
  };
  
  const signup = (email: string) => {
    // In a real app, you'd have more logic here.
    const mockUser = { email };
    sessionStorage.setItem('datavis-user', JSON.stringify(mockUser));
    setUser(mockUser);
    router.push('/');
  };

  const logout = () => {
    sessionStorage.removeItem('datavis-user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
