import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, SignupPayload } from '../types';
import { loginUser, signupUser, logoutUser, getCurrentUser } from '../services/authService';

export type { UserRole } from '../types';
export type { User as AuthUser } from '../types';
export type { SignupPayload } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (data: SignupPayload) => Promise<{ error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const result = await loginUser(email, password);

      if (result.error) {
        return { error: result.error };
      }

      if (result.user) {
        setUser(result.user);
      } else {
        await refreshUser();
      }

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { error: message };
    }
  };

  const signup = async (data: SignupPayload): Promise<{ error?: string }> => {
    try {
      const result = await signupUser(data);

      if (result.error) {
        return { error: result.error };
      }

      if (result.user) {
        setUser(result.user);
      } else {
        await refreshUser();
      }

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      return { error: message };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}