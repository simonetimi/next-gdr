import { createSelectSchema } from "drizzle-zod";
import {
  offGameConversations,
  offGameMessages,
} from "@/database/schema/offGameChat";
import { z } from "zod";
import { characterSelectSchema } from "./character";

export const offGameMessageSchema = createSelectSchema(offGameMessages);

// base participant schema
const participantSchema = characterSelectSchema.pick({
  id: true,
  firstName: true,
  miniAvatarUrl: true,
});

// last message schema
const lastMessageSchema = offGameMessageSchema.pick({
  content: true,
  senderId: true,
});

export const offGameConversation = createSelectSchema(offGameConversations);

// full conversation schema with participants and last message
export const offGameConversationWithDetailsSchema = createSelectSchema(
  offGameConversations,
).extend({
  lastMessageAt: z.date().nullable(),
  lastMessage: lastMessageSchema.nullable(),
  participants: z.array(participantSchema),
  unreadCount: z.number(),
});

export const conversationParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  isCurrentUser: z.boolean(),
});

export const conversationDetailsSchema = offGameConversation.extend({
  participants: z.array(conversationParticipantSchema),
});
