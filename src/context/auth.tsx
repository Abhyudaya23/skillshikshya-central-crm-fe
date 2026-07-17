import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/auth.service";
import { usersService } from "@/services/users.service";
import type { User } from "@/types";

const SESSION_KEY = "scc.session.email";

interface AuthState {
  status: "loading" | "authenticated" | "unauthenticated";
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Tokens live in httpOnly cookies, so the client can't inspect them.
 * We probe GET /users/ on load: 200 means the cookie session is valid
 * (regular users only get their own profile back, which is exactly
 * what we need for "current user"); 401 means login is required.
 */
async function fetchCurrentUser(): Promise<User | null> {
  const email = localStorage.getItem(SESSION_KEY);
  const page = await usersService.list({ page: 1, page_size: 100 });
  if (email) {
    const match = page.results.find((u) => u.email === email);
    if (match) return match;
  }
  return page.results[0] ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthState["status"]>("loading");
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const me = await fetchCurrentUser();
      setUser(me);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const onLogout = () => {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      setStatus("unauthenticated");
    };
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      await authService.login({ email, password });
      localStorage.setItem(SESSION_KEY, email);
      await refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout, refreshUser }),
    [status, user, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
