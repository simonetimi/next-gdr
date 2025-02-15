import { z } from "zod";
import {
  characterSelectSchema,
  characterSheetSchemaWithCharacter,
} from "@/zod/schemas/character";

export type Character = z.infer<typeof characterSelectSchema>;
export type CharacterScheetWithCharacter = z.infer<
  typeof characterSheetSchemaWithCharacter
>;
