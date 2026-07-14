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
import { createSessionFlow, runSessionMutation } from "@/lib/session-flow.mjs";

export type SessionUser = {
  id: number;
  username: string;
  accountname: string;
  is_guest: boolean;
};

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  startGuestSession: (force?: boolean) => Promise<SessionUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = useCallback((nextUser: SessionUser | null) => {
    setUser(nextUser);
  }, []);

  const sessionFlow = useMemo(
    () =>
      createSessionFlow({
        restoreSession: async () => {
          try {
            return await apiFetch<SessionUser>("/auth/me", { method: "GET" });
          } catch (error) {
            if (!(error instanceof ApiError && error.status === 401)) {
              console.error("Unable to restore the session:", error);
            }
            return null;
          }
        },
        createGuestSession: async () => {
          const response = await apiFetch<{ user: SessionUser }>("/auth/guest", {
            method: "POST",
          });
          return response.user;
        },
        onUserChange: updateUser,
      }),
    [updateUser],
  );

  const startGuestSession = useCallback(
    (force = false) => sessionFlow.startGuestSession(force),
    [sessionFlow],
  );

  const logout = useCallback(async () => {
    await sessionFlow.waitForRestoration();
    await apiFetch("/auth/logout", { method: "POST" });
    sessionFlow.clear();
  }, [sessionFlow]);

  useEffect(() => {
    let active = true;

    sessionFlow
      .restore()
      .finally(() => {
        if (active) setLoading(false);
      });

    const clearExpiredSession = () => sessionFlow.clear();
    window.addEventListener(SESSION_EXPIRED_EVENT, clearExpiredSession);

    return () => {
      active = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, clearExpiredSession);
    };
  }, [sessionFlow]);

  const value = useMemo(
    () => ({ user, loading, startGuestSession, logout }),
    [user, loading, startGuestSession, logout],
  );

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
  const { user, startGuestSession } = useAuth();

  return useCallback(
    <T,>(request: () => Promise<T>) =>
      runSessionMutation({
        hasSession: Boolean(user),
        startGuestSession,
        request,
        isUnauthorized: (error: unknown) =>
          error instanceof ApiError && error.status === 401,
      }) as Promise<T>,
    [user, startGuestSession],
  );
}
