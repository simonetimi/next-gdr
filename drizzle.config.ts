import { defineConfig, Config } from "drizzle-kit";

export default defineConfig({
  schema: "./database/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === "production",
  },
  verbose: true,
  strict: true,
} as Config);
