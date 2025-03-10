import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { locations, secretLocations } from "./location";
import { characters } from "./character";

export const locationMessage = pgTable("location_message", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  locationId: uuid("location_id").references(() => locations.id, {
    onDelete: "cascade",
  }),
  secretLocationId: uuid("secret_location_id").references(
    () => secretLocations.id,
    {
      onDelete: "cascade",
    },
  ),
  characterId: uuid("character_id").references(() => characters.id, {
    onDelete: "cascade",
  }),
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
    .references(() => locationMessage.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 50 }),
});

export const locationWhispers = pgTable("location_whisper_message", {
  messageId: uuid("message_id")
    .primaryKey()
    .references(() => locationMessage.id, { onDelete: "cascade" }),
  recipientCharacterId: uuid("recipient_character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
});

export const locationSystemMessages = pgTable("location_system_message", {
  messageId: uuid("message_id")
    .primaryKey()
    .references(() => locationMessage.id, { onDelete: "cascade" }),
  systemType: varchar("system_type", { length: 50 }).notNull(),
  additionalData: text("additional_data"),
  recipientCharacterId: uuid("recipient_character_id").references(
    () => characters.id,
    { onDelete: "cascade" },
  ),
});

export const savedLocationMessages = pgTable("saved_location_message", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  htmlContent: text("html_content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
