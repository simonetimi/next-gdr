import { users } from "@/db/schema/auth";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const characters = pgTable("character", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull().unique(),
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  raceId: text("race_id")
    .references(() => races.id)
    .notNull(),
  currentExperience: integer("current_experience").default(0),
  totalExperience: integer("total_experience").default(0),
});

export const characterInsertSchema = createInsertSchema(characters);
export const characterSelectSchema = createSelectSchema(characters);

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
