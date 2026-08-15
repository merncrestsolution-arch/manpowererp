import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getCurrentUser, login as loginRequest } from "@/lib/api";
import type { User } from "@/lib/types";

const TOKEN_KEY = "jk_manpower_token";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const response = await getCurrentUser(storedToken);

    if (!response.success || !response.data) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const response = await loginRequest(email, password, rememberMe);

      if (!response.success || !response.data) {
        return response.error ?? "Unable to sign in";
      }

      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return null;
    },
    [],
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
