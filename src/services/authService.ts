import { User, LoginPayload, SignupPayload, AuthResponse } from '../types';
import { api, storeToken, clearToken } from '../lib/api';

const UNIVERSITY_EMAIL_DOMAIN = '@srmist.edu.in';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeRegNumber(regNumber: string) {
  return regNumber.trim().toUpperCase();
}

function validateLoginInput(email: string, password: string): string | null {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail.endsWith(UNIVERSITY_EMAIL_DOMAIN)) {
    return 'Please use your university email (@srmist.edu.in).';
  }

  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

function validateSignupInput(data: SignupPayload): string | null {
  const normalizedEmail = normalizeEmail(data.email);

  if (!normalizedEmail.endsWith(UNIVERSITY_EMAIL_DOMAIN)) {
    return 'Please use your university email (@srmist.edu.in).';
  }

  if (!data.name.trim()) return 'Full name is required.';
  if (!data.regNumber.trim()) return 'Registration number is required.';
  if (!data.branch.trim()) return 'Please select your branch.';
  if (!data.year.trim()) return 'Please select your year.';
  if (!data.password || data.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

function normalizeUser(user: User): User {
  return {
    id: user.id,
    name: user.name,
    email: normalizeEmail(user.email),
    regNumber: normalizeRegNumber(user.regNumber),
    branch: user.branch,
    degree: user.degree || 'B.Tech',
    year: user.year,
    cgpa: user.cgpa || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || '',
    role: user.role,
    connections: user.connections ?? 0,
    posts: user.posts ?? 0,
    notes: user.notes ?? 0,
    clubs: user.clubs ?? 0,
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  const validationError = validateLoginInput(email, password);
  if (validationError) {
    return { error: validationError };
  }

  try {
    const response = await api.post<AuthResponse>('/auth/login', {
      email: normalizeEmail(email),
      password,
    } as LoginPayload);

    if (!response.user?.id) {
      return { error: 'Login failed: invalid user data returned by server.' };
    }

    if (response.token) {
      storeToken(response.token);
    }

    return { user: normalizeUser(response.user) };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { error: message };
  }
}

export async function signupUser(
  data: SignupPayload
): Promise<{ user?: User; error?: string }> {
  const validationError = validateSignupInput(data);
  if (validationError) {
    return { error: validationError };
  }

  try {
    const response = await api.post<AuthResponse>('/auth/signup', {
      name: data.name.trim(),
      regNumber: normalizeRegNumber(data.regNumber),
      email: normalizeEmail(data.email),
      branch: data.branch.trim(),
      year: data.year.trim(),
      password: data.password,
    });

    if (!response.user?.id) {
      return { error: 'Signup failed: invalid user data returned by server.' };
    }

    if (response.token) {
      storeToken(response.token);
    }

    return { user: normalizeUser(response.user) };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return { error: message };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<{ user: User }>('/auth/me');

    if (!response.user?.id) {
      return null;
    }

    return normalizeUser(response.user);
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  clearToken();
}