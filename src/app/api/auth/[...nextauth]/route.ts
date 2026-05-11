import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";

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
            console.log("[Auth] Creating new user:", user.email);
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user",
            });
          } else {
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
    async jwt({ token, user, account }) {
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
            console.log("[Auth] jwt token populated - id:", token.sub, "role:", token.role);
          } else {
            // Fallback: if DB user not found, use OAuth-provided values
            token.sub = user.id;
            token.role = "user";
            token.email = user.email;
            console.warn("[Auth] jwt fallback - user not found in DB, using defaults");
          }
        } catch (error) {
          console.error("[Auth] jwt DB error:", error);
          token.role = "user";
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Derive session user from token — no DB calls needed
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "user";
        console.log("[Auth] session callback - id:", token.sub, "role:", token.role);
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
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
