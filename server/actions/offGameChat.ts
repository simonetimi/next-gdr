"use server";

import { db } from "@/database/db";
import {
  offGameConversations,
  offGameMessages,
  offGameParticipants,
} from "@/database/schema/offGameChat";
import { getCurrentCharacterIdOnly } from "@/server/character";
import { aliasedTable, and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { OffGameConversation } from "@/models/offGameChat";

export async function createSingleOffGameConversation(
  targetCharacterId: string,
  message: string,
): Promise<OffGameConversation> {
  const currentCharacter = await getCurrentCharacterIdOnly();
  const currentCharacterId = currentCharacter.id!;

  const p1 = aliasedTable(offGameParticipants, "p1");
  const p2 = aliasedTable(offGameParticipants, "p2");

  // if the conversation exists, return the id
  const [existingConversation] = await db
    .select({
      conversation: offGameConversations,
    })
    .from(offGameConversations)
    .where(eq(offGameConversations.isGroup, false))
    .innerJoin(
      p1,
      and(
        eq(offGameConversations.id, p1.conversationId),
        eq(p1.characterId, currentCharacterId),
      ),
    )
    .innerJoin(
      p2,
      and(
        eq(offGameConversations.id, p2.conversationId),
        eq(p2.characterId, targetCharacterId as string),
      ),
    )
    .limit(1);

  if (existingConversation) {
    // if an existing conversation was found, add the new message to it
    await db.insert(offGameMessages).values({
      conversationId: existingConversation.conversation.id,
      content: message,
      senderId: currentCharacter.id,
    });

    return existingConversation.conversation;
  }

  // create the conversation
  const [conversation] = await db
    .insert(offGameConversations)
    .values({
      isGroup: false,
    })
    .returning();

  // add both participants
  await db.insert(offGameParticipants).values([
    {
      conversationId: conversation.id,
      characterId: currentCharacter.id,
    },
    {
      conversationId: conversation.id,
      characterId: targetCharacterId,
    },
  ]);

  // add first message
  await db.insert(offGameMessages).values({
    conversationId: conversation.id,
    content: message,
    senderId: currentCharacter.id,
  });

  return conversation;
}

export async function createGroupOffGameConversation(
  name: string,
  participantIds: string[],
  message: string,
): Promise<OffGameConversation> {
  const currentCharacter = await getCurrentCharacterIdOnly();

  // create the group conversation
  const [conversation] = await db
    .insert(offGameConversations)
    .values({
      isGroup: true,
      name,
      createdBy: currentCharacter.id,
    })
    .returning();

  // add all participants including the creator
  const participants = [currentCharacter.id, ...participantIds].map(
    (characterId) => ({
      conversationId: conversation.id,
      characterId,
    }),
  );

  await db.insert(offGameParticipants).values(participants);

  // Add first message
  await db.insert(offGameMessages).values({
    conversationId: conversation.id,
    content: message,
    senderId: currentCharacter.id,
  });

  return conversation;
}

export async function sendOffGameMessage(
  conversationId: string,
  content: string,
) {
  const t = await getTranslations();
  const currentCharacter = await getCurrentCharacterIdOnly();

  if (!currentCharacter.id)
    throw new Error(t("errors.gameChat.notInConversation"));

  // verify the character is a participant in this conversation
  const participant = await db
    .select()
    .from(offGameParticipants)
    .where(
      and(
        eq(offGameParticipants.conversationId, conversationId),
        eq(offGameParticipants.characterId, currentCharacter.id),
      ),
    )
    .limit(1);

  if (!participant.length) {
    throw new Error(t("errors.gameChat.notInConversation"));
  }

  // insert new message
  const [message] = await db
    .insert(offGameMessages)
    .values({
      conversationId,
      content,
      senderId: currentCharacter.id,
    })
    .returning();

  return message;
}
