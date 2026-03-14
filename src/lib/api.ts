const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export function storeToken(token: string): void {
  try {
    localStorage.setItem('auth_token', token);
  } catch {}
}

export function clearToken(): void {
  try {
    localStorage.removeItem('auth_token');
  } catch {}
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  const authToken = token || getStoredToken();
  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  const hasBody = body !== undefined && body !== null;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: hasBody ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  let responseData: unknown = null;

  try {
    if (response.status !== 204) {
      responseData = isJson ? await response.json() : await response.text();
    }
  } catch {
    responseData = null;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (typeof responseData === 'object' && responseData !== null) {
      const data = responseData as { message?: string; error?: string };
      message = data.message || data.error || message;
    } else if (typeof responseData === 'string' && responseData.trim()) {
      message = responseData;
    }

    throw new ApiError(message, response.status);
  }

  return responseData as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      method: 'GET',
      ...options,
    }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      method: 'POST',
      body,
      ...options,
    }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      method: 'PUT',
      body,
      ...options,
    }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      method: 'PATCH',
      body,
      ...options,
    }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      method: 'DELETE',
      ...options,
    }),
};

export { API_BASE_URL };
