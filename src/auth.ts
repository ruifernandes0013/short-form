import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { provisionFreeUser } from "@/lib/credits";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      // Expose user ID to the client session
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    // Provision FREE plan + credits on first sign-up
    async createUser({ user }) {
      if (user.id) {
        try {
          await provisionFreeUser(user.id);
        } catch (err) {
          console.error("[auth] provisionFreeUser failed:", err);
          // Don't block login — user can still sign in, credits will be 0
        }
      }
    },
  },
});
