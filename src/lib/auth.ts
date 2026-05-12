import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './mongodb';
import User from '@/models/User';

// ============================================================
// ONE CONSISTENT NEXTAUTH_SECRET - USE THIS EXACT VALUE EVERYWHERE
// Local: .env.local
// Vercel: Dashboard > Environment Variables
// DO NOT CHANGE AFTER DEPLOYMENT - will invalidate all sessions
// ============================================================
const SECRET = '9dFjjXikJ7co7UXD+u4m7Kbdi4VmGzsbidEBL1eirgE=';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Explicit secret - highest priority, overrides env var
  secret: SECRET,

  pages: {
    signIn: '/login',
    error: '/login',
  },

  // ============================================================
  // COOKIE CONFIGURATION - Explicit names for consistency
  // across local dev and production environments
  // ============================================================
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // Required for __Secure- prefix, works on HTTPS (Vercel) and localhost in modern browsers
      },
    },
    callbackUrl: {
      name: '__Secure-next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
    csrfToken: {
      name: '__Host-next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },

  // ============================================================
  // JWT CONFIGURATION - Explicit signing using our secret
  // ============================================================
  jwt: {
    secret: SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ============================================================
  // SESSION CONFIGURATION
  // ============================================================
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // 24 hours
  },

  // ============================================================
  // CALLBACKS - JWT persists user data, session reads from JWT
  // ============================================================
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            const newUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'user',
            });
            // Store the DB user ID for the JWT callback
            (user as any).dbId = newUser._id.toString();
            (user as any).role = 'user';
          } else {
            // Store existing user data for JWT
            (user as any).dbId = existingUser._id.toString();
            (user as any).role = existingUser.role;
          }
        } catch (error) {
          console.error('SignIn error:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign-in: persist user data from signIn callback
      if (user) {
        token.id = (user as any).dbId || user.id || token.sub;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as any).role || 'user';
        token.sub = (user as any).dbId || user.id || token.sub;
      }

      // Handle session update trigger (e.g., from client)
      if (trigger === 'update' && session) {
        token.name = session.name || token.name;
        token.picture = session.image || token.picture;
      }

      // Persist access_token from OAuth provider
      if (account) {
        token.accessToken = account.access_token;
      }

      return token;
    },

    async session({ session, token }) {
      // Transfer ALL user data from JWT token to session
      // This is what useSession() reads on the client
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = (token.picture as string) || null;
        (session.user as any).role = (token.role as string) || 'user';
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Always redirect to the callback URL or home
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // ============================================================
  // DEBUG - Enable in development for troubleshooting
  // ============================================================
  debug: process.env.NODE_ENV === 'development',

  // ============================================================
  // EVENTS - Log for debugging
  // ============================================================
  events: {
    async signIn(message) {
      console.log('[NextAuth] SignIn success:', message.user.email);
    },
    async signOut(message) {
      console.log('[NextAuth] SignOut:', message.token?.email);
    },
    async createUser(message) {
      console.log('[NextAuth] User created:', message.user.email);
    },
    async session(message) {
      console.log('[NextAuth] Session accessed:', message.session?.user?.email);
    },
  },
};
