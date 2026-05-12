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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check user auth
        const userData = localStorage.getItem("snapforest_user");
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed?.token && parsed?.email) {
            setUser(parsed);
          }
          setIsLoading(false);
          return;
        }

        // Check admin auth
        const adminData = localStorage.getItem("snapforest_admin");
        if (adminData) {
          const parsed = JSON.parse(adminData);
          if (parsed?.role === "admin" && parsed?.email) {
            setUser(parsed);
          }
        }
      } catch {
        // Invalid stored data
        localStorage.removeItem("snapforest_user");
        localStorage.removeItem("snapforest_admin");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("snapforest_user", JSON.stringify(data.data));
        setUser(data.data);
        return { success: true, message: "Login successful" };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch {
      return { success: false, message: "Network error" };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("snapforest_user", JSON.stringify(data.data));
        setUser(data.data);
        return { success: true, message: "Registration successful" };
      }
      return { success: false, message: data.message || "Registration failed" };
    } catch {
      return { success: false, message: "Network error" };
    }
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("snapforest_admin", JSON.stringify(data.data));
        setUser(data.data);
        return { success: true, message: "Admin login successful" };
      }
      return { success: false, message: data.message || "Admin login failed" };
    } catch {
      return { success: false, message: "Network error" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("snapforest_user");
    localStorage.removeItem("snapforest_admin");
    setUser(null);
    window.location.href = "/";
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (updated.role === "admin") {
        localStorage.setItem("snapforest_admin", JSON.stringify(updated));
      } else {
        localStorage.setItem("snapforest_user", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAdmin,
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
