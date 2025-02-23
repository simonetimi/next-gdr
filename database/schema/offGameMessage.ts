import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { characters } from "@/database/schema/character";

// TODO create indexes for frequent queries

export const offGameConversations = pgTable("off_game_conversation", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  isGroup: boolean("is_group").default(false).notNull(),
  name: varchar("name", { length: 50 }), // only for groups
  createdAt: date("created_at").defaultNow().notNull(),
  createdBy: uuid("character_id").references(() => characters.id, {
    onDelete: "cascade",
  }),
});

export const offGameParticipants = pgTable("off_game_participant", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: uuid("conversation_id").references(
    () => offGameConversations.id,
    {
      onDelete: "cascade",
    },
  ),
  characterId: uuid("character_id").references(() => characters.id, {
    onDelete: "cascade",
  }),
  joinedAt: date("joined_at").defaultNow().notNull(),
  newMessages: integer("new_messages").default(0).notNull(),
});

export const offGameMessages = pgTable("off_game_message", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: uuid("conversation_id").references(
    () => offGameConversations.id,
    {
      onDelete: "cascade",
    },
  ),
  senderId: uuid("sender_id").references(() => characters.id, {
    onDelete: "cascade",
  }),
  sentAt: date("sent_at").defaultNow().notNull(),
});

export const offGameReads = pgTable("off_game_read", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  messageId: uuid("message_id").references(() => offGameMessages.id, {
    onDelete: "cascade",
  }),
  characterId: uuid("character_id").references(() => characters.id, {
    onDelete: "cascade",
  }),
  readAt: date("read_at").defaultNow().notNull(),
});
