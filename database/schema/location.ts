import {
  pgTable,
  text,
  uuid,
  boolean,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { characters } from "@/database/schema/character";

export const locations = pgTable("location", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  hidden: boolean("hidden").default(false),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
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

export const secretLocations = pgTable("secret_location", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => characters.id),
});

export const locationAccesses = pgTable("location_access", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  locationId: uuid("location_id").references(() => locations.id, {
    onDelete: "cascade",
  }),
  secretLocationId: uuid("secret_location_id").references(
    () => secretLocations.id,
    { onDelete: "cascade" },
  ),
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  accessTime: timestamp("access_time").defaultNow().notNull(),
});
