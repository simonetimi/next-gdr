import { users } from "@/db/schema/auth";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const characters = pgTable("character", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull().unique(),
  creation: timestamp("creation", { mode: "date" }).defaultNow().notNull(),
  race: text("race").references(() => races.id),
  currentExperience: integer("current_experience").default(0),
  totalExperience: integer("total_experience").default(0),
});

export const races = pgTable("race", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
});

export const characterFriends = pgTable("character_friend", {
  characterId: text("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  friendId: text("friend_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull(),
});
