import authConfig from "@/auth.config";
import { db } from "@/db/db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  pages: {
    signIn: "/signin",
  },
  ...authConfig,
});

export const providerMap = authConfig.providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");
