import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  getToken: () => string | null;
  restoreState: () => void;
}

// Get initial state from localStorage
const getStoredState = () => {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    return {
      token,
      user,
      isAuthenticated: Boolean(token && user)
    };
  } catch (error) {
    console.error('Error restoring auth state:', error);
    return {
      token: null,
      user: null,
      isAuthenticated: false
    };
  }
};

const initialState = getStoredState();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialState.user,
  isAuthenticated: initialState.isAuthenticated,
  token: initialState.token,
  login: (user: User, token: string) => {
    try {
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      set({ 
        user, 
        isAuthenticated: true,
        token
      });
    } catch (error) {
      console.error('Error storing auth state:', error);
    }
  },
  logout: () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update state
      set({ 
        user: null, 
        isAuthenticated: false,
        token: null
      });
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  },
  getToken: () => {
    const state = get();
    return state.token;
  },
  restoreState: () => {
    const { token, user, isAuthenticated } = getStoredState();
    set({ token, user, isAuthenticated });
  }
}));

// Export a function to initialize auth state
export const initializeAuth = () => {
  useAuthStore.getState().restoreState();
};
