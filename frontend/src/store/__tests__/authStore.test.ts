import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiPost } from '@/helpers/api';
import { useAuthStore } from '../authStore';

vi.mock('@/helpers/api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}));

const mockedPost = vi.mocked(apiPost);

const customerUser = {
  id: 'u1',
  name: 'Ali',
  phone: '03001234567',
  email: null,
  role: 'CUSTOMER' as const,
};

const authPayload = {
  token: 'tok-123',
  user: customerUser,
};

describe('authStore login', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      hydrated: false,
      loading: false,
      error: null,
    });
  });

  it('stores the token and user on success', async () => {
    mockedPost.mockResolvedValue(authPayload);
    const ok = await useAuthStore.getState().login('03001234567', 'secret');

    expect(ok).toBe(true);
    expect(mockedPost).toHaveBeenCalledWith('/auth/login', {
      identifier: '03001234567',
      password: 'secret',
    });
    expect(useAuthStore.getState().token).toBe('tok-123');
    expect(useAuthStore.getState().user?.name).toBe('Ali');
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('mirrors the token into localStorage for the api client', async () => {
    mockedPost.mockResolvedValue(authPayload);
    await useAuthStore.getState().login('03001234567', 'secret');

    expect(window.localStorage.getItem('tailor_auth_token')).toBe('tok-123');
  });

  it('clears the token and stores the error code on failure', async () => {
    mockedPost.mockRejectedValue(
      Object.assign(new Error('bad credentials'), { code: 'UNAUTHORIZED' }),
    );

    const ok = await useAuthStore.getState().login('03001234567', 'wrong');

    expect(ok).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().error).toBe('UNAUTHORIZED');
    expect(window.localStorage.getItem('tailor_auth_token')).toBeNull();
  });

  it('uses NETWORK_ERROR when the error has no code', async () => {
    mockedPost.mockRejectedValue(new Error('boom'));

    await useAuthStore.getState().login('03001234567', 'secret');

    expect(useAuthStore.getState().error).toBe('NETWORK_ERROR');
  });
});

describe('authStore register', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      hydrated: false,
      loading: false,
      error: null,
    });
  });

  it('posts to /auth/register and keeps the session', async () => {
    mockedPost.mockResolvedValue(authPayload);
    const ok = await useAuthStore
      .getState()
      .register({ name: 'Ali', phone: '03001234567', password: 'secret' });

    expect(ok).toBe(true);
    expect(mockedPost).toHaveBeenCalledWith('/auth/register', {
      name: 'Ali',
      phone: '03001234567',
      password: 'secret',
    });
    expect(useAuthStore.getState().token).toBe('tok-123');
  });
});

describe('authStore logout', () => {
  it('clears token, user and localStorage', () => {
    useAuthStore.getState().setAuth('tok-9', customerUser);
    expect(window.localStorage.getItem('tailor_auth_token')).toBe('tok-9');

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(window.localStorage.getItem('tailor_auth_token')).toBeNull();
  });
});