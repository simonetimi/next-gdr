import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "@/database/schema/auth";

export const userSettings = pgTable("user_settings", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chatDirection: varchar("chat_direction", {
    length: 10,
    enum: ["standard", "reverse"],
  }).notNull(),
});
