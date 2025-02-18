import {
  fullLocationMessageSchema,
  fullLocationMessagesSchema,
  fullLocationMessageWithCharacterSchema,
} from "@/zod/schemas/locationMessages";
import { z } from "zod";

export type FullLocationMessages = z.infer<typeof fullLocationMessagesSchema>;

export type LocationMessage = z.infer<typeof fullLocationMessageSchema>;

export type LocationMessageWithCharacter = z.infer<
  typeof fullLocationMessageWithCharacterSchema
>;
