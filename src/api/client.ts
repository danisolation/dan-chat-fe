const ACCESS_TOKEN_STORAGE_KEY = 'dan_chat_access_token';

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setStoredAccessToken(accessToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
}

export function clearStoredAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

function resolveApiUrl(path: string): string {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const normalizedBase =
    typeof configuredBaseUrl === 'string' && configuredBaseUrl.length > 0
      ? configuredBaseUrl.replace(/\/$/, '')
      : '';
  if (normalizedBase.length > 0) {
    return `${normalizedBase}${path}`;
  }
  return path;
}

export class ApiError extends Error {
  readonly status: number;

  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function extractErrorMessage(body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const rawMessage = (body as { message: unknown }).message;
    if (typeof rawMessage === 'string') {
      return rawMessage;
    }
    if (Array.isArray(rawMessage)) {
      return rawMessage.filter((item) => typeof item === 'string').join(', ');
    }
  }
  return 'Request failed';
}

export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit & { accessToken?: string | null } = {},
): Promise<TResponse> {
  const { accessToken, headers: optionHeaders, ...rest } = options;
  const headers = new Headers(optionHeaders);
  if (!headers.has('Content-Type') && rest.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  const tokenToSend =
    accessToken === undefined ? getStoredAccessToken() : accessToken;
  if (tokenToSend) {
    headers.set('Authorization', `Bearer ${tokenToSend}`);
  }
  const response = await fetch(resolveApiUrl(path), {
    ...rest,
    headers,
  });
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const parsedBody = isJson ? await response.json().catch(() => null) : null;
  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(parsedBody),
      response.status,
      parsedBody,
    );
  }
  return parsedBody as TResponse;
}
