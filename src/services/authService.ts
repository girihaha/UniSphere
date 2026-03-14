import { api, storeToken, clearToken } from '../lib/api';
import type { SignupPayload, User } from '../types';

type AuthResponse =
  | {
      user?: User;
      token?: string;
      error?: string;
      data?: User;
      message?: string;
      requiresOtp?: boolean;
      email?: string;
      success?: boolean;
    }
  | User
  | null;

export type SignupStartResult = {
  user?: User;
  token?: string;
  error?: string;
  requiresOtp?: boolean;
  email?: string;
  message?: string;
};

export type GenericAuthResult = {
  success?: boolean;
  error?: string;
  message?: string;
  user?: User;
  token?: string;
};

function extractUserFromResponse(result: AuthResponse): User | null {
  if (!result) return null;

  if (typeof result === 'object') {
    if ('user' in result && result.user) {
      return result.user;
    }

    if ('data' in result && result.data) {
      return result.data;
    }

    if ('id' in result && 'email' in result) {
      return result as User;
    }
  }

  return null;
}

function extractTokenFromResponse(result: AuthResponse): string | undefined {
  if (!result || typeof result !== 'object') return undefined;
  if ('token' in result && typeof result.token === 'string') return result.token;
  return undefined;
}

function extractMessageFromResponse(result: AuthResponse): string | undefined {
  if (!result || typeof result !== 'object') return undefined;
  if ('message' in result && typeof result.message === 'string') return result.message;
  return undefined;
}

export async function signupUser(data: SignupPayload): Promise<SignupStartResult> {
  try {
    const result = await api.post<AuthResponse>('/auth/signup', data);

    if (
      result &&
      typeof result === 'object' &&
      'requiresOtp' in result &&
      result.requiresOtp
    ) {
      return {
        requiresOtp: true,
        email: typeof result.email === 'string' ? result.email : data.email,
        message: typeof result.message === 'string' ? result.message : 'OTP sent successfully',
      };
    }

    const token = extractTokenFromResponse(result);
    const user = extractUserFromResponse(result);

    if (token) {
      storeToken(token);
    }

    return {
      user: user || undefined,
      token,
      message: extractMessageFromResponse(result),
    };
  } catch (err: any) {
    return {
      error: err?.message || 'Signup failed',
    };
  }
}

export async function verifySignupOtp(
  email: string,
  otp: string
): Promise<GenericAuthResult> {
  try {
    const result = await api.post<AuthResponse>('/auth/signup/verify-otp', {
      email,
      otp,
    });

    const token = extractTokenFromResponse(result);
    const user = extractUserFromResponse(result);

    if (token) {
      storeToken(token);
    }

    return {
      success: true,
      user: user || undefined,
      token,
      message: extractMessageFromResponse(result) || 'Signup verified successfully',
    };
  } catch (err: any) {
    return {
      error: err?.message || 'OTP verification failed',
    };
  }
}

export async function resendSignupOtp(email: string): Promise<GenericAuthResult> {
  try {
    const result = await api.post<AuthResponse>('/auth/signup/resend-otp', {
      email,
    });

    return {
      success: true,
      message: extractMessageFromResponse(result) || 'OTP resent successfully',
    };
  } catch (err: any) {
    return {
      error: err?.message || 'Failed to resend signup OTP',
    };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user?: User; token?: string; error?: string; message?: string }> {
  try {
    const result = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    const token = extractTokenFromResponse(result);
    const user = extractUserFromResponse(result);

    if (token) {
      storeToken(token);
    }

    return {
      user: user || undefined,
      token,
      message: extractMessageFromResponse(result),
    };
  } catch (err: any) {
    return {
      error: err?.message || 'Login failed',
    };
  }
}

export async function requestForgotPasswordOtp(
  email: string
): Promise<GenericAuthResult> {
  try {
    const result = await api.post<AuthResponse>('/auth/forgot-password/request-otp', {
      email,
    });

    return {
      success: true,
      message: extractMessageFromResponse(result) || 'OTP sent successfully',
    };
  } catch (err: any) {
    return {
      error: err?.message || 'Failed to send reset OTP',
    };
  }
}

export async function verifyForgotPasswordOtp(
  email: string,
  otp: string
): Promise<GenericAuthResult> {
  try {
    const result = await api.post<AuthResponse>('/auth/forgot-password/verify-otp', {
      email,
      otp,
    });

    return {
      success: true,
      message: extractMessageFromResponse(result) || 'OTP verified successfully',
    };
  } catch (err: any) {
    return {
      error: err?.message || 'Failed to verify reset OTP',
    };
  }
}

export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  newPassword: string
): Promise<GenericAuthResult> {
  try {
    const result = await api.post<AuthResponse>('/auth/forgot-password/reset', {
      email,
      otp,
      newPassword,
    });

    return {
      success: true,
      message: extractMessageFromResponse(result) || 'Password reset successfully',
    };
  } catch (err: any) {
    return {
      error: err?.message || 'Failed to reset password',
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const result = await api.get<AuthResponse>('/auth/me');
    const user = extractUserFromResponse(result);

    if (!user) {
      clearToken();
      return null;
    }

    return user;
  } catch {
    clearToken();
    return null;
  }
}

export function logoutUser() {
  clearToken();
}
