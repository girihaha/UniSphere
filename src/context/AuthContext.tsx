import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'club_admin' | 'super_admin';

export interface AuthUser {
  name: string;
  email: string;
  regNumber: string;
  branch: string;
  year: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (data: SignupData) => Promise<{ error?: string }>;
  logout: () => void;
}

export interface SignupData {
  name: string;
  regNumber: string;
  email: string;
  branch: string;
  year: string;
  password: string;
  role: UserRole;
}

const UNIVERSITY_EMAIL_DOMAIN = '@srmist.edu.in';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!email.endsWith(UNIVERSITY_EMAIL_DOMAIN)) {
      return { error: 'Please use your university email (@srmist.edu.in).' };
    }
    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);

    const isAdminEmail = email.startsWith('admin.');
    const isClubAdmin = email.startsWith('club.');
    setUser({
      name: isAdminEmail ? 'Admin User' : isClubAdmin ? 'Club Admin' : 'Fahad Kasim',
      email,
      regNumber: 'RA2211023010123',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
      role: isAdminEmail ? 'super_admin' : isClubAdmin ? 'club_admin' : 'student',
    });

    return {};
  };

  const signup = async (data: SignupData): Promise<{ error?: string }> => {
    if (!data.email.endsWith(UNIVERSITY_EMAIL_DOMAIN)) {
      return { error: 'Please use your university email (@srmist.edu.in).' };
    }
    if (!data.name.trim()) return { error: 'Full name is required.' };
    if (!data.regNumber.trim()) return { error: 'Registration number is required.' };
    if (!data.branch) return { error: 'Please select your branch.' };
    if (!data.year) return { error: 'Please select your year.' };
    if (data.password.length < 6) return { error: 'Password must be at least 6 characters.' };

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setIsLoading(false);

    setUser({
      name: data.name,
      email: data.email,
      regNumber: data.regNumber,
      branch: data.branch,
      year: data.year,
      role: data.role,
    });

    return {};
  };

  const logout = () => setUser(null);

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
