import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiPost } from '@/helpers/api';
import type { AuthResponse, AuthUser } from '@/types';

const TOKEN_KEY = 'tailor_auth_token';

const memoryStorageShim: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  get length() {
    return 0;
  },
};

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  setHydrated: () => void;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      loading: false,
      error: null,

      setHydrated: () => set({ hydrated: true }),

      setAuth: (token, user) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(TOKEN_KEY, token);
        }
        set({ token, user, error: null });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(TOKEN_KEY);
        }
        set({ token: null, user: null, error: null });
      },

      login: async (identifier, password) => {
        set({ loading: true, error: null });
        try {
          const data = await apiPost<AuthResponse>('/auth/login', {
            identifier,
            password,
          });
          if (!data) throw new Error('Empty login response');
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(TOKEN_KEY, data.token);
          }
          set({ token: data.token, user: data.user, loading: false });
          return true;
        } catch (error) {
          const code = extractErrorCode(error);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(TOKEN_KEY);
          }
          set({ token: null, user: null, loading: false, error: code });
          return false;
        }
      },

      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const data = await apiPost<AuthResponse>('/auth/register', payload);
          if (!data) throw new Error('Empty register response');
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(TOKEN_KEY, data.token);
          }
          set({ token: data.token, user: data.user, loading: false });
          return true;
        } catch (error) {
          const code = extractErrorCode(error);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(TOKEN_KEY);
          }
          set({ token: null, user: null, loading: false, error: code });
          return false;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(TOKEN_KEY);
        }
        set({ token: null, user: null, error: null });
      },
    }),
    {
      name: 'tailor_auth',
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorageShim,
      ),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);

function extractErrorCode(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }
  return 'NETWORK_ERROR';
}