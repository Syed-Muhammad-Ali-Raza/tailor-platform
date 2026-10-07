const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

const TIMEOUT_MS = 15000;
const TOKEN_KEY = 'tailor_auth_token';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function buildHeaders(body?: unknown): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = readToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function buildSignal(signal?: AbortSignal | null): AbortSignal | undefined {
  if (signal) return signal;
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return AbortSignal.timeout(TIMEOUT_MS);
  }
  return undefined;
}

async function request<T>(
  path: string,
  method: string,
  body?: unknown,
  signal?: AbortSignal | null,
): Promise<T | null> {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: buildHeaders(body),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: buildSignal(signal),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 'TIMEOUT', 0);
    }
    throw new ApiError('Network request failed', 'NETWORK_ERROR', 0);
  }

  if (response.status === 204) return null;

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const envelope = payload as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string; details?: unknown };
  } | null;

  if (!response.ok || !envelope || envelope.success !== true) {
    const code = envelope?.error?.code ?? `HTTP_${response.status}`;
    const message = envelope?.error?.message ?? `Request failed (${response.status})`;
    throw new ApiError(message, code, response.status, envelope?.error?.details);
  }

  return (envelope.data ?? null) as T | null;
}

export function apiGet<T>(
  path: string,
  signal?: AbortSignal | null,
): Promise<T | null> {
  return request<T>(path, 'GET', undefined, signal);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T | null> {
  return request<T>(path, 'POST', body);
}

export function apiPut<T>(path: string, body?: unknown): Promise<T | null> {
  return request<T>(path, 'PUT', body);
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T | null> {
  return request<T>(path, 'PATCH', body);
}

export function apiDelete<T = void>(
  path: string,
  signal?: AbortSignal | null,
): Promise<T | null> {
  return request<T>(path, 'DELETE', undefined, signal);
}
