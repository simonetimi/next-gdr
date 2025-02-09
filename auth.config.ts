import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers";

const providers: Provider[] = [GitHub];

export default { providers } satisfies NextAuthConfig;
