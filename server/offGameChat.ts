import { db } from "@/database/db";
import {
  offGameConversations,
  offGameMessages,
  offGameParticipants,
  offGameReads,
} from "@/database/schema/offGameMessage";
import { getCurrentCharacterIdOnly } from "@/server/character";
import { eq, and, desc, max, lt } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

export async function getConversations() {
  const characterId = await getCurrentCharacterIdOnly();

  // fetches all the conversations for this user, grouped by single vs group conversation, ordered by last message exchanged

  return db
    .select({
      id: offGameConversations.id,
      isGroup: offGameConversations.isGroup,
      name: offGameConversations.name,
      createdAt: offGameConversations.createdAt,
      lastMessageAt: max(offGameMessages.sentAt),
    })
    .from(offGameConversations)
    .innerJoin(
      offGameParticipants,
      and(
        eq(offGameParticipants.conversationId, offGameConversations.id),
        eq(offGameParticipants.characterId, characterId.id!),
      ),
    )
    .leftJoin(
      offGameMessages,
      eq(offGameMessages.conversationId, offGameConversations.id),
    )
    .groupBy(
      offGameConversations.id,
      offGameConversations.isGroup,
      offGameConversations.name,
      offGameConversations.createdAt,
    )
    .orderBy(desc(max(offGameMessages.sentAt)));
}

export async function getConversationMessages(
  conversationId: string,
  cursor?: string,
  limit: number = 50,
) {
  const t = await getTranslations("errors");
  const characterId = await getCurrentCharacterIdOnly();

  // check if user is participant
  const participant = await db
    .select()
    .from(offGameParticipants)
    .where(
      and(
        eq(offGameParticipants.conversationId, conversationId),
        eq(offGameParticipants.characterId, characterId.id!),
      ),
    )
    .limit(1);

  if (!participant.length) {
    throw new Error(t("auth.unauthorized"));
  }

  // fetch messages with cursor-based pagination
  const messages = await db
    .select({
      id: offGameMessages.id,
      content: offGameMessages.content,
      sentAt: offGameMessages.sentAt,
      senderId: offGameMessages.senderId,
    })
    .from(offGameMessages)
    .where(
      and(
        eq(offGameMessages.conversationId, conversationId),
        cursor ? lt(offGameMessages.id, cursor) : undefined,
      ),
    )
    .orderBy(desc(offGameMessages.sentAt))
    .limit(limit);

  // mark messages as read
  await db
    .insert(offGameReads)
    .values(
      messages.map((message) => ({
        messageId: message.id,
        readBy: characterId.id!,
      })),
    )
    .onConflictDoNothing();

  return messages;
}
