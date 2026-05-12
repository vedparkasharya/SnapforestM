import { getServerSession as getSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";

const ADMIN_EMAIL = "vedprakasharya9973@gmail.com";

// Production domain - FIXED, never changes
const PRODUCTION_URL = "https://snapforest-m.vercel.app";

// Shared auth configuration - used by both the API route AND server-side session checks
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

  // Use JWT strategy for stateless sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Cookie configuration for production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.callback-url"
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Host-next-auth.csrf-token"
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

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
      console.log("[NextAuth] Session - id:", token.id, "role:", token.role);

      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || "";
        session.user.role = (token.role as "user" | "admin") || "user";
        session.user.name = (token.name as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.image = (token.picture as string) || "";
      }

      return session;
    },

    async redirect({ url }) {
      const productionUrl = PRODUCTION_URL;

      if (url.startsWith("/")) {
        return `${productionUrl}${url}`;
      }

      if (url.startsWith(productionUrl)) {
        return url;
      }

      return productionUrl;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Wrapper for server-side session fetching - ALWAYS use this in API routes
export async function getServerSession() {
  return getSession(authOptions);
}
