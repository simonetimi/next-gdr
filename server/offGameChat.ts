import { db } from "@/database/db";
import { characters } from "@/database/schema/character";
import {
  offGameConversations,
  offGameMessages,
  offGameParticipantDeletions,
  offGameParticipants,
  offGameReads,
} from "@/database/schema/offGameChat";
import { getCurrentCharacterIdOnly } from "@/server/character";
import { eq, and, desc, lt, sql, inArray, ne, isNull, SQL } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { GameConfig } from "@/utils/config/GameConfig";

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
    // left join with participant deletions to check if conversation was deleted or quitted
    .leftJoin(
      offGameParticipantDeletions,
      eq(offGameParticipantDeletions.participantId, offGameParticipants.id),
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
    .where(
      and(
        eq(offGameParticipants.characterId, characterId.id!),
        // only include conversations that haven't been deleted or quitted by this participant
        isNull(offGameParticipantDeletions.id),
      ),
    )
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

  // get unread messages count for each conversation
  const unreadCounts = await db
    .select({
      conversationId: offGameMessages.conversationId,
      count: sql<number>`count(*)::int`,
    })
    .from(offGameMessages)
    .leftJoin(
      offGameReads,
      and(
        eq(offGameReads.messageId, offGameMessages.id),
        eq(offGameReads.readBy, characterId.id!),
      ),
    )
    .where(
      and(
        inArray(offGameMessages.conversationId, conversationIds),
        isNull(offGameReads.id),
        // Add this condition to exclude messages sent by the current user
        ne(offGameMessages.senderId, characterId.id!),
      ),
    )
    .groupBy(offGameMessages.conversationId);

  // Create a map of conversation IDs to unread counts
  const unreadCountMap = unreadCounts.reduce(
    (acc, { conversationId, count }) => {
      if (conversationId) {
        acc[conversationId] = count;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // combine conversations with their participants and unread counts
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
    unreadCount: unreadCountMap[conv.id] || 0,
  }));

  return results;
}

export async function getConversationMessages(
  conversationId: string,
  cursor?: string,
) {
  const limit = GameConfig.getMessagesLimitPerFetch();

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

  // base query for messages in this conversation
  let whereCondition: SQL | undefined = eq(
    offGameMessages.conversationId,
    conversationId,
  );

  // if cursor exists, find the timestamp of that message first
  if (cursor) {
    const cursorMessage = await db
      .select({ sentAt: offGameMessages.sentAt })
      .from(offGameMessages)
      .where(eq(offGameMessages.id, cursor))
      .limit(1);

    if (cursorMessage.length > 0) {
      // use that timestamp for consistent pagination
      whereCondition = and(
        whereCondition,
        lt(offGameMessages.sentAt, cursorMessage[0].sentAt),
      );
    }
  }

  const messages = await db
    .select()
    .from(offGameMessages)
    .where(whereCondition)
    .orderBy(desc(offGameMessages.sentAt))
    .limit(limit);

  // fetch readers for these messages
  const messageIds = messages.map((message) => message.id);
  const readers = await db
    .select({
      messageId: offGameReads.messageId,
      readerId: characters.id,
      readerFirstName: characters.firstName,
      readerMiniAvatarUrl: characters.miniAvatarUrl,
      readAt: offGameReads.readAt,
    })
    .from(offGameReads)
    .innerJoin(characters, eq(characters.id, offGameReads.readBy))
    .where(inArray(offGameReads.messageId, messageIds));

  // group readers by messageId
  const readersMap = readers.reduce(
    (acc, reader) => {
      if (reader.messageId) {
        if (!acc[reader.messageId]) {
          acc[reader.messageId] = [];
        }
        acc[reader.messageId].push({
          id: reader.readerId,
          firstName: reader.readerFirstName,
          miniAvatarUrl: reader.readerMiniAvatarUrl ?? "",
          readAt: reader.readAt,
        });
      }
      return acc;
    },
    {} as Record<
      string,
      Array<{
        id: string;
        firstName: string;
        miniAvatarUrl: string;
        readAt: Date;
      }>
    >,
  );

  // mark messages as read, but skip messages sent by current user
  if (messages.length > 0) {
    const messagesToMark = messages.filter(
      (message) => message.senderId !== characterId.id,
    );

    if (messagesToMark.length > 0) {
      await db
        .insert(offGameReads)
        .values(
          messagesToMark.map((message) => ({
            messageId: message.id,
            readBy: characterId.id!,
          })),
        )
        .onConflictDoNothing();
    }
  }

  return messages.map((message) => ({
    ...message,
    readers: readersMap[message.id] || [],
  }));
}

export async function getConversationDetails(conversationId: string) {
  const characterId = await getCurrentCharacterIdOnly();

  // get the conversation details
  const conversation = await db
    .select({
      id: offGameConversations.id,
      isGroup: offGameConversations.isGroup,
      name: offGameConversations.name,
      imageUrl: offGameConversations.imageUrl,
      createdAt: offGameConversations.createdAt,
      createdBy: offGameConversations.createdBy,
    })
    .from(offGameConversations)
    .where(eq(offGameConversations.id, conversationId))
    .limit(1);

  // get all participants with detailed information
  const participants = await db
    .select({
      id: characters.id,
      name: characters.firstName,
      avatarUrl: characters.miniAvatarUrl,
      isCurrentUser: sql<boolean>`${characters.id} = ${characterId.id}`,
    })
    .from(offGameParticipants)
    .innerJoin(characters, eq(characters.id, offGameParticipants.characterId))
    .where(eq(offGameParticipants.conversationId, conversationId));

  return {
    ...conversation[0],
    participants,
  };
}

export async function getOffGameUnreadMessagesCount() {
  const characterId = await getCurrentCharacterIdOnly();

  const result = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(offGameMessages)
    .innerJoin(
      offGameParticipants,
      eq(offGameParticipants.conversationId, offGameMessages.conversationId),
    )
    .leftJoin(
      offGameReads,
      and(
        eq(offGameReads.messageId, offGameMessages.id),
        eq(offGameReads.readBy, characterId.id!),
      ),
    )
    // left join with participant deletions to check if conversation was deleted
    .leftJoin(
      offGameParticipantDeletions,
      eq(offGameParticipantDeletions.participantId, offGameParticipants.id),
    )
    .where(
      and(
        eq(offGameParticipants.characterId, characterId.id!),
        isNull(offGameReads.id),
        ne(offGameMessages.senderId, characterId.id!),
        // only include messages from conversations that haven't been deleted or quitted
        isNull(offGameParticipantDeletions.id),
      ),
    );

  return result[0].count;
}
