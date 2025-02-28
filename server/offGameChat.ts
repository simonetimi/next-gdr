import { db } from "@/database/db";
import { characters } from "@/database/schema/character";
import {
  offGameConversations,
  offGameMessages,
  offGameParticipants,
  offGameReads,
} from "@/database/schema/offGameChat";
import { getCurrentCharacterIdOnly } from "@/server/character";
import { eq, and, desc, lt, sql, inArray, ne } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

export async function getConversations() {
  const characterId = await getCurrentCharacterIdOnly();

  // fetch conversations with their latest message
  const conversations = await db
    .select({
      id: offGameConversations.id,
      isGroup: offGameConversations.isGroup,
      name: offGameConversations.name,
      imageUrl: offGameConversations.imageUrl,
      createdAt: offGameConversations.createdAt,
      createdBy: offGameConversations.createdBy,
      lastMessageContent: offGameMessages.content,
      lastMessageSenderId: offGameMessages.senderId,
      lastMessageSentAt: offGameMessages.sentAt,
    })
    .from(offGameConversations)
    .innerJoin(
      offGameParticipants,
      eq(offGameParticipants.conversationId, offGameConversations.id),
    )
    .leftJoin(
      offGameMessages,
      and(
        eq(offGameMessages.conversationId, offGameConversations.id),
        eq(
          offGameMessages.sentAt,
          sql`(
                  SELECT MAX(${offGameMessages.sentAt})
                  FROM ${offGameMessages}
                  WHERE ${offGameMessages.conversationId} = ${offGameConversations.id}
              )`,
        ),
      ),
    )
    .where(eq(offGameParticipants.characterId, characterId.id!))
    .orderBy(desc(offGameMessages.sentAt));

  // extract conversation IDs
  const conversationIds = conversations.map((conv) => conv.id);

  // fetch participants for these conversations
  const participants = await db
    .select({
      conversationId: offGameParticipants.conversationId,
      participantId: characters.id,
      participantFirstName: characters.firstName,
      participantMiniAvatarUrl: characters.miniAvatarUrl,
    })
    .from(offGameParticipants)
    .innerJoin(characters, eq(characters.id, offGameParticipants.characterId))
    .where(
      and(
        inArray(offGameParticipants.conversationId, conversationIds),
        // Fflter out current user
        ne(offGameParticipants.characterId, characterId.id!),
      ),
    );

  // group participants by conversationId
  const participantsMap = participants.reduce(
    (acc, participant) => {
      if (participant.conversationId) {
        if (!acc[participant.conversationId]) {
          acc[participant.conversationId] = [];
        }
        acc[participant.conversationId].push({
          id: participant.participantId,
          firstName: participant.participantFirstName,
          miniAvatarUrl: participant.participantMiniAvatarUrl ?? "",
        });
      }
      return acc;
    },
    {} as Record<
      string,
      Array<{ id: string; firstName: string; miniAvatarUrl: string }>
    >,
  );

  // combine conversations with their participants
  const results = conversations.map((conv) => ({
    id: conv.id,
    isGroup: conv.isGroup,
    name: conv.name,
    imageUrl: conv.imageUrl,
    createdAt: conv.createdAt,
    createdBy: conv.createdBy,
    lastMessageAt: conv.lastMessageSentAt || null,
    lastMessage: conv.lastMessageContent
      ? {
          content: conv.lastMessageContent,
          senderId: conv.lastMessageSenderId,
        }
      : null,
    participants: participantsMap[conv.id] || [],
  }));

  return results;
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
