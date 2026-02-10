"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import { clearToken, getToken, setToken } from "../lib/token";
import type { User } from "../lib/types";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function mapUser(u: any): User {
  return {
    id: String(u.id ?? u._id ?? ""),
    email: String(u.email ?? ""),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [tokenState, setTokenState] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refreshMe = React.useCallback(async () => {
    const t = getToken();
    setTokenState(t);
    if (!t) {
      setUser(null);
      return;
    }

    const res = await apiFetch<{ user: any }>("/auth/me", { method: "GET" });
    setUser(mapUser(res.user));
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } catch {
        clearToken();
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      setTokenState(res.token);
      setUser(mapUser(res.user));
      router.replace("/dashboard");
    },
    [router]
  );

  const register = React.useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      setTokenState(res.token);
      setUser(mapUser(res.user));
      router.replace("/dashboard");
    },
    [router]
  );

  const logout = React.useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value: AuthContextValue = {
    token: tokenState,
    user,
    loading,
    login,
    register,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

