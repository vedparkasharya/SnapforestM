"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Auth Provider wrapper for NextAuth SessionProvider
 * 
 * - refetchOnWindowFocus: true (refresh session when user returns to tab)
 * - refetchInterval: 0 (disabled - rely on JWT expiry instead)
 * - basePath: "/api/auth" (default NextAuth API path)
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  );
}
