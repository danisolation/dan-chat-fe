import { apiFetch } from './client';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthTokensPayload {
  accessToken: string;
  user: AuthUser;
}

export async function registerRequest(
  email: string,
  password: string,
): Promise<AuthTokensPayload> {
  return apiFetch<AuthTokensPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    accessToken: null,
  });
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthTokensPayload> {
  return apiFetch<AuthTokensPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    accessToken: null,
  });
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me', {
    method: 'GET',
    accessToken,
  });
}
