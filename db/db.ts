import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon<boolean, boolean>(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
