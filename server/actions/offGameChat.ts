"use server";

import { db } from "@/database/db";
import {
  offGameConversations,
  offGameParticipants,
} from "@/database/schema/offGameChat";
import { getCurrentCharacterIdOnly } from "@/server/character";

export async function createSingleConversation(
  targetCharacterId: string,
  message: string,
) {
  const currentCharacter = await getCurrentCharacterIdOnly();

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

  // TODO add first message

  return conversation;
}

export async function createGroupConversation(
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

  // TODO add first message

  await db.insert(offGameParticipants).values(participants);

  return conversation;
}
