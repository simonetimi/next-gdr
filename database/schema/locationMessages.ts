import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { locations } from "./location";
import { characters } from "./character";

export const locationMessages = pgTable("location_message", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  type: varchar("type", {
    length: 50,
    enum: ["action", "whisper", "whisperAll", "master", "system"],
  }).notNull(),
});

export const locationActionMessages = pgTable("location_action_message", {
  messageId: uuid("message_id")
    .primaryKey()
    .references(() => locationMessages.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 50 }),
});

export const locationWhispers = pgTable("location_whisper_message", {
  messageId: uuid("message_id")
    .primaryKey()
    .references(() => locationMessages.id, { onDelete: "cascade" }),
  recipientCharacterId: uuid("recipient_character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
});

export const locationSystemMessages = pgTable("location_system_message", {
  messageId: uuid("message_id")
    .primaryKey()
    .references(() => locationMessages.id, { onDelete: "cascade" }),
  systemType: varchar("system_type", { length: 50 }).notNull(),
  additionalData: text("additional_data"),
  recipientCharacterId: uuid("recipient_character_id").references(
    () => characters.id,
    { onDelete: "cascade" },
  ),
});
