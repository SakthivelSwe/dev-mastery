import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth_token');
    const raw = localStorage.getItem('auth_user');
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as User;
        set({ token, user, isAuthenticated: true });
      } catch {
        /* corrupted storage — ignore */
      }
    }
  },
}));
