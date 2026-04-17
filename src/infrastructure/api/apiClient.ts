/**
 * TIVO — API Client
 *
 * Cliente HTTP que conecta el app React Native con el backend.
 * Usa el JWT del authStore para autenticar cada request.
 *
 * URL base:
 *   - Desarrollo local:  http://localhost:3000
 *   - Android emulador:  http://10.0.2.2:3000
 *   - Dispositivo físico: http://<IP-de-tu-PC>:3000
 */

import { Platform } from 'react-native';

// ─── Configuración de URL ─────────────────────────────────────────────────────

const getBaseUrl = (): string => {
  // Si tienes la IP de tu máquina, ponla aquí para probar en dispositivo físico
  const MACHINE_IP = '192.168.1.100'; // ← cambia esto

  if (__DEV__) {
    // Android emulador usa 10.0.2.2 para acceder al localhost del host
    return Platform.OS === 'android'
      ? `http://10.0.2.2:3000`
      : `http://localhost:3000`;
  }

  return `https://api.tudominio.com`; // ← URL de producción
};

export const API_BASE_URL = getBaseUrl();

// ─── Token storage (simple in-memory, usa AsyncStorage en prod) ───────────────

let _token: string | null = null;

export function setApiToken(token: string | null) {
  _token = token;
}

export function getApiToken(): string | null {
  return _token;
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers ?? {}),
  };

  if (!skipAuth && _token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${_token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error ?? 'Error del servidor', response.status, data);
  }

  return data;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{
      token: string;
      user: { id: string; name: string; email: string; role: string; businessId: string };
    }>('/api/auth/login', {
      method:    'POST',
      body:      JSON.stringify({ email, password }),
      skipAuth:  true,
    }),
};

// ─── Products API ─────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: { q?: string; category?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<{ data: any[]; total: number }>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  getLowStock: () =>
    apiFetch<{ data: any[] }>('/api/products/low-stock'),

  getById: (id: string) =>
    apiFetch<{ data: any }>(`/api/products/${id}`),

  create: (product: Record<string, unknown>) =>
    apiFetch<{ data: any }>('/api/products', {
      method: 'POST',
      body:   JSON.stringify(product),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<{ data: any }>(`/api/products/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(data),
    }),

  adjustStock: (id: string, stock: number) =>
    apiFetch<{ data: any }>(`/api/products/${id}/stock`, {
      method: 'PATCH',
      body:   JSON.stringify({ stock }),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/products/${id}`, { method: 'DELETE' }),
};

// ─── Sales API ────────────────────────────────────────────────────────────────

export const salesApi = {
  list: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<{ data: any[]; total: number }>(`/api/sales${qs ? `?${qs}` : ''}`);
  },

  getToday: () =>
    apiFetch<{ data: any[]; total: number; revenue: number }>('/api/sales/today'),

  getById: (id: string) =>
    apiFetch<{ data: any }>(`/api/sales/${id}`),

  create: (sale: Record<string, unknown>) =>
    apiFetch<{ data: any }>('/api/sales', {
      method: 'POST',
      body:   JSON.stringify(sale),
    }),
};

// ─── Customers API ────────────────────────────────────────────────────────────

export const customersApi = {
  list: (q?: string) =>
    apiFetch<{ data: any[]; total: number }>(`/api/customers${q ? `?q=${q}` : ''}`),

  getById: (id: string) =>
    apiFetch<{ data: any }>(`/api/customers/${id}`),

  create: (customer: Record<string, unknown>) =>
    apiFetch<{ data: any }>('/api/customers', {
      method: 'POST',
      body:   JSON.stringify(customer),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<{ data: any }>(`/api/customers/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(data),
    }),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

export const dashboardApi = {
  getMetrics: () =>
    apiFetch<{ data: any }>('/api/dashboard/metrics'),
};

// ─── AI API ───────────────────────────────────────────────────────────────────

export const aiApi = {
  chat: (message: string, history: any[], sessionId?: string) =>
    apiFetch<{ data: { response: string; sessionId: string } }>('/api/ai/chat', {
      method: 'POST',
      body:   JSON.stringify({ message, history, sessionId }),
    }),

  recommend: (productIds: string[], limit = 3) =>
    apiFetch<{ data: { suggestions: string[] } }>('/api/ai/recommend', {
      method: 'POST',
      body:   JSON.stringify({ productIds, limit }),
    }),

  getAlerts: () =>
    apiFetch<{ data: { alerts: { type: string; message: string }[] } }>('/api/ai/alerts'),
};
