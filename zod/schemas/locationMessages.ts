import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  locationActionMessages,
  locationMessage,
  locationSystemMessages,
  locationWhispers,
} from "@/database/schema/locationMessage";
import { characterSelectSchema } from "@/zod/schemas/character";

const locationMessageSchema = createSelectSchema(locationMessage);

const actionMessageSchema = createSelectSchema(locationActionMessages);
const whisperMessageSchema = createSelectSchema(locationWhispers);
const systemMessageSchema = createSelectSchema(locationSystemMessages);

// schema for selecting all messages
export const fullLocationMessageSchema = z.object({
  message: locationMessageSchema.extend({}),
  action: actionMessageSchema.pick({ tag: true }).nullable(),
  whisper: whisperMessageSchema.pick({ recipientCharacterId: true }).nullable(),
  system: systemMessageSchema
    .pick({ systemType: true, additionalData: true })
    .nullable(),
});

export const fullLocationMessagesSchema = z.array(fullLocationMessageSchema);

// schema for selecting all messages with character information
export const fullLocationMessageWithCharacterSchema = z.object({
  message: locationMessageSchema.extend({}).omit({ characterId: true }),
  action: actionMessageSchema.pick({ tag: true }).nullable(),
  whisper: whisperMessageSchema.pick({ recipientCharacterId: true }).nullable(),
  system: systemMessageSchema
    .pick({
      systemType: true,
      recipientCharacterId: true,
      additionalData: true,
    })
    .nullable(),
  character: characterSelectSchema
    .pick({
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      miniAvatarUrl: true,
      raceId: true,
    })
    .nullable(),
  recipientCharacter: characterSelectSchema
    .pick({
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      miniAvatarUrl: true,
    })
    .nullable(),
});

export const fullLocationMessagesWithCharactersSchema = z.array(
  fullLocationMessageWithCharacterSchema,
);
