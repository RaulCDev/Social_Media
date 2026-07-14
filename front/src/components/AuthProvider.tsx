"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  SESSION_EXPIRED_EVENT,
  apiFetch,
} from "@/lib/api-client";

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
  const userRef = useRef<SessionUser | null>(null);
  const restorePromiseRef = useRef<Promise<SessionUser | null> | null>(null);
  const guestPromiseRef = useRef<Promise<SessionUser> | null>(null);

  const updateUser = useCallback((nextUser: SessionUser | null) => {
    userRef.current = nextUser;
    setUser(nextUser);
  }, []);

  const startGuestSession = useCallback(
    async (force = false) => {
      if (restorePromiseRef.current) {
        await restorePromiseRef.current;
      }
      if (!force && userRef.current) {
        return userRef.current;
      }
      if (!guestPromiseRef.current) {
        guestPromiseRef.current = apiFetch<{ user: SessionUser }>("/auth/guest", {
          method: "POST",
        })
          .then((response) => {
            updateUser(response.user);
            return response.user;
          })
          .finally(() => {
            guestPromiseRef.current = null;
          });
      }
      return guestPromiseRef.current;
    },
    [updateUser],
  );

  const logout = useCallback(async () => {
    if (restorePromiseRef.current) {
      await restorePromiseRef.current;
    }
    await apiFetch("/auth/logout", { method: "POST" });
    updateUser(null);
  }, [updateUser]);

  useEffect(() => {
    let active = true;

    const restorePromise = apiFetch<SessionUser>("/auth/me", { method: "GET" })
      .then((currentUser) => {
        if (active) updateUser(currentUser);
        return currentUser;
      })
      .catch((error: unknown) => {
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error("Unable to restore the session:", error);
        }
        return null;
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    restorePromiseRef.current = restorePromise;

    const clearExpiredSession = () => updateUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, clearExpiredSession);

    return () => {
      active = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, clearExpiredSession);
    };
  }, [updateUser]);

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
    async <T,>(request: () => Promise<T>) => {
      if (!user) {
        await startGuestSession();
      }
      try {
        return await request();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await startGuestSession(true);
          return request();
        }
        throw error;
      }
    },
    [user, startGuestSession],
  );
}
