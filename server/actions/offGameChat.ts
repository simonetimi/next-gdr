"use server";

import { db } from "@/database/db";
import {
  offGameConversations,
  offGameMessages,
  offGameParticipantDeletions,
  offGameParticipants,
} from "@/database/schema/offGameChat";
import { getCurrentCharacterIdOnly } from "@/server/character";
import { aliasedTable, and, eq, inArray } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { OffGameConversation } from "@/models/offGameChat";
import { characters } from "@/database/schema/character";

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

    // remove deletion records for the target user so conversation reappears
    await removeConversationDeletionRecords(
      existingConversation.conversation.id,
    );

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
      adminId: currentCharacter.id,
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

// delete a conversation just for the current participant
export async function deleteOffGameConversationForParticipant(
  conversationId: string,
): Promise<{ success: boolean }> {
  const t = await getTranslations();
  const currentCharacter = await getCurrentCharacterIdOnly();

  if (!currentCharacter.id)
    throw new Error(t("errors.gameChat.notInConversation"));

  // find the participant record for this character in this conversation
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

  // check if this is a group conversation
  const conversation = await db
    .select({
      isGroup: offGameConversations.isGroup,
    })
    .from(offGameConversations)
    .where(eq(offGameConversations.id, conversationId))
    .limit(1);

  // for group conversations, add a system message about the participant leaving
  if (conversation.length && conversation[0].isGroup) {
    // get the character's name for the system message
    const character = await db
      .select({ firstName: characters.firstName })
      .from(characters)
      .where(eq(characters.id, currentCharacter.id))
      .limit(1);

    if (character.length) {
      await db.insert(offGameMessages).values({
        conversationId,
        content: t("system.gameChat.hasLeftConversation", {
          characterName: character[0].firstName,
        }),
        isSystem: true,
      });
    }
  }

  // mark the conversation as deleted for this participant
  await db.insert(offGameParticipantDeletions).values({
    participantId: participant[0].id,
  });

  return { success: true };
}

// used in single conversations
async function removeConversationDeletionRecords(
  conversationId: string,
): Promise<void> {
  // get all participants of the conversation including the sender
  const participants = await db
    .select({
      participantId: offGameParticipants.id,
    })
    .from(offGameParticipants)
    .where(eq(offGameParticipants.conversationId, conversationId));

  if (participants.length > 0) {
    const participantIds = participants.map((p) => p.participantId);

    // remove deletion records for all participants
    await db
      .delete(offGameParticipantDeletions)
      .where(
        inArray(offGameParticipantDeletions.participantId, participantIds),
      );
  }
}

// used in group conversations
export async function addParticipantToConversation(
  conversationId: string,
  participantCharacterId: string,
): Promise<{ success: boolean }> {
  const t = await getTranslations();
  const currentCharacter = await getCurrentCharacterIdOnly();

  if (!currentCharacter.id)
    throw new Error(t("errors.game.characters.notFound"));

  // check if the conversation exists and is a group
  const conversation = await db
    .select({
      adminId: offGameConversations.adminId,
    })
    .from(offGameConversations)
    .where(eq(offGameConversations.id, conversationId))
    .limit(1);

  if (!conversation.length) {
    throw new Error(t("errors.gameChat.conversationNotFound"));
  }

  // only the administrator can add participants
  if (conversation[0].adminId !== currentCharacter.id) {
    throw new Error(t("errors.gameChat.onlyChatAdmin"));
  }

  // check if the character to add exists
  const characterToAdd = await db
    .select({
      id: characters.id,
      firstName: characters.firstName,
    })
    .from(characters)
    .where(eq(characters.id, participantCharacterId))
    .limit(1);

  if (!characterToAdd.length) {
    throw new Error(t("errors.game.characters.notFound"));
  }

  // check if the participant is already in the conversation
  const existingParticipant = await db
    .select()
    .from(offGameParticipants)
    .where(
      and(
        eq(offGameParticipants.conversationId, conversationId),
        eq(offGameParticipants.characterId, participantCharacterId),
      ),
    )
    .limit(1);

  if (existingParticipant.length) {
    // if the participant exists but was previously removed, remove the deletion record
    await db
      .delete(offGameParticipantDeletions)
      .where(
        eq(
          offGameParticipantDeletions.participantId,
          existingParticipant[0].id,
        ),
      );
  } else {
    // add the new participant to the conversation
    await db.insert(offGameParticipants).values({
      conversationId,
      characterId: participantCharacterId,
    });
  }

  // add system message about addition
  await db.insert(offGameMessages).values({
    conversationId,
    content: t("system.gameChat.addedToConversation", {
      characterName: characterToAdd[0].firstName,
    }),
    isSystem: true,
  });

  return { success: true };
}

// used in group conversations
export async function removeParticipantFromConversation(
  conversationId: string,
  participantCharacterId: string,
): Promise<{ success: boolean }> {
  const t = await getTranslations();
  const currentCharacter = await getCurrentCharacterIdOnly();

  if (!currentCharacter.id)
    throw new Error(t("errors.game.characters.notFound"));

  // check if the conversation exists and is a group
  const conversation = await db
    .select({
      isGroup: offGameConversations.isGroup,
      adminId: offGameConversations.adminId,
    })
    .from(offGameConversations)
    .where(eq(offGameConversations.id, conversationId))
    .limit(1);

  if (!conversation.length) {
    throw new Error(t("errors.gameChat.conversationNotFound"));
  }

  // only the administrator can remove participants
  if (conversation[0].adminId !== currentCharacter.id) {
    throw new Error(t("errors.gameChat.onlyChatAdmin"));
  }

  // find the participant to remove
  const participantToRemove = await db
    .select({
      id: offGameParticipants.id,
      characterId: offGameParticipants.characterId,
    })
    .from(offGameParticipants)
    .where(
      and(
        eq(offGameParticipants.conversationId, conversationId),
        eq(offGameParticipants.characterId, participantCharacterId),
      ),
    )
    .limit(1);

  if (!participantToRemove.length) {
    throw new Error(t("errors.gameChat.participantNotFound"));
  }

  // get the participant's name for the system message
  const removedCharacter = await db
    .select({ firstName: characters.firstName })
    .from(characters)
    .where(eq(characters.id, participantCharacterId))
    .limit(1);

  // mark the participant as deleted
  await db.insert(offGameParticipantDeletions).values({
    participantId: participantToRemove[0].id,
  });

  // add system message about removal
  if (removedCharacter.length) {
    await db.insert(offGameMessages).values({
      conversationId,
      content: t("system.gameChat.removedFromConversation", {
        characterName: removedCharacter[0].firstName,
      }),
      isSystem: true,
    });
  }

  return { success: true };
}

// used in group conversations
export async function editGroupConversationName(
  conversationId: string,
  newName: string,
) {
  const t = await getTranslations();
  const currentCharacter = await getCurrentCharacterIdOnly();

  if (!currentCharacter.id)
    throw new Error(t("errors.game.characters.notFound"));

  // check if the conversation exists and is a group
  const conversation = await db
    .select({
      name: offGameConversations.name,
      adminId: offGameConversations.adminId,
    })
    .from(offGameConversations)
    .where(eq(offGameConversations.id, conversationId))
    .limit(1);

  if (!conversation.length) {
    throw new Error(t("errors.gameChat.conversationNotFound"));
  }

  // only the administrator can edit the name
  if (conversation[0].adminId !== currentCharacter.id) {
    throw new Error(t("errors.gameChat.onlyChatAdmin"));
  }

  // update the conversation name
  await db
    .update(offGameConversations)
    .set({ name: newName })
    .where(eq(offGameConversations.id, conversationId));

  // add system message about the name change
  await db.insert(offGameMessages).values({
    conversationId,
    content: t("system.gameChat.conversationRenamed", { newName }),
    isSystem: true,
  });

  return newName;
}

// used in group conversations
export async function deleteGroupConversation(
  conversationId: string,
): Promise<{ success: boolean }> {
  const t = await getTranslations();
  const currentCharacter = await getCurrentCharacterIdOnly();

  if (!currentCharacter.id)
    throw new Error(t("errors.game.characters.notFound"));

  // check if the conversation exists and is a group
  const conversation = await db
    .select({
      adminId: offGameConversations.adminId,
      name: offGameConversations.name,
    })
    .from(offGameConversations)
    .where(eq(offGameConversations.id, conversationId))
    .limit(1);

  if (!conversation.length) {
    throw new Error(t("errors.gameChat.conversationNotFound"));
  }

  // only the administrator can delete the conversation
  if (conversation[0].adminId !== currentCharacter.id) {
    throw new Error(t("errors.gameChat.onlyChatAdmin"));
  }

  // get all participants in the conversation
  const participants = await db
    .select({
      id: offGameParticipants.id,
    })
    .from(offGameParticipants)
    .where(eq(offGameParticipants.conversationId, conversationId));

  // mark all participants as deleted
  if (participants.length > 0) {
    await db.insert(offGameParticipantDeletions).values(
      participants.map((p) => ({
        participantId: p.id,
      })),
    );
  }

  return { success: true };
}

export async function changeGroupConversationAdmin(
  conversationId: string,
  newAdminId: string,
): Promise<void> {
  const t = await getTranslations();

  const character = await getCurrentCharacterIdOnly();

  // verify the conversation exists and is a group chat
  const [conversation] = await db
    .select()
    .from(offGameConversations)
    .where(eq(offGameConversations.id, conversationId))
    .limit(1);

  // check if current user is the admin
  if (conversation.adminId !== character.id) {
    throw new Error(t("errors.gameChat.onlyChatAdmin"));
  }

  // check if the new admin is a participant in the conversation
  const [newAdminParticipant] = await db
    .select()
    .from(offGameParticipants)
    .where(
      and(
        eq(offGameParticipants.conversationId, conversationId),
        eq(offGameParticipants.characterId, newAdminId),
      ),
    )
    .limit(1);

  if (!newAdminParticipant) {
    throw new Error(t("errors.gameChat.newAdminNotInParticipants"));
  }

  // update the admin ID
  await db
    .update(offGameConversations)
    .set({ adminId: newAdminId })
    .where(eq(offGameConversations.id, conversationId));
}
