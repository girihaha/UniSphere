import { createContext, useContext, useState, ReactNode } from 'react';
import { User, SignupPayload } from '../types';
import { loginUser, signupUser, logoutUser } from '../services/authService';

export type { UserRole } from '../types';
export type { User as AuthUser } from '../types';
export type { SignupPayload } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (data: SignupPayload) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    const result = await loginUser(email, password);
    setIsLoading(false);

    if (result.error) return { error: result.error };
    if (result.user) setUser(result.user);
    return {};
  };

  const signup = async (data: SignupPayload): Promise<{ error?: string }> => {
    setIsLoading(true);
    const result = await signupUser(data);
    setIsLoading(false);

    if (result.error) return { error: result.error };
    if (result.user) setUser(result.user);
    return {};
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
