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
  name: varchar("name", { length: 50 }), // only for groups
  imageUrl: text("image_url"), // only for groups
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const offGameMessages = pgTable(
  "off_game_message",
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: uuid("conversation_id").references(
      () => offGameConversations.id,
      {
        onDelete: "cascade",
      },
    ),
    content: text("content").notNull(),
    senderId: uuid("sender_id").references(() => characters.id, {
      onDelete: "cascade",
    }),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index("conversation_id_idx").on(table.conversationId),
    sentAtIdx: index("sent_at_idx").on(table.sentAt),
  }),
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
  (table) => ({
    messageReadIdx: index("message_read_idx").on(table.messageId, table.readBy),
  }),
);
