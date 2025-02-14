import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const locations = pgTable("location", {
  id: uuid().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull().unique(),
  description: text("description"),
  locationGroupId: uuid("location_group_id").references(
    () => locationGroups.id,
  ),
});

export const locationGroups = pgTable("location_group", {
  id: uuid().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});
