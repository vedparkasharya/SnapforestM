"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function clearStoredAuth() {
  localStorage.removeItem("snapforest_user");
  localStorage.removeItem("snapforest_admin");
}

function persistUser(user: AuthUser) {
  const key = user.role === "admin" ? "snapforest_admin" : "snapforest_user";
  localStorage.setItem(key, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const validateStoredSession = async () => {
      try {
        const adminRaw = localStorage.getItem("snapforest_admin");
        const userRaw = localStorage.getItem("snapforest_user");
        const candidates = [adminRaw, userRaw].filter(Boolean) as string[];

        for (const raw of candidates) {
          try {
            const parsed = JSON.parse(raw) as AuthUser;
            if (!parsed?.token) continue;

            const res = await fetch("/api/auth/me", {
              headers: { Authorization: `Bearer ${parsed.token}`, Accept: "application/json" },
              cache: "no-store",
            });
            const data = await res.json();

            if (res.ok && data.success && data.data?.id) {
              const restored: AuthUser = { ...parsed, ...data.data, token: parsed.token };
              if (!cancelled) {
                persistUser(restored);
                setUser(restored);
              }
              return;
            }
          } catch {
            // Try the next stored session; malformed entries are cleared below.
          }
        }
      } finally {
        if (!cancelled) {
          if (!user) setUser(null);
          setIsLoading(false);
        }
      }
    };

    void validateStoredSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        persistUser(data.data);
        setUser(data.data);
        return { success: true, message: "Login successful" };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch {
      return { success: false, message: "Network error. Please check your connection." };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        persistUser(data.data);
        setUser(data.data);
        return { success: true, message: "Registration successful" };
      }
      return { success: false, message: data.message || "Registration failed" };
    } catch {
      return { success: false, message: "Network error. Please check your connection." };
    }
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        persistUser(data.data);
        setUser(data.data);
        return { success: true, message: "Admin login successful" };
      }

      if (res.status === 429) {
        const minutes = data.retryAfter ? Math.ceil(data.retryAfter / 60) : 15;
        return { success: false, message: `Too many attempts. Please try again in ${minutes} minutes.` };
      }
      if (res.status === 423) {
        const minutes = data.lockDuration ? Math.ceil(data.lockDuration / 60000) : 15;
        return { success: false, message: `Account locked. Please try again in ${minutes} minutes.` };
      }

      return { success: false, message: data.message || "Admin login failed" };
    } catch {
      return { success: false, message: "Network error. Please check your connection." };
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    window.location.assign("/");
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      persistUser(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        register,
        adminLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
