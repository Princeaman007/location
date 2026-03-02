import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types/auth';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: User, token: string) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        // Synchroniser avec localStorage
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setToken: (token) => {
        // Synchroniser avec localStorage pour api.ts
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({
          token,
        });
      },

      setAuth: (user, token) => {
        // Synchroniser avec localStorage pour api.ts
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      setLoading: (isLoading) =>
        set({
          isLoading,
        }),

      logout: () => {
        // Nettoyer localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
