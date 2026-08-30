"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";

const TOKEN_COOKIE_NAME = "oteems_access_token";

function removeTokenCookie() {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

function clearSession() {
  removeAccessToken(); // localStorage
  removeTokenCookie(); // cookie
}

interface UserContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const currentUser = await getMe();
      setUser(currentUser);
    } catch (err) {
      clearSession();
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const currentUser = await getMe();
        if (!cancelled) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          clearSession();
          setUser(null);
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
