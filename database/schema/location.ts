import { pgTable, text, uuid, boolean } from "drizzle-orm/pg-core";

export const locations = pgTable("location", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  name: text("name").notNull().unique(),
  hidden: boolean("hidden").default(false),
  description: text("description"),
  locationGroupId: uuid("location_group_id").references(
    () => locationGroups.id,
  ),
});

export const locationGroups = pgTable("location_group", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
});
