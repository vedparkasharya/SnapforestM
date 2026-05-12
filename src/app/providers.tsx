'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // Refetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // Refetch when window regains focus (user returns to tab)
      refetchOnWindowFocus={true}
      // Refetch between client and server to avoid hydration mismatch
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
