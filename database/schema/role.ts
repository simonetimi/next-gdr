import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "@/database/schema/auth";

export const roles = pgTable("role", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: varchar("type", { length: 50, enum: ["admin", "master"] }),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
});
