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
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  raceId: uuid("race_id")
    .references(() => races.id)
    .notNull(),
  currentExperience: integer("current_experience").default(0),
  totalExperience: integer("total_experience").default(0),
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
