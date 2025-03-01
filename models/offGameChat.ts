import { z } from "zod";
import {
  conversationDetailsSchema,
  offGameConversation,
  offGameConversationWithDetailsSchema,
  offGameMessageSchema,
} from "@/zod/schemas/offgameChat";

export type OffGameConversationWithDetails = z.infer<
  typeof offGameConversationWithDetailsSchema
>;
export type OffGameMessage = z.infer<typeof offGameMessageSchema>;

export type OffGameConversation = z.infer<typeof offGameConversation>;

export type ConversationDetails = z.infer<typeof conversationDetailsSchema>;
