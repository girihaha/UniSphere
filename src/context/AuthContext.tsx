import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, SignupPayload } from '../types';
import {
  loginUser,
  signupUser,
  logoutUser,
  getCurrentUser,
  verifySignupOtp as verifySignupOtpService,
  resendSignupOtp as resendSignupOtpService,
  requestForgotPasswordOtp as requestForgotPasswordOtpService,
  verifyForgotPasswordOtp as verifyForgotPasswordOtpService,
  resetPasswordWithOtp as resetPasswordWithOtpService,
} from '../services/authService';

export type { UserRole } from '../types';
export type { User as AuthUser } from '../types';
export type { SignupPayload } from '../types';

type BasicResult = {
  error?: string;
  message?: string;
};

type SignupResult = {
  error?: string;
  message?: string;
  requiresOtp?: boolean;
  email?: string;
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<BasicResult>;
  signup: (data: SignupPayload) => Promise<SignupResult>;
  verifySignupOtp: (email: string, otp: string) => Promise<BasicResult>;
  resendSignupOtp: (email: string) => Promise<BasicResult>;
  requestForgotPasswordOtp: (email: string) => Promise<BasicResult>;
  verifyForgotPasswordOtp: (email: string, otp: string) => Promise<BasicResult>;
  resetPasswordWithOtp: (email: string, otp: string, newPassword: string) => Promise<BasicResult>;
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
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<BasicResult> => {
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

      return { message: result.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { error: message };
    }
  };

  const signup = async (data: SignupPayload): Promise<SignupResult> => {
    try {
      const result = await signupUser(data);

      if (result.error) {
        return { error: result.error };
      }

      if (result.requiresOtp) {
        return {
          requiresOtp: true,
          email: result.email,
          message: result.message,
        };
      }

      if (result.user) {
        setUser(result.user);
      } else {
        await refreshUser();
      }

      return { message: result.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      return { error: message };
    }
  };

  const verifySignupOtp = async (email: string, otp: string): Promise<BasicResult> => {
    try {
      const result = await verifySignupOtpService(email, otp);

      if (result.error) {
        return { error: result.error };
      }

      await refreshUser();
      return { message: result.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OTP verification failed';
      return { error: message };
    }
  };

  const resendSignupOtp = async (email: string): Promise<BasicResult> => {
    try {
      const result = await resendSignupOtpService(email);

      if (result.error) {
        return { error: result.error };
      }

      return { message: result.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend OTP';
      return { error: message };
    }
  };

  const requestForgotPasswordOtp = async (email: string): Promise<BasicResult> => {
    try {
      const result = await requestForgotPasswordOtpService(email);

      if (result.error) {
        return { error: result.error };
      }

      return { message: result.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset OTP';
      return { error: message };
    }
  };

  const verifyForgotPasswordOtp = async (email: string, otp: string): Promise<BasicResult> => {
    try {
      const result = await verifyForgotPasswordOtpService(email, otp);

      if (result.error) {
        return { error: result.error };
      }

      return { message: result.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify OTP';
      return { error: message };
    }
  };

  const resetPasswordWithOtp = async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<BasicResult> => {
    try {
      const result = await resetPasswordWithOtpService(email, otp, newPassword);

      if (result.error) {
        return { error: result.error };
      }

      return { message: result.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      return { error: message };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        verifySignupOtp,
        resendSignupOtp,
        requestForgotPasswordOtp,
        verifyForgotPasswordOtp,
        resetPasswordWithOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
