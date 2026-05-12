import 'next-auth';
import { JWT } from 'next-auth/jwt';

// ============================================================
// TypeScript Module Augmentation for NextAuth.js
// Extends the built-in types with our custom fields
// ============================================================

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
      role: 'user' | 'admin';
    };
  }

  interface User {
    id?: string;
    dbId?: string;
    role?: 'user' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    dbId?: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
    role?: 'user' | 'admin';
    accessToken?: string;
    sub?: string;
  }
}
