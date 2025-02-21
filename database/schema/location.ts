import { pgTable, text, uuid, boolean, varchar } from "drizzle-orm/pg-core";

export const locations = pgTable("location", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  hidden: boolean("hidden").default(false),
  description: text("description"),
  imageUrl: text("image_url"),
  locationGroupId: uuid("location_group_id").references(
    () => locationGroups.id,
  ),
});

export const locationGroups = pgTable("location_group", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 50 }).notNull().unique(),
  hidden: boolean("hidden").default(false),
  description: text("description"),
});
