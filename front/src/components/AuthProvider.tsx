"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  SESSION_EXPIRED_EVENT,
  apiFetch,
} from "@/lib/api-client";
import { runAuthenticatedMutation } from "@/lib/session-flow.mjs";

export type SessionUser = {
  id: number;
  username: string;
  accountname: string;
  is_guest: false;
};

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    apiFetch<SessionUser>("/auth/me", { method: "GET" })
      .then((sessionUser) => {
        if (active) setUser(sessionUser);
      })
      .catch((error) => {
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error("Unable to restore the session:", error);
        }
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const clearExpiredSession = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, clearExpiredSession);

    return () => {
      active = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, clearExpiredSession);
    };
  }, []);

  const value = useMemo(() => ({ user, loading, logout }), [user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function useSessionMutation() {
  const { user } = useAuth();

  return useCallback(
    <T,>(request: () => Promise<T>) =>
      runAuthenticatedMutation({
        hasSession: Boolean(user),
        request,
      }) as Promise<T>,
    [user],
  );
}
