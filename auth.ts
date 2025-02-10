import { db } from "@/db/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
} from "@/db/schema/auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { eq } from "drizzle-orm";
import { Provider } from "next-auth/providers";
import GitHub, { GitHubProfile } from "next-auth/providers/github";

const providers: Provider[] = [
  GitHub({
    profile(profile: GitHubProfile) {
      return {
        ...profile,
        id: profile.id.toString(),
        role: (profile.role as string) ?? "user",
        image: profile.avatar_url,
      };
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  session: {
    maxAge: 60 * 30, // in seconds, before expiring (no requests)
    updateAge: 60, // in seconds, interval for refreshing the age
  },
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
    async signIn({ user }) {
      if (user) {
        const result = await db
          .selectDistinct({ role: users.role, isBanned: users.isBanned })
          .from(users)
          .where(eq(users.id, user.id!))
          .limit(1);
        const { isBanned, role } = result[0];
        user.name = role;
        // TODO customize redirect if user is banned. can return a string (acts as callback url)
        if (!isBanned) return true;
      }
      return false;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  providers,
});

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");
