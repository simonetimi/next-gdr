import { defineConfig, Config } from "drizzle-kit";
import { AppConfig } from "@/utils/config/appConfig";

export default defineConfig({
  schema: "./database/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: AppConfig.getDatabaseUrl(),
    ssl: process.env.NODE_ENV === "production",
  },
  verbose: true,
  strict: true,
} as Config);
