/**
 * T045: Auth Store
 * SolidJS store for authentication state management
 */

import { createSignal, createContext, useContext, type JSX, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * User type
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  image?: string;
}

/**
 * Auth state interface
 */
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Auth actions interface
 */
interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: 'patient' | 'doctor';
  phone?: string;
}

type AuthContextValue = [AuthState, AuthActions];

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextValue>();

/**
 * Auth provider component
 */
export function AuthProvider(props: { children: JSX.Element }) {
  const [state, setState] = createStore<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setState({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
      return false;
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData): Promise<boolean> => {
    setState({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role || 'patient',
          phone: data.phone,
        }),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || 'Registration failed');
      }

      const resData = await response.json();
      
      setState({
        user: resData.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
      });
      return false;
    }
  };

  /**
   * Logout current user
   */
  const logout = async (): Promise<void> => {
    setState({ isLoading: true });

    try {
      await fetch(`${API_URL}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  /**
   * Refresh/check current session
   */
  const refreshSession = async (): Promise<void> => {
    setState({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setState({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  /**
   * Clear error
   */
  const clearError = (): void => {
    setState({ error: null });
  };

  // Check session on mount
  createEffect(() => {
    refreshSession();
  });

  const value: AuthContextValue = [
    state,
    { login, register, logout, refreshSession, clearError },
  ];

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to get current user
 */
export function useUser(): User | null {
  const [state] = useAuth();
  return state.user;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const [state] = useAuth();
  return state.isAuthenticated;
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(roles: Array<'patient' | 'doctor' | 'admin'>): boolean {
  const user = useUser();
  if (!user) return false;
  return roles.includes(user.role);
}

export type { AuthState, AuthActions, RegisterData };
