import { z } from "zod";
import {
  characterSelectSchema,
  characterSheetSchemaWithCharacter,
  minimalCharacterSchema,
} from "@/zod/schemas/character";

export type Character = z.infer<typeof characterSelectSchema>;
export type CharacterScheetWithCharacter = z.infer<
  typeof characterSheetSchemaWithCharacter
>;

export type MinimalCharacter = z.infer<typeof minimalCharacterSchema>;
