import { create } from 'zustand';

interface User {
  id?: string;
  usn: string;
  name: string;
  email: string;
  branch?: string;
  semester?: number;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user: User) => set({ user, isAuthenticated: true }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));
