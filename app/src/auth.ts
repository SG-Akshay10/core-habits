import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    // Database sessions: the session row lives in Postgres and the client
    // only holds an opaque, HTTP-only session token cookie.
    strategy: "database",
  },
  providers: [
    Google({
      // Minimal scopes only — nothing beyond basic profile/email.
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Default timezone on first login; the client overwrites this with
      // the real browser timezone via /api/user/timezone right after.
      if (!user.id) return;
      await prisma.user.update({
        where: { id: user.id },
        data: { timezone: "UTC" },
      });
    },
  },
});
