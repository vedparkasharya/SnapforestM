import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";

const ADMIN_EMAIL = "vedprakasharya9973@gmail.com";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("[Auth] signIn callback - provider:", account?.provider, "email:", user.email);
      if (account?.provider === "google") {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            // Auto-assign admin role for the designated admin email
            const isAdmin = user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
            console.log("[Auth] Creating new user:", user.email, "role:", isAdmin ? "admin" : "user");
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: isAdmin ? "admin" : "user",
            });
          } else {
            // If existing user is the admin email but role is "user", promote to admin
            if (existingUser.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() && existingUser.role !== "admin") {
              console.log("[Auth] Promoting to admin:", existingUser.email);
              existingUser.role = "admin";
              await existingUser.save();
            }
            console.log("[Auth] Existing user found:", existingUser.email, "role:", existingUser.role);
          }
          return true;
        } catch (error) {
          console.error("[Auth] signIn error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // On initial sign-in, user and account are provided — fetch role from DB
      if (user && account) {
        console.log("[Auth] jwt callback - initial sign-in for:", user.email);
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.sub = dbUser._id.toString();
            token.role = dbUser.role;
            token.email = dbUser.email;
            token.picture = dbUser.image;
            token.name = dbUser.name;
            console.log("[Auth] jwt token populated - id:", token.sub, "role:", token.role);
          } else {
            // Fallback: if DB user not found, use OAuth-provided values
            token.sub = user.id;
            token.role = "user";
            token.email = user.email;
            token.name = user.name;
            token.picture = user.image;
            console.warn("[Auth] jwt fallback - user not found in DB, using defaults");
          }
        } catch (error) {
          console.error("[Auth] jwt DB error:", error);
          token.role = "user";
        }
      }

      // Handle session update trigger from client
      if (trigger === "update" && session) {
        console.log("[Auth] jwt update trigger");
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      // Always populate session user from token — ensure all fields are present
      if (token && session) {
        session.user = session.user || {};
        (session.user as any).id = token.sub || "";
        (session.user as any).role = (token.role as "user" | "admin") || "user";
        session.user.name = token.name || session.user.name || "";
        session.user.email = token.email || session.user.email || "";
        session.user.image = token.picture || session.user.image || "";
        console.log("[Auth] session callback - id:", token.sub, "role:", token.role, "email:", token.email);
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
