import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchCurrentUser,
  loginRequest,
  registerRequest,
  type AuthUser,
} from '../api/auth-api';
import {
  ApiError,
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isInitializing: boolean;
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const storedToken = getStoredAccessToken();
    if (!storedToken) {
      setIsInitializing(false);
      return () => {
        isCancelled = true;
      };
    }
    setAccessToken(storedToken);
    void (async () => {
      try {
        const profile = await fetchCurrentUser(storedToken);
        if (!isCancelled) {
          setUser(profile);
        }
      } catch {
        clearStoredAccessToken();
        if (!isCancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setErrorMessage(null);
    try {
      const tokensPayload = await loginRequest(email, password);
      setStoredAccessToken(tokensPayload.accessToken);
      setAccessToken(tokensPayload.accessToken);
      const profile = await fetchCurrentUser(tokensPayload.accessToken);
      setUser(profile);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Đăng nhập thất bại';
      setErrorMessage(message);
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setErrorMessage(null);
    try {
      const tokensPayload = await registerRequest(email, password);
      setStoredAccessToken(tokensPayload.accessToken);
      setAccessToken(tokensPayload.accessToken);
      const profile = await fetchCurrentUser(tokensPayload.accessToken);
      setUser(profile);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Đăng ký thất bại';
      setErrorMessage(message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredAccessToken();
    setAccessToken(null);
    setUser(null);
    setErrorMessage(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isInitializing,
      errorMessage,
      login,
      register,
      logout,
      clearError,
    }),
    [
      user,
      accessToken,
      isInitializing,
      errorMessage,
      login,
      register,
      logout,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
