import { User, LoginPayload, SignupPayload, AuthResponse, UserRole } from '../types';
import { api, storeToken, clearToken } from '../lib/api';

const UNIVERSITY_EMAIL_DOMAIN = '@srmist.edu.in';

function validateLoginInput(email: string, password: string): string | null {
  if (!email.endsWith(UNIVERSITY_EMAIL_DOMAIN)) {
    return 'Please use your university email (@srmist.edu.in).';
  }
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

function validateSignupInput(data: SignupPayload): string | null {
  if (!data.email.endsWith(UNIVERSITY_EMAIL_DOMAIN)) {
    return 'Please use your university email (@srmist.edu.in).';
  }
  if (!data.name.trim()) return 'Full name is required.';
  if (!data.regNumber.trim()) return 'Registration number is required.';
  if (!data.branch) return 'Please select your branch.';
  if (!data.year) return 'Please select your year.';
  if (data.password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

function inferRoleFromEmail(email: string): UserRole {
  if (email.startsWith('admin.')) return 'super_admin';
  if (email.startsWith('club.')) return 'club_admin';
  return 'student';
}

function buildMockUser(email: string): User {
  const role = inferRoleFromEmail(email);
  const name =
    role === 'super_admin' ? 'Admin User' :
    role === 'club_admin' ? 'Club Admin' :
    'Fahad Kasim';
  return {
    name,
    email,
    regNumber: 'RA2211023010123',
    branch: 'Computer Science & Engineering',
    degree: 'B.Tech',
    year: '3rd Year',
    role,
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  const validationError = validateLoginInput(email, password);
  if (validationError) return { error: validationError };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      } as LoginPayload);
      if (response.token) storeToken(response.token);
      return { user: response.user };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { error: message };
    }
  }

  await new Promise((r) => setTimeout(r, 1200));
  return { user: buildMockUser(email) };
}

export async function signupUser(
  data: SignupPayload
): Promise<{ user?: User; error?: string }> {
  const validationError = validateSignupInput(data);
  if (validationError) return { error: validationError };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', data);
      if (response.token) storeToken(response.token);
      return { user: response.user };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      return { error: message };
    }
  }

  await new Promise((r) => setTimeout(r, 1400));
  const user: User = {
    name: data.name,
    email: data.email,
    regNumber: data.regNumber,
    branch: data.branch,
    year: data.year,
    role: data.role,
  };
  return { user };
}

export async function getCurrentUser(): Promise<User | null> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.user;
    } catch {
      return null;
    }
  }

  return null;
}

export function logoutUser(): void {
  clearToken();
}
