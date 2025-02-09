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
  ...authConfig,
});
