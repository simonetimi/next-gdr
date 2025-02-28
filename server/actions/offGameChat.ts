"use server";

import { db } from "@/database/db";
import {
  offGameConversations,
  offGameMessages,
  offGameParticipants,
} from "@/database/schema/offGameChat";
import { getCurrentCharacterIdOnly } from "@/server/character";
import { aliasedTable, and, eq } from "drizzle-orm";

export async function createSingleOffGameConversation(
  targetCharacterId: string,
  message: string,
) {
  const currentCharacter = await getCurrentCharacterIdOnly();
  const currentCharacterId = currentCharacter.id!;

  const p1 = aliasedTable(offGameParticipants, "p1");
  const p2 = aliasedTable(offGameParticipants, "p2");

  // if the conversation exists, return the id
  const [existingConversation] = await db
    .select({ id: offGameConversations.id })
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

  if (existingConversation) return existingConversation.id;

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

  // Add first message
  await db.insert(offGameMessages).values({
    conversationId: conversation.id,
    content: message,
    senderId: currentCharacter.id,
  });

  return conversation.id;
}

export async function createGroupOffGameConversation(
  name: string,
  participantIds: string[],
  message: string,
) {
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

  return conversation.id;
}
