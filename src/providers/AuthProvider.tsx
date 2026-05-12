"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
