import { getServerSession as getSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "vedprakasharya9973@gmail.com";

// Detect if we're running on HTTPS (production/Vercel)
const useSecureCookies = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

// Cookie names based on security requirements
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

/**
 * NextAuth configuration optimized for Vercel deployment
 * 
 * CRITICAL FIXES for session persistence:
 * 1. trustHost: true - Required for Vercel to properly handle cookies
 * 2. useSecureCookies - Auto-detected based on deployment environment
 * 3. Cookie names use __Secure- prefix only when HTTPS is available
 * 4. Removed __Host- prefix from CSRF (too restrictive for some deployments)
 * 5. redirect callback uses relative URLs (prevents cross-origin issues)
 * 6. proper sameSite: "lax" for OAuth compatibility
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],

  // Use JWT strategy for stateless sessions (required for Vercel serverless)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // JWT configuration with strong secret
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Cookie configuration - CRITICAL for session persistence
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },

  // Trust the host - CRITICAL for Vercel deployments
  // This tells NextAuth to trust the x-forwarded-host header
  trustHost: true,

  callbacks: {
    async signIn({ user, account }) {
      console.log("[NextAuth] signIn - provider:", account?.provider, "email:", user?.email);

      if (account?.provider === "google") {
        try {
          await connectDB();

          const existingUser = await User.findOne({
            email: user.email,
          });

          if (!existingUser) {
            const isAdmin =
              user.email?.toLowerCase().trim() ===
              ADMIN_EMAIL.toLowerCase().trim();

            console.log("[NextAuth] Creating user:", user.email, "isAdmin:", isAdmin);

            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: isAdmin ? "admin" : "user",
            });
          } else {
            // Update user info on each sign in
            await User.findByIdAndUpdate(existingUser._id, {
              name: user.name,
              image: user.image,
            });
          }

          return true;
        } catch (error) {
          console.error("[NextAuth] signIn DB error:", error);
          // Still return true - OAuth succeeds, DB ops can be retried
          return true;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Initial sign in - populate token from user
      if (user && account) {
        console.log("[NextAuth] JWT sign-in for:", user.email);

        try {
          await connectDB();

          const dbUser = await User.findOne({
            email: user.email,
          });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          } else {
            token.id = user.id || token.sub || "";
            token.role = user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()
              ? "admin"
              : "user";
          }
        } catch (error) {
          console.error("[NextAuth] JWT DB error:", error);
          token.id = token.sub || user.id || "";
          token.role = user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()
            ? "admin"
            : "user";
        }

        token.name = user.name || token.name;
        token.email = user.email || token.email;
        token.picture = user.image || token.picture;
      }

      return token;
    },

    async session({ session, token }) {
      console.log("[NextAuth] Session - id:", token.id, "role:", token.role, "email:", token.email);

      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || "";
        session.user.role = (token.role as "user" | "admin") || "user";
        session.user.name = (token.name as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.image = (token.picture as string) || "";
      }

      return session;
    },

    /**
     * CRITICAL FIX: Use relative URLs for redirects
     * This prevents cross-origin redirect issues on Vercel
     * The callbackUrl is automatically handled by NextAuth
     */
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] Redirect - url:", url, "baseUrl:", baseUrl);

      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Default: redirect to base URL
      return baseUrl;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  // Enable debug logs in production temporarily to diagnose issues
  // Set NEXTAUTH_DEBUG=true env var to enable
  debug: process.env.NEXTAUTH_DEBUG === "true" || process.env.NODE_ENV === "development",
};

// Wrapper for server-side session fetching - ALWAYS use this in API routes
export async function getServerSession() {
  return getSession(authOptions);
}
