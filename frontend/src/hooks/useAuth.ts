'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/types';

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isTailor: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (payload: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    role?: 'CUSTOMER' | 'TAILOR';
  }) => Promise<boolean>;
  logout: () => void;
}

export function useAuth(): AuthState {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const finish = () => {
      if (alive) setReady(true);
    };
    if (useAuthStore.persist.hasHydrated()) {
      finish();
    } else {
      Promise.resolve(useAuthStore.persist.rehydrate()).then(finish);
    }
    return () => {
      alive = false;
    };
  }, []);

  const isAuthenticated = ready && !!token;

  return {
    token,
    user,
    hydrated: ready,
    loading,
    error,
    isAuthenticated,
    isTailor: user?.role === 'TAILOR',
    login,
    register,
    logout,
  };
}