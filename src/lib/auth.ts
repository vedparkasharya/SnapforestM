import { getServerSession as getSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "vedprakasharya9973@gmail.com";

/**
 * NextAuth Configuration - Simplified & Reliable
 *
 * CRITICAL PRINCIPLES:
 * 1. ONE consistent NEXTAUTH_SECRET env var across all environments
 * 2. Default NextAuth cookies (most reliable, auto-secure)
 * 3. trustHost: true for Vercel serverless
 * 4. JWT strategy for stateless sessions
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

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Trust host headers - REQUIRED for Vercel
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
            await User.findByIdAndUpdate(existingUser._id, {
              name: user.name,
              image: user.image,
            });
          }

          return true;
        } catch (error) {
          console.error("[NextAuth] signIn DB error:", error);
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
          const dbUser = await User.findOne({ email: user.email });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          } else {
            token.id = user.id || token.sub || "";
            token.role =
              user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()
                ? "admin"
                : "user";
          }
        } catch (error) {
          console.error("[NextAuth] JWT DB error:", error);
          token.id = token.sub || user.id || "";
          token.role =
            user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()
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
      console.log("[NextAuth] Session callback - email:", token.email, "role:", token.role);

      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || "";
        session.user.role = (token.role as "user" | "admin") || "user";
        session.user.name = (token.name as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.image = (token.picture as string) || "";
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] Redirect - url:", url, "baseUrl:", baseUrl);

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  // Use secret from env var - MUST be consistent across deploys
  secret: process.env.NEXTAUTH_SECRET,

  // Debug only in development
  debug: process.env.NODE_ENV === "development",
};

export async function getServerSession() {
  return getSession(authOptions);
}
