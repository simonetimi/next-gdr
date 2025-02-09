import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers";

import { GitHubProfile } from "next-auth/providers/github";

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

export default { providers } satisfies NextAuthConfig;
