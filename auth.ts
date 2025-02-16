import { db } from "@/database/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
} from "@/database/schema/auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { eq } from "drizzle-orm";
import { Provider } from "next-auth/providers";
import GitHub, { GitHubProfile } from "next-auth/providers/github";
import { BANNED_ROUTE } from "@/utils/routes";

const providers: Provider[] = [
  GitHub({
    profile(profile: GitHubProfile) {
      return {
        ...profile,
        id: profile.id.toString(),
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
          .selectDistinct({ isBanned: users.isBanned })
          .from(users)
          .where(eq(users.id, user.id!))
          .limit(1);

        /// first login
        if (!result.length) return true;

        const { isBanned } = result[0];

        // redirect to banned page
        if (isBanned) return BANNED_ROUTE;
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
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
