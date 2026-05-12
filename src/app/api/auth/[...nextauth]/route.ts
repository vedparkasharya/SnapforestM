
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

            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: isAdmin ? "admin" : "user",
            });
          }

          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        try {
          await connectDB();

          const dbUser = await User.findOne({
            email: user.email,
          });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error(error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;

        session.user.name = token.name || "";
        session.user.email = token.email || "";
        session.user.image = token.picture || "";
      }

      return session;
    },
  },

  pages: {
    signIn: "/",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
