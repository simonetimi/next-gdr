import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { AppConfig } from "@/utils/config/AppConfig";

const sql = neon<boolean, boolean>(AppConfig.getDatabaseUrl() ?? "");
export const db = drizzle({ client: sql });
