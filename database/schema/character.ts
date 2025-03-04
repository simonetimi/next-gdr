import { users } from "@/database/schema/auth";
import { races } from "@/database/schema/race";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const characters = pgTable("character", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 50 }).notNull().unique(),
  middleName: varchar("middle_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  miniAvatarUrl: varchar("mini_avatar_url", { length: 200 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  raceId: uuid("race_id")
    .references(() => races.id)
    .notNull(),
  currentExperience: integer("current_experience").default(0),
  totalExperience: integer("total_experience").default(0),
  lastSeenAt: timestamp("last_seen_at", { mode: "date" }),
  isActive: boolean("is_active").default(true).notNull(),
});

export const characterSheets = pgTable("character_sheet", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  characterId: uuid("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  avatarUrl: varchar("avatar_url", { length: 50 }),
  musicUrl: varchar("music_url", { length: 50 }),
  birthDate: timestamp("birth_date"),
  eyeColor: varchar("eye_color", { length: 20 }),
  hairColor: varchar("hair_color", { length: 20 }),
  height: varchar("height", { length: 10 }),
  weight: varchar("weight", { length: 10 }),
  background: text("background"),
  customHTML: text("custom_html"),
  masterNotes: text("master_notes"),
});

export const characterFriends = pgTable("character_friend", {
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  friendId: uuid("friend_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  relationshipType: varchar("relationship_type", { length: 20 }).notNull(),
});
