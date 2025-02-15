import { users } from "@/database/schema/auth";
import { races } from "@/database/schema/race";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const characters = pgTable("character", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull().unique(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  miniAvatarUrl: text("mini_avatar_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  raceId: uuid("race_id")
    .references(() => races.id)
    .notNull(),
  currentExperience: integer("current_experience").default(0),
  totalExperience: integer("total_experience").default(0),
});

export const characterSheets = pgTable("character_sheet", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  characterId: uuid("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  avatarUrl: text("avatar_url"),
  musicUrl: text("music_url"),
  birthDate: timestamp("birth_date"),
  eyeColor: text("eye_color"),
  hairColor: text("hair_color"),
  height: text("height"),
  weight: text("weight"),
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
  relationshipType: text("relationship_type").notNull(),
});
