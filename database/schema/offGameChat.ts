import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { characters } from "@/database/schema/character";

export const offGameConversations = pgTable("off_game_conversation", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  isGroup: boolean("is_group").default(false).notNull(),
  name: varchar("name", { length: 50 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  adminId: uuid("admin_id").references(() => characters.id, {
    onDelete: "cascade",
  }),
});

export const offGameParticipants = pgTable("off_game_participant", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: uuid("conversation_id").references(
    () => offGameConversations.id,
    { onDelete: "cascade" },
  ),
  characterId: uuid("character_id").references(() => characters.id, {
    onDelete: "cascade",
  }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// "isSystem" will allow for system messages like "user left the conversation"
export const offGameMessages = pgTable(
  "off_game_message",
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: uuid("conversation_id")
      .references(() => offGameConversations.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    isSystem: boolean("is_system").default(false),
    senderId: uuid("sender_id").references(() => characters.id, {
      onDelete: "cascade",
    }),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => [
    index("conversation_id_idx").on(table.conversationId),
    index("sent_at_idx").on(table.sentAt),
  ],
);

export const offGameReads = pgTable(
  "off_game_read",
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: uuid("message_id").references(() => offGameMessages.id, {
      onDelete: "cascade",
    }),
    readBy: uuid("read_by").references(() => characters.id, {
      onDelete: "cascade",
    }),
    readAt: timestamp("read_at").defaultNow().notNull(),
  },
  (table) => [index("message_read_idx").on(table.messageId, table.readBy)],
);

export const offGameParticipantDeletions = pgTable(
  "off_game_participant_deletions",
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    participantId: uuid("participant_id").references(
      () => offGameParticipants.id,
      { onDelete: "cascade" },
    ),
    deletedAt: timestamp("deleted_at").defaultNow().notNull(),
  },
);
